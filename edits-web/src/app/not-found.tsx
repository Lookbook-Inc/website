import Link from "next/link";

export default function NotFound() {
  return <main className="standalone-state"><p className="eyebrow">404</p><h1>That piece has moved on.</h1><p>It may have been removed from your Lookbook.</p><Link className="button primary" href="/">Return home</Link></main>;
}
