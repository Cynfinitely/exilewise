/**
 * Fixed, decorative sky behind every page: slow teal/violet aurora ribbons
 * over warm stone, with an ember glow rising from below. Pure CSS; motion
 * stops under prefers-reduced-motion (globals.css).
 */
export function AuroraBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-1/4 -top-1/3 h-[70vh] w-[150vw] animate-aurora opacity-100 blur-3xl [background:radial-gradient(40%_45%_at_30%_55%,rgb(79_209_184/0.30),transparent_70%),radial-gradient(35%_40%_at_62%_45%,rgb(154_124_240/0.30),transparent_70%),radial-gradient(30%_35%_at_85%_60%,rgb(79_209_184/0.18),transparent_70%)]" />
      <div className="absolute -bottom-1/3 left-1/2 h-[60vh] w-[90vw] -translate-x-1/2 animate-ember blur-3xl [background:radial-gradient(50%_50%_at_50%_70%,rgb(240_138_60/0.18),transparent_70%)]" />
      {/* Fine star dust: two offset dot grids. */}
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgb(236_226_205/0.7)_0.6px,transparent_0.6px),radial-gradient(rgb(236_226_205/0.4)_0.5px,transparent_0.5px)] [background-position:0_0,37px_53px] [background-size:113px_97px,151px_139px] [mask-image:linear-gradient(to_bottom,black,transparent_65%)]" />
    </div>
  );
}
