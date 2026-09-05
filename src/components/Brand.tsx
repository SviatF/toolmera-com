import Link from 'next/link';

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Toolmera home">
      <span className="brandMark" aria-hidden="true"><span /></span>
      <span>TOOL<span>MERA</span></span>
    </Link>
  );
}
