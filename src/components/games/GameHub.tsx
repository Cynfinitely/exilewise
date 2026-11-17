import { GAME_TOOLS, GameToolGrid } from '@/components/home/tools';
import { Alert } from '@/components/ui/Alert';
import { GAMES, navGroupsFor, type GameId } from '@/lib/games/config';
import { getSelectedLeague } from '@/lib/games/selection';

/** Landing page of one game's section: its tools for the selected league. */
export async function GameHub({ game }: { game: GameId }) {
  const league = await getSelectedLeague(game);
  const tools = GAME_TOOLS.find(g => g.id === game);
  const hiddenLeagueTools = GAMES[game].nav.filter(
    g => g.leagueMatch && !navGroupsFor(game, league).includes(g)
  );

  return (
    <div className="space-y-12">
      <header className="pt-2 text-center">
        <p className="eyebrow">{league} league</p>
        <h1 className="display mt-3 text-4xl sm:text-5xl">
          {GAMES[game].name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-forge-muted">
          Tools for the league you play. Change league from the top bar and the
          menu follows its mechanics.
        </p>
        <div className="ornament mx-auto mt-6 max-w-md">
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-forge-gold" />
        </div>
      </header>
      {hiddenLeagueTools.length ? (
        <Alert tone="info" title="Some tools are league-specific">
          {hiddenLeagueTools.map(g => g.label).join(', ')} tools are not in the{' '}
          {league} menu, because that mechanic is not part of {league}. Pick
          that league in the top bar to see them in the menu. The pages below
          still work as a reference.
        </Alert>
      ) : null}
      {tools ? <GameToolGrid game={tools} /> : null}
    </div>
  );
}
