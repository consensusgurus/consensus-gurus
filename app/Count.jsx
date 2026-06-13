'use client';

// Compact counter display. Numbers under 1,000 render unchanged; 1,000 and up
// abbreviate to one decimal as "1.0k" (thousands) or "1.0m" (millions). The
// decimal is FLOORED, not rounded, so a value never rounds up across a
// boundary (999,999 -> "999.9k", never "1000.0k"; 1,000,000 -> "1.0m").
export function formatCount(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '0';
  if (x < 1000) return String(x);
  if (x < 1000000) return (Math.floor(x / 100) / 10).toFixed(1) + 'k';
  return (Math.floor(x / 100000) / 10).toFixed(1) + 'm';
}

// Inline counter. Shows the abbreviated value; for abbreviated numbers (>=1000)
// a hover reveals the exact, comma-grouped figure via a nondescript native
// tooltip. Below 1,000 the display already equals the exact number, so no
// tooltip is attached.
export default function Count({ value, className, style }) {
  const x = Number(value) || 0;
  const abbreviated = x >= 1000;
  return (
    <span
      className={className}
      title={abbreviated ? x.toLocaleString() : undefined}
      style={abbreviated ? { cursor: 'help', ...style } : style}
    >
      {formatCount(x)}
    </span>
  );
}
