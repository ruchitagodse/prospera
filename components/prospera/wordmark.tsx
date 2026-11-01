import { logoInkPath } from "./logo-geometry";

/** The same outlined lettering used by the main header, at any scale. */
export function Wordmark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="60 425 630 90" fill="currentColor" role="img" aria-label="PROSPERA"><path fillRule="evenodd" d={logoInkPath}/></svg>;
}
