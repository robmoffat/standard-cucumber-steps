using Finos.CucumberTestingSteps.World;

namespace Finos.CucumberTestingSteps.Support;

public interface IRowFieldMatcher
{
    bool MatchesField(string field);
    bool MatchField(PropsWorld world, string field, string expected, object? rowData);
}
