// A stable URL lets the wiki and standalone pages use the same bundled fonts.
import stylesheet from "../../styles/journal.css?inline";

export function GET() {
  return new Response(stylesheet, { headers: { "Content-Type": "text/css; charset=utf-8" } });
}
