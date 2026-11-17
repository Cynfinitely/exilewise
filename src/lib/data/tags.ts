/**
 * Descriptive modifier tags we surface in the UI, with colour styling. These
 * are the build-relevant tags (we skip granular internals like
 * "fire_resistance" when "fire" + "resistance" already convey it).
 */
export const TAG_STYLES: Record<string, string> = {
  life: "border-rose-800/60 bg-rose-950/60 text-rose-200",
  mana: "border-sky-800/60 bg-sky-950/60 text-sky-200",
  fire: "border-orange-800/60 bg-orange-950/60 text-orange-200",
  cold: "border-cyan-800/60 bg-cyan-950/60 text-cyan-200",
  lightning: "border-yellow-800/60 bg-yellow-950/60 text-yellow-200",
  chaos: "border-fuchsia-800/60 bg-fuchsia-950/60 text-fuchsia-200",
  physical: "border-zinc-800/60 bg-zinc-950/60 text-zinc-200",
  elemental: "border-teal-800/60 bg-teal-950/60 text-teal-200",
  resistance: "border-emerald-800/60 bg-emerald-950/60 text-emerald-200",
  attack: "border-red-800/60 bg-red-950/60 text-red-200",
  caster: "border-indigo-800/60 bg-indigo-950/60 text-indigo-200",
  minion: "border-lime-800/60 bg-lime-950/60 text-lime-200",
  speed: "border-green-800/60 bg-green-950/60 text-green-200",
  critical: "border-amber-800/60 bg-amber-950/60 text-amber-200",
  defences: "border-forge-border bg-forge-panel2 text-forge-goldbright",
  ailment: "border-purple-800/60 bg-purple-950/60 text-purple-200",
  attribute: "border-stone-800/60 bg-stone-950/60 text-stone-200",
};

export const NOTABLE_TAGS = Object.keys(TAG_STYLES);

const NOTABLE_SET = new Set(NOTABLE_TAGS);

/** Filters a mod's implicit tags down to the notable, displayable subset. */
export function notableTags(tags: string[]): string[] {
  return tags.filter((t) => NOTABLE_SET.has(t));
}

export function tagStyle(tag: string): string {
  return TAG_STYLES[tag] ?? "border-forge-border bg-forge-panel2 text-forge-muted";
}
