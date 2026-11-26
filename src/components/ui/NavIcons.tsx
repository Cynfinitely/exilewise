/** Small stroke icons for the site nav and home page tool cards. */
export type NavIconName =
  | 'home'
  | 'items'
  | 'materials'
  | 'craft'
  | 'plans'
  | 'viscera'
  | 'videos'
  | 'guides'
  | 'build';

const PATHS: Record<NavIconName, React.ReactNode> = {
  build: (
    <>
      <path d="M3 19h4.5v-4.5H12V10h4.5V5.5H21" />
      <path d="m17.5 3 3.5 2.5L17.5 8" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  items: (
    <>
      <path d="M14.5 3.5 20.5 9.5 10 20H4v-6L14.5 3.5Z" />
      <path d="m12 6 6 6" />
    </>
  ),
  materials: (
    <>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="M4 7.5 12 12l8-4.5M12 12v9" />
    </>
  ),
  craft: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  plans: (
    <>
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </>
  ),
  videos: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="3.5" />
      <path d="m10 9.5 5 2.5-5 2.5z" />
    </>
  ),
  guides: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
      <path d="M7 8h1.5M15.5 8H17M15.5 11.5H17" />
    </>
  ),
  viscera: (
    <>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      <path d="M12 7.4V12l-2 2" />
    </>
  ),
};

export function NavIcon({
  name,
  className = 'h-4 w-4',
}: {
  name: NavIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  );
}
