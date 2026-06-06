using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Reqnroll;
using StandardCucumberSteps.World;

namespace StandardCucumberSteps.Support;

public static class MatchingUtils
{
    private static readonly List<IRowFieldMatcher> FieldMatchers = new();
    private const string RegexSuffix = "_regex";

    public static void RegisterFieldMatcher(IRowFieldMatcher matcher) => FieldMatchers.Add(matcher);

    public static void ClearFieldMatchers() => FieldMatchers.Clear();

    public static string? PathForFieldSuffix(string field, string suffix)
    {
        if (!field.EndsWith(suffix))
            return null;
        if (field.Length == suffix.Length)
            return "";
        var stem = field[..^suffix.Length];
        if (stem.EndsWith('.'))
            stem = stem[..^1];
        return stem;
    }

    private static IRowFieldMatcher? FindFieldMatcher(string field) =>
        FieldMatchers.FirstOrDefault(m => m.MatchesField(field));

    public static IRowFieldMatcher CreateRegexFieldMatcher() => new RegexFieldMatcher();

    /// <summary>
    /// Convert a DataTable to row maps using header cells as keys (supports dotted paths like nested.score).
    /// </summary>
    public static List<Dictionary<string, string>> TableToRowMaps(DataTable dt)
    {
        var headers = dt.Header.ToList();
        return dt.Rows.Select(row =>
        {
            var dict = new Dictionary<string, string>();
            for (var i = 0; i < headers.Count; i++)
                dict[headers[i]] = row[i];
            return dict;
        }).ToList();
    }

    private sealed class RegexFieldMatcher : IRowFieldMatcher
    {
        public bool MatchesField(string field) => field.EndsWith(RegexSuffix);

        public bool MatchField(PropsWorld world, string field, string expected, object? rowData)
        {
            var path = PathForFieldSuffix(field, RegexSuffix);
            if (path == null)
                return false;
            var json = JsonConvert.SerializeObject(rowData);
            var token = JToken.Parse(json);
            var found = string.IsNullOrEmpty(path) ? token : token.SelectToken("$." + path);
            var foundStr = found?.ToString() ?? "";
            try
            {
                if (!System.Text.RegularExpressions.Regex.IsMatch(foundStr, expected))
                {
                    world.Log($"Regex match failed on {field}: '{foundStr}' vs /{expected}/");
                    return false;
                }
                return true;
            }
            catch (Exception e)
            {
                world.Log($"Invalid regex for {field}: {e.Message}");
                return false;
            }
        }
    }

    /// <summary>
    /// Resolve a field reference: {null}, {true}, {false}, {number}, {varPath} or literal string.
    /// </summary>
    public static object? HandleResolve(string name, PropsWorld world)
    {
        if (name.StartsWith("{") && name.EndsWith("}"))
        {
            var stripped = name[1..^1];
            return stripped switch
            {
                "null" => null,
                "true" => true,
                "false" => false,
                _ when double.TryParse(stripped, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var d) => d,
                _ => ResolveFromProps(stripped, world)
            };
        }
        return name;
    }

    private static object? ResolveFromProps(string path, PropsWorld world)
    {
        // Direct key lookup first
        if (world.Props.TryGetValue(path, out var direct))
            return direct;

        // Try to resolve path with dots/brackets: "nested.name" or "arr[0].id"
        var rootMatch = System.Text.RegularExpressions.Regex.Match(path, @"^([^\.\[]+)(.*)$");
        if (rootMatch.Success)
        {
            var rootKey = rootMatch.Groups[1].Value;
            var remainder = rootMatch.Groups[2].Value;
            
            if (world.Props.TryGetValue(rootKey, out var rootValue) && !string.IsNullOrEmpty(remainder))
            {
                // Use JSONPath on the root value
                try
                {
                    var json = JsonConvert.SerializeObject(rootValue);
                    var token = JToken.Parse(json);
                    // Remainder starts with . or [ - adjust for JSONPath
                    var jsonPath = remainder.StartsWith(".") ? "$" + remainder : "$" + remainder;
                    var result = token.SelectToken(jsonPath);
                    return result?.ToObject<object?>();
                }
                catch
                {
                    return null;
                }
            }
        }

