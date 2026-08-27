type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* Connecting Branch Lines */}
      <g stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
        <path d="M 50 72 C 50 58, 18 58, 18 44" />
        <path d="M 50 72 C 50 55, 34 50, 34 32" />
        <path d="M 50 72 V 22" />
        <path d="M 50 72 C 50 55, 66 50, 66 32" />
        <path d="M 50 72 C 50 58, 82 58, 82 44" />
      </g>

      {/* 5 Nodes (Solid Circles) */}
      <g fill="currentColor">
        <circle cx="18" cy="44" r="8.5" />
        <circle cx="34" cy="32" r="8.5" />
        <circle cx="50" cy="22" r="8.5" />
        <circle cx="66" cy="32" r="8.5" />
        <circle cx="82" cy="44" r="8.5" />
      </g>

      {/* Expanded Database Base */}
      <path
        d="M 27 72 C 27 65, 73 65, 73 72 V 89 C 73 96, 27 96, 27 89 Z"
        fill="currentColor"
      />

      {/* Database Layer Separator Lines */}
      <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 27 78 C 27 84, 73 84, 73 78" />
        <path d="M 27 85 C 27 91, 73 91, 73 85" />
      </g>

      {/* Central Base Dot */}
      <circle cx="50" cy="72" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}
