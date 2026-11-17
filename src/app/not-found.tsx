import Link from 'next/link';

export const metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="eyebrow">Lost in the mists</p>
      <h1 className="display mt-3 text-4xl">Page not found</h1>
      <p className="mt-4 text-forge-muted">
        This path leads nowhere. It may have moved, or never existed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/poe1/viscera"
          className="btn btn-primary rounded-full px-5"
        >
          Browse viscera
        </Link>
        <Link href="/" className="btn rounded-full px-5">
          Go home
        </Link>
      </div>
    </div>
  );
}
