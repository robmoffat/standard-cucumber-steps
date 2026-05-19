using StandardCucumberSteps.World;

namespace StandardCucumberSteps.Support;

public interface IRowFieldMatcher
{
    bool MatchesField(string field);
    bool MatchField(PropsWorld world, string field, string expected, object? rowData);
}
