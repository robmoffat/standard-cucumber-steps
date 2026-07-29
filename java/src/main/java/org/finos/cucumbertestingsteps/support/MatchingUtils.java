package org.finos.cucumbertestingsteps.support;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.finos.cucumbertestingsteps.world.PropsWorld;
import org.apache.commons.jxpath.JXPathContext;
import org.apache.commons.jxpath.JXPathNotFoundException;

import io.cucumber.datatable.DataTable;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Utility class for matching and resolving test data.
 */
public final class MatchingUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final List<RowFieldMatcher> FIELD_MATCHERS = new CopyOnWriteArrayList<>();
    private static final String REGEX_SUFFIX = "_regex";

    private MatchingUtils() {
    }

    /**
     * Register a custom matcher for Gherkin table columns (e.g. columns ending in {@code _regex}).
     *
     * @param matcher the matcher to add
     */
    public static void registerFieldMatcher(RowFieldMatcher matcher) {
        FIELD_MATCHERS.add(matcher);
    }

    /** Clear all registered field matchers. */
    public static void clearFieldMatchers() {
        FIELD_MATCHERS.clear();
    }

    /**
     * Path within row data for a column ending with {@code suffix}, or {@code null} if not applicable.
     *
     * @param field the field name to inspect
     * @param suffix the suffix to remove
     * @return the field path without the suffix, an empty string if the suffix consumes the whole field,
     *         or {@code null} if the field does not end with the suffix
     */
    public static String pathForFieldSuffix(String field, String suffix) {
        if (!field.endsWith(suffix)) {
            return null;
        }
        if (field.length() == suffix.length()) {
            return "";
        }
        String stem = field.substring(0, field.length() - suffix.length());
        if (stem.endsWith(".")) {
            stem = stem.substring(0, stem.length() - 1);
        }
        return stem;
    }

    private static RowFieldMatcher findFieldMatcher(String field) {
        for (RowFieldMatcher matcher : FIELD_MATCHERS) {
            if (matcher.matchesField(field)) {
                return matcher;
            }
        }
        return null;
    }

    private static Object extractFromWorld(Object world, String expression) {
        try {
            JXPathContext context = JXPathContext.newContext(world);
            context.setLenient(true);
            String xpathName = "/" + expression.replaceAll("\\.", "/");
            xpathName = xpathName.replaceAll("(/[^/]+)/length$", "count($1)");
            Matcher matcher = Pattern.compile("\\[(\\d+)\\]").matcher(xpathName);
            StringBuffer sb = new StringBuffer();
            while (matcher.find()) {
                int index = Integer.parseInt(matcher.group(1));
                matcher.appendReplacement(sb, "[" + (index + 1) + "]");
            }
            matcher.appendTail(sb);
            xpathName = sb.toString();
            Object result = context.getValue(xpathName);
            if (result instanceof java.util.Optional) {
                result = ((java.util.Optional<?>) result).orElse(null);
            }
            if (result instanceof Number) {
                double d = ((Number) result).doubleValue();
                if (d == Math.floor(d) && !Double.isInfinite(d)) {
                    return (long) d;
                }
                return d;
            }
            return result;
        } catch (JXPathNotFoundException e) {
            return null;
        }
    }

    /**
     * Resolve a field reference to its actual value.
     *
     * @param name the value or placeholder expression
     * @param world the world used to resolve placeholder expressions
     * @return the resolved value
     */
    public static Object handleResolve(String name, PropsWorld world) {
        if (name.startsWith("{") && name.endsWith("}")) {
            String stripped = name.substring(1, name.length() - 1);

            if ("null".equals(stripped)) {
                return null;
            } else if ("true".equals(stripped)) {
                return true;
            } else if ("false".equals(stripped)) {
                return false;
            } else if (isNumeric(stripped)) {
                return Double.parseDouble(stripped);
            } else {
                return extractFromWorld(world, stripped);
            }
        } else {
            return name;
        }
    }

    private static boolean isNumeric(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Check if a table row matches the given data object.
     *
     * @param world the test world used for resolution and logging
     * @param row the expected row values
     * @param data the actual object to inspect
     * @return {@code true} if the row matches; otherwise {@code false}
     */
    public static boolean doesRowMatch(PropsWorld world, Map<String, String> row, Object data) {
        for (Map.Entry<String, String> entry : row.entrySet()) {
            String field = entry.getKey();
            String expected = entry.getValue();

            RowFieldMatcher matcher = findFieldMatcher(field);
            if (matcher != null) {
                if (!matcher.matchField(world, field, expected, data)) {
                    return false;
                }
                continue;
            }

            try {
                Object found = extractFromWorld(data, field);
                Object resolved = handleResolve(expected, world);

                if (!valuesEqual(found, resolved, field)) {
                    world.log(String.format(
                            "Match failed on %s: '%s' vs '%s'", field, found, resolved));
                    return false;
                }
            } catch (JXPathNotFoundException e) {
                world.log("Path not found: " + field);
                return false;
            } catch (Exception e) {
                world.log("Error: " + e.getMessage());
                return false;
            }
        }

        return true;
    }

    /**
     * Test-only matcher registered from {@code TestHooks}.
     *
     * @return a field matcher that applies regex matching to fields ending in {@value #REGEX_SUFFIX}
     */
    public static RowFieldMatcher createRegexFieldMatcher() {
        return new RowFieldMatcher() {
            @Override
            public boolean matchesField(String field) {
                return field.endsWith(REGEX_SUFFIX);
            }

            @Override
            public boolean matchField(PropsWorld world, String field, String expected, Object rowData) {
                String path = pathForFieldSuffix(field, REGEX_SUFFIX);
                if (path == null) {
                    return false;
                }
                Object found = path.isEmpty() ? rowData : extractFromWorld(rowData, path);
                String foundStr = found == null ? "" : String.valueOf(found);
                try {
                    if (!Pattern.compile(expected).matcher(foundStr).find()) {
                        world.log(String.format("Regex match failed on %s: '%s' vs /%s/", field, foundStr, expected));
                        return false;
                    }
                    return true;
                } catch (Exception e) {
                    world.log("Invalid regex for " + field + ": " + e.getMessage());
                    return false;
                }
            }
        };
    }

    /**
     * Compare actual and expected values the way TypeScript does ({@code found != resolved}):
     * numeric loose equality, then direct equality, then string forms, then wire-shaped nested
     * objects (e.g. detached signatures with {@code signature}/{@code protected} keys).
     */
    private static boolean valuesEqual(Object found, Object resolved, String field) {
        if (found == null && resolved == null) {
            return true;
        }
        if (found == null || resolved == null) {
            return false;
        }

        if (found instanceof Number && resolved instanceof Number) {
            return ((Number) found).doubleValue() == ((Number) resolved).doubleValue();
        }

        if (Objects.equals(found, resolved)) {
            return true;
        }

        if (Objects.equals(String.valueOf(found), String.valueOf(resolved))) {
            return true;
        }

        if (resolved instanceof String) {
            String extracted = extractComparableString(found, field);
            if (extracted != null) {
                return Objects.equals(extracted, resolved);
            }
        }

        return false;
    }

    /**
     * When a table cell expects a string but the data object holds a nested bean/map
     * (e.g. detached signature), compare against the conventional wire keys.
     */
    @SuppressWarnings("unchecked")
    private static String extractComparableString(Object value, String field) {
        if (value == null) {
            return null;
        }
        if (value instanceof String) {
            return (String) value;
        }

        Map<String, Object> asMap;
        if (value instanceof Map) {
            asMap = (Map<String, Object>) value;
        } else {
            try {
                asMap = objectMapper.convertValue(value, Map.class);
            } catch (IllegalArgumentException e) {
                return null;
            }
        }

        if (field.endsWith(".signature.protected")) {
            Object protectedHeader = asMap.get("protected");
            return protectedHeader == null ? null : String.valueOf(protectedHeader);
        }
        if (field.endsWith(".signature.signature")) {
            Object signature = asMap.get("signature");
            return signature == null ? null : String.valueOf(signature);
        }
        if (field.endsWith(".signature") || "signature".equals(field)) {
            Object signature = asMap.get("signature");
            if (signature != null) {
                return String.valueOf(signature);
            }
        }

        return null;
    }

    /**
     * Find the index of a matching row in the list.
     *
     * @param world the test world used for resolution and logging
     * @param rows the expected rows to search
     * @param data the actual object to compare against
     * @return the index of the first matching row, or {@code -1} if none match
     */
    public static int indexOf(PropsWorld world, List<Map<String, String>> rows, Object data) {
        for (int i = 0; i < rows.size(); i++) {
            if (doesRowMatch(world, rows.get(i), data)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Match an array of data against a Cucumber DataTable (exact match).
     *
     * @param world the test world used for resolution and logging
     * @param actual the actual data
     * @param dt the expected data table
     */
    public static void matchData(PropsWorld world, List<?> actual, DataTable dt) {
        List<Map<String, String>> tableData = dt.asMaps();
        int rowCount = tableData.size();

        world.log(String.format("result %s length %d", formatJson(actual), actual.size()));
        assertEquals(rowCount, actual.size(), "Array length mismatch");

        List<Object> unmatched = new ArrayList<>();
        int row = 0;
        for (Object item : actual) {
            Map<String, String> matchingRow = tableData.get(row);
            row++;
            if (!doesRowMatch(world, matchingRow, item)) {
                world.log("Couldn't match row: " + formatJson(item));
                unmatched.add(item);
            }
        }

        assertTrue(unmatched.isEmpty(), "Some rows could not be matched: " + formatJson(unmatched));
    }

    /**
     * Match an array — at least the given rows must be present.
     *
     * @param world the test world used for resolution and logging
     * @param actual the actual data
     * @param dt the expected data table
     */
    public static void matchDataAtLeast(PropsWorld world, List<?> actual, DataTable dt) {
        List<Map<String, String>> tableData = dt.asMaps();
        for (Map<String, String> expectedRow : tableData) {
            boolean found = false;
            for (Object item : actual) {
                if (doesRowMatch(world, expectedRow, item)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                world.log("Expected row not found: " + formatJson(expectedRow));
            }
            assertTrue(found, "Expected row not found: " + formatJson(expectedRow));
        }
    }

    /**
     * Assert none of the given rows are present in the array.
     *
     * @param world the test world used for resolution and logging
     * @param actual the actual data
     * @param dt the rows that must not be present
     */
    public static void matchDataDoesntContain(PropsWorld world, List<?> actual, DataTable dt) {
        List<Map<String, String>> tableData = dt.asMaps();
        for (Map<String, String> unwantedRow : tableData) {
            for (Object item : actual) {
                boolean found = doesRowMatch(world, unwantedRow, item);
                if (found) {
                    world.log("Unwanted row found: " + formatJson(unwantedRow));
                }
                assertTrue(!found, "Unwanted row found: " + formatJson(unwantedRow));
            }
        }
    }

    private static String formatJson(Object obj) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return String.valueOf(obj);
        }
    }
}
