package io.github.robmoffat.support;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.robmoffat.world.PropsWorld;
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

    private MatchingUtils() {
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
                return String.valueOf(Math.round(((Number) result).doubleValue()));
            }
            return result;
        } catch (JXPathNotFoundException e) {
            return null;
        }
    }

    /**
     * Resolve a field reference to its actual value.
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
     */
    public static boolean doesRowMatch(PropsWorld world, Map<String, String> row, Object data) {
        for (Map.Entry<String, String> entry : row.entrySet()) {
            String field = entry.getKey();
            String expected = entry.getValue();

            try {
                Object found = extractFromWorld(data, field);
                Object resolved = handleResolve(expected, world);

                if (!Objects.equals(asString(found), asString(resolved))) {
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

    private static String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    /**
     * Find the index of a matching row in the list.
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
