using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Reqnroll;
using StandardCucumberSteps.World;

namespace StandardCucumberSteps.Support;

public static class MatchingUtils
{
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
            var found = token.SelectToken("$." + field);
            var foundStr = found?.ToString();
            var resolvedExpected = HandleResolve(expected, world);
            var expectedStr = resolvedExpected?.ToString();

            if (foundStr != expectedStr)
            {
                world.Log($"Match failed on {field}: '{foundStr}' vs '{expectedStr}'");
                return false;
            }
        }
        return true;
    }

    /// <summary>
    /// Assert that an array exactly matches the DataTable (same length, same order).
    /// </summary>
    public static void MatchData(PropsWorld world, IList<object?> actual, DataTable dt)
    {
        var tableData = dt.CreateSet<Dictionary<string, string>>().ToList();
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
        var tableData = dt.CreateSet<Dictionary<string, string>>().ToList();
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
