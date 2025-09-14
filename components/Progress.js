'use client';
export default function Progress({ value=0, max=100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
      <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
