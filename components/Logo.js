'use client';

export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-xl shadow-md"
    >
      <defs>
        <linearGradient id="nhg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#nhg)" />
      {/* notebook page */}
      <rect x="12" y="10" width="24" height="28" rx="4" fill="white" opacity="0.95" />
      {/* lines */}
      <rect x="16" y="16" width="16" height="2" rx="1" fill="#cbd5e1" />
      <rect x="16" y="21" width="16" height="2" rx="1" fill="#cbd5e1" />
      <rect x="16" y="26" width="16" height="2" rx="1" fill="#cbd5e1" />
      <rect x="16" y="31" width="12" height="2" rx="1" fill="#cbd5e1" />
    </svg>
  );
}
