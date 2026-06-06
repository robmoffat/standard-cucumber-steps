package io.github.robmoffat.support;

import io.github.robmoffat.world.PropsWorld;

/**
 * Pluggable matcher for Gherkin table columns with custom semantics.
 *
 * <p>Register implementations via {@link MatchingUtils#registerFieldMatcher(RowFieldMatcher)}.
 */
public interface RowFieldMatcher {
    /**
     * @param field the table column header
     * @return {@code true} if this matcher handles the given column
     */
    boolean matchesField(String field);

    /**
     * @param world the test world used for resolution and logging
     * @param field the table column header
     * @param expected the expected cell value from the Gherkin table
     * @param rowData the actual object being compared
     * @return {@code true} if the field matches
     */
    boolean matchField(PropsWorld world, String field, String expected, Object rowData);
}
