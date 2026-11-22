import { CheckNote } from '@/components/guides/Fill';
import { FLOW_CHECKS } from '@/lib/poe1/guides/temple/content';
import {
  APEX_NOTE,
  EXAMPLES,
  KEY_ROOMS,
} from '@/lib/poe1/guides/temple/decisions';
import { DecisionExample } from './DecisionExample';

const BASICS = [
  {
    title: 'Read Alva’s preview',
    body: [
      'Before each Incursion, open the room in Alva’s Temple view. The preview lists both Architects, each with what killing them does: “Kill to upgrade to …” or “Kill to change to …”.',
      'Kill the Architect whose line names the result you want. Decide which door you would open before you go in.',
    ],
  },
  {
    title: 'Pick the surviving Architect',
    body: [
      'You kill one Architect. The survivor shapes the room, which is why the preview names the result next to the one you kill.',
      'If the survivor already built that room, it goes up a tier. If not, it becomes one of the survivor’s rooms and what was there is lost.',
    ],
  },
  {
    title: 'Use a Stone of Passage',
    body: [
      'Monsters in the Incursion can drop a Stone of Passage. Place it in an Altar of Passage to open that door.',
      'Open doors are lit green, closed ones red. Spend the Stone before the Incursion ends.',
    ],
  },
  {
    title: 'Trace the route to the Entrance',
    body: [
      'A room is only reachable if every door between it and the Entrance is open. Follow the doors from the target room down to the Entrance.',
      'The first closed door on that path is the one to open. A door anywhere else does not help this room.',
    ],
  },
];

/** Architect and door decisions: basics, two worked examples, key rooms. */
export function Decisions() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {BASICS.map(b => (
          <div key={b.title} className="panel-inset space-y-1.5 p-4">
            <h3 className="font-semibold text-forge-goldbright">{b.title}</h3>
            {b.body.map(line => (
              <p
                key={line}
                className="text-sm leading-relaxed text-forge-muted"
              >
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
      <CheckNote fromRun>{FLOW_CHECKS.alvaPreview}</CheckNote>

      {EXAMPLES.map(ex => (
        <DecisionExample key={ex.id} example={ex} />
      ))}

      <div className="space-y-3">
        <h3 className="display text-xl">The rooms that matter for this farm</h3>
        <div className="table-scroll">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-forge-muted">
              <tr className="border-b border-forge-border">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Room
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Tier chain
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Why it matters
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Basis
                </th>
              </tr>
            </thead>
            <tbody>
              {KEY_ROOMS.map(r => (
                <tr
                  key={r.name}
                  className="border-b border-forge-border/60 align-top"
                >
                  <th
                    scope="row"
                    className="py-3 pr-3 font-semibold text-forge-goldbright"
                  >
                    {r.name}
                  </th>
                  <td className="py-3 pr-3 text-forge-muted">{r.chain}</td>
                  <td className="py-3 pr-3 leading-relaxed text-forge-muted">
                    {r.why}
                  </td>
                  <td className="py-3 text-xs text-forge-muted">{r.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-inset space-y-1 p-4">
          <h4 className="font-semibold text-forge-goldbright">
            When Apex access matters
          </h4>
          <p className="text-sm leading-relaxed text-forge-muted">
            {APEX_NOTE}
          </p>
        </div>
      </div>
    </div>
  );
}