        // Fallback: JSONPath against entire serialized props
        try
        {
            var json = JsonConvert.SerializeObject(world.Props);
            var token = JToken.Parse(json);
            var result = token.SelectToken("$." + path);
            return result?.ToObject<object?>();
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Check if an actual data object matches a row of expected field→value pairs.
    /// </summary>
    public static bool DoesRowMatch(PropsWorld world, IDictionary<string, string> row, object? data)
    {
        var json = JsonConvert.SerializeObject(data);
        var token = JToken.Parse(json);

        foreach (var (field, expected) in row)
        {
            var matcher = FindFieldMatcher(field);
            if (matcher != null)
            {
                if (!matcher.MatchField(world, field, expected, data))
                    return false;
                continue;
            }

            var found = token.SelectToken("$." + field);
            var resolvedExpected = HandleResolve(expected, world);
            var foundValue = JTokenToComparable(found);

            if (!ValuesEqual(foundValue, resolvedExpected))
            {
                world.Log($"Match failed on {field}: '{foundValue}' vs '{resolvedExpected}'");
                return false;
            }
        }
        return true;
    }

    private static object? JTokenToComparable(JToken? token)
    {
        if (token == null || token.Type == JTokenType.Null)
            return null;
        if (token.Type == JTokenType.Integer || token.Type == JTokenType.Float)
            return token.Value<double>();
        if (token.Type == JTokenType.Boolean)
            return token.Value<bool>();
        return token.ToObject<object?>();
    }

    /// <summary>
    /// Compare values the way TypeScript does ({@code found != resolved}): numeric loose equality,
    /// then direct equality, then string forms.
    /// </summary>
    private static bool ValuesEqual(object? found, object? resolved)
    {
        if (found == null && resolved == null)
            return true;
        if (found == null || resolved == null)
            return false;

        if (TryToDouble(found, out var foundNum) && TryToDouble(resolved, out var resolvedNum))
            return foundNum == resolvedNum;

        if (Equals(found, resolved))
            return true;

        return string.Equals(Convert.ToString(found), Convert.ToString(resolved), StringComparison.Ordinal);
    }

    private static bool TryToDouble(object value, out double result)
    {
        switch (value)
        {
            case double d:
                result = d;
                return true;
            case float f:
                result = f;
                return true;
            case int i:
                result = i;
                return true;
            case long l:
                result = l;
                return true;
            case decimal m:
                result = (double)m;
                return true;
            case short s:
                result = s;
                return true;
            case byte b:
                result = b;
                return true;
            case JValue j when j.Type == JTokenType.Integer || j.Type == JTokenType.Float:
                result = j.Value<double>();
                return true;
            default:
                result = 0;
                return false;
        }
    }

    /// <summary>
    /// Assert that an array exactly matches the DataTable (same length, same order).
    /// </summary>
    public static void MatchData(PropsWorld world, IList<object?> actual, DataTable dt)
    {
        var tableData = TableToRowMaps(dt);
        Assert.That(actual.Count, Is.EqualTo(tableData.Count), "Array length mismatch");

        var unmatched = new List<object?>();
        for (int i = 0; i < actual.Count; i++)
        {
            if (!DoesRowMatch(world, tableData[i], actual[i]))
            {
                world.Log($"Couldn't match row: {JsonConvert.SerializeObject(actual[i])}");
                unmatched.Add(actual[i]);
            }
        }
        Assert.That(unmatched, Is.Empty, $"Some rows could not be matched: {JsonConvert.SerializeObject(unmatched)}");
    }

    /// <summary>
    /// Assert that all expected rows exist somewhere in the actual array.
    /// </summary>
    public static void MatchDataAtLeast(PropsWorld world, IList<object?> actual, DataTable dt)
    {
        var tableData = TableToRowMaps(dt);
        foreach (var expectedRow in tableData)
        {
            var found = actual.Any(item => DoesRowMatch(world, expectedRow, item));
            Assert.That(found, Is.True, $"Expected row not found: {JsonConvert.SerializeObject(expectedRow)}");
        }
    }

    /// <summary>
    /// Assert that none of the unwanted rows exist in the actual array.
    /// </summary>
    public static void MatchDataDoesntContain(PropsWorld world, IList<object?> actual, DataTable dt)
    {
        var headers = dt.Header.ToList();
        foreach (var row in dt.Rows)
        {
            var unwantedRow = new Dictionary<string, string>();
            for (int i = 0; i < headers.Count; i++)
            {
                unwantedRow[headers[i]] = row[i];
            }
            
            if (unwantedRow.Count == 0) continue; // Skip empty rows
            
            foreach (var item in actual)
            {
                var found = DoesRowMatch(world, unwantedRow, item);
                Assert.That(found, Is.False, $"Unwanted row found: {JsonConvert.SerializeObject(unwantedRow)}");
            }
        }
    }
}
