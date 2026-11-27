// Raised rubber is 1; grooves are 0. Both the boot and its print use these coordinates.
/** @param {number} across Signed distance from the sole's centre, from -1 to 1.
 * @param {number} along Distance from toe to heel, from 0 to 1. */
export function treadHeight(across, along) {
  const edge = Math.abs(across);
  const chevron = (along - .065 * edge) * 6;
  const cut = Math.abs(chevron - Math.round(chevron)) / 6;
  const depth = Math.min(cut / .030, Math.abs(along-.735)/.044, Math.abs(across)/.068);
  const lug = Math.max(0, Math.min(1,(depth-.26)/.74));
  const welt = Math.max(0, Math.min(1,(edge-.81)/.10));
  return lug * (1-welt) + welt;
}
