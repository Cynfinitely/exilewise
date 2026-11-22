import type {
  Door,
  RoomKind,
  RoomNode,
} from '@/lib/poe1/guides/temple/decisions';

const CELL_W = 200;
const CELL_H = 108;
const NODE_W = 144;
const NODE_H = 62;
const PAD = 14;

const NODE_STYLE: Record<RoomKind, string> = {
  entrance: 'fill-forge-sky stroke-info-fg',
  target: 'fill-forge-peach stroke-forge-gold',
  apex: 'fill-aurora-violet/15 stroke-aurora-violet',
  room: 'fill-forge-panel2 stroke-forge-border',
};

/** Splits a room name into lines of at most `max` characters. */
function wrap(label: string, max = 17): string[] {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length <= max) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else lines.push(word);
  }
  return lines;
}

function doorStroke(d: Door): string {
  if (d.action) return 'stroke-forge-gold';
  return d.open ? 'stroke-aurora-teal' : 'stroke-danger-fg';
}

function doorText(d: Door): string {
  if (d.action) return 'closed: open this door';
  return d.open ? 'open' : 'closed';
}

/**
 * Original, illustrative Temple layout: rooms as labelled nodes, doors as
 * lines. Open doors are solid with "↔", closed doors dashed with "✕", and
 * the door to open is gold with "★ OPEN". A text list repeats every
 * connection so nothing depends on colour or on seeing the drawing.
 */
export function RoomDiagram({
  id,
  rooms,
  doors,
  summary,
}: {
  id: string;
  rooms: RoomNode[];
  doors: Door[];
  summary: string;
}) {
  const minCol = Math.min(...rooms.map(r => r.col));
  const maxCol = Math.max(...rooms.map(r => r.col));
  const maxRow = Math.max(...rooms.map(r => r.row));
  const width = (maxCol - minCol + 1) * CELL_W + PAD * 2;
  const height = (maxRow + 1) * CELL_H + PAD * 2;
  const byId = new Map(rooms.map(r => [r.id, r]));
  const centre = (r: RoomNode) => ({
    x: PAD + (r.col - minCol) * CELL_W + CELL_W / 2,
    y: PAD + r.row * CELL_H + CELL_H / 2,
  });
  const name = (roomId: string) => {
    const r = byId.get(roomId);
    return r ? `${r.label}${r.tier ? ` (tier ${r.tier})` : ''}` : roomId;
  };
  const segments = doors.flatMap(d => {
    const a = byId.get(d.from);
    const b = byId.get(d.to);
    if (!a || !b) return [];
    const p = centre(a);
    const q = centre(b);
    return [{ d, p, q, mx: (p.x + q.x) / 2, my: (p.y + q.y) / 2 }];
  });

  return (
    <figure className="space-y-3">
      <div className="panel-inset overflow-x-auto p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
          className="mx-auto block h-auto w-full min-w-[32rem] max-w-3xl font-sans"
        >
          <title id={`${id}-title`}>Illustrative Temple layout</title>
          <desc id={`${id}-desc`}>{summary}</desc>

          {segments.map(({ d, p, q }) => (
            <line
              key={`${d.from}-${d.to}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={doorStroke(d)}
              strokeWidth={d.action ? 5 : 3}
              strokeDasharray={d.open ? undefined : '7 6'}
              strokeLinecap="round"
            />
          ))}

          {rooms.map(r => {
            const { x, y } = centre(r);
            const tier = r.tier ? `Tier ${r.tier}` : null;
            const rows = tier ? [...wrap(r.label), tier] : wrap(r.label);
            const top = y - ((rows.length - 1) * 17) / 2 + 5;
            return (
              <g key={r.id}>
                {/* Opaque base so door lines never show through a room. */}
                <rect
                  x={x - NODE_W / 2}
                  y={y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  className="fill-forge-bg"
                />
                <rect
                  x={x - NODE_W / 2}
                  y={y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  className={NODE_STYLE[r.kind]}
                  strokeWidth={r.kind === 'target' ? 3 : 1.5}
                />
                {rows.map((line, i) => (
                  <text
                    key={i}
                    x={x}
                    y={top + i * 17}
                    textAnchor="middle"
                    className={
                      tier && i === rows.length - 1
                        ? 'fill-forge-rust-strong text-[13px] font-semibold'
                        : 'fill-forge-goldbright text-[15px] font-semibold'
                    }
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Door markers sit on top of the rooms so none is hidden. */}
          {segments.map(({ d, mx, my }) =>
            d.action ? (
              <g key={`${d.from}-${d.to}-mark`}>
                <rect
                  x={mx - 36}
                  y={my - 13}
                  width={72}
                  height={26}
                  rx={13}
                  className="fill-forge-gold stroke-forge-ink"
                  strokeWidth={2}
                />
                <text
                  x={mx}
                  y={my + 5}
                  textAnchor="middle"
                  className="fill-forge-ink text-[13px] font-bold tracking-wide"
                >
                  ★ OPEN
                </text>
              </g>
            ) : (
              <g key={`${d.from}-${d.to}-mark`}>
                <circle
                  cx={mx}
                  cy={my}
                  r={12}
                  className={`fill-forge-bg ${doorStroke(d)}`}
                  strokeWidth={2}
                />
                <text
                  x={mx}
                  y={my + 5}
                  textAnchor="middle"
                  className={`text-[14px] font-bold ${
                    d.open ? 'fill-aurora-teal' : 'fill-danger-fg'
                  }`}
                >
                  {d.open ? '↔' : '✕'}
                </text>
              </g>
            )
          )}
        </svg>
      </div>
      <figcaption className="space-y-2 text-sm text-forge-muted">
        <ul
          className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
          aria-label="Legend"
        >
          <li>
            <span aria-hidden className="font-bold text-aurora-teal">
              ── ↔
            </span>{' '}
            Open door
          </li>
          <li>
            <span aria-hidden className="font-bold text-danger-fg">
              - - ✕
            </span>{' '}
            Closed door
          </li>
          <li>
            <span aria-hidden className="font-bold text-forge-gold">
              ━ ★ OPEN
            </span>{' '}
            Door to open with your Stone of Passage
          </li>
          <li>
            <span aria-hidden className="text-forge-gold">
              ▢
            </span>{' '}
            Gold outline: target room
          </li>
        </ul>
        <details className="text-xs">
          <summary className="cursor-pointer text-forge-goldbright">
            All connections as text
          </summary>
          <ul className="mt-2 space-y-0.5">
            {doors.map(d => (
              <li key={`${d.from}-${d.to}`}>
                {name(d.from)} ↔ {name(d.to)}:{' '}
                <span
                  className={
                    d.action
                      ? 'font-semibold text-forge-gold'
                      : d.open
                        ? 'text-aurora-teal'
                        : 'text-danger-fg'
                  }
                >
                  {doorText(d)}
                </span>
              </li>
            ))}
          </ul>
        </details>
        <p className="text-2xs">
          Original illustrative diagram, not a game screenshot. Scroll sideways
          on small screens.
        </p>
      </figcaption>
    </figure>
  );
}
