package io.github.robmoffat.support;

import io.github.robmoffat.world.PropsWorld;

/** Pluggable matcher for Gherkin table columns with custom semantics. */
public interface RowFieldMatcher {
    boolean matchesField(String field);

    boolean matchField(PropsWorld world, String field, String expected, Object rowData);
}
