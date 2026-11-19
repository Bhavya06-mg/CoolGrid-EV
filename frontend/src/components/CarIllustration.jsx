import React from "react";

// Original, generic EV side-view illustration (not any brand's artwork).
export default function CarIllustration({ style, className }) {
  return (
    <svg viewBox="0 0 400 170" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f6f5" />
          <stop offset="0.6" stopColor="#d3d9d7" />
          <stop offset="1" stopColor="#9aa3a0" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a4a47" />
          <stop offset="1" stopColor="#16201e" />
        </linearGradient>
        <radialGradient id="carShadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="150" rx="170" ry="11" fill="url(#carShadow)" />

      {/* body */}
      <path
        d="M30 112 C30 96 40 90 62 86 L110 78 C132 52 160 40 200 40 C246 40 276 52 298 76 L342 84 C364 88 372 98 372 112 L372 124 C372 130 368 134 362 134 L40 134 C34 134 30 130 30 124 Z"
        fill="url(#carBody)"
      />
      {/* windows */}
      <path d="M124 78 C142 58 166 49 200 49 L206 49 L206 78 Z" fill="url(#carGlass)" />
      <path d="M214 49 C244 50 266 58 284 78 L214 78 Z" fill="url(#carGlass)" />
      {/* door line + handle */}
      <path d="M210 80 L210 126" stroke="#aab2af" strokeWidth="1.5" />
      <rect x="186" y="96" width="16" height="3.5" rx="1.7" fill="#8d9794" />
      <rect x="222" y="96" width="16" height="3.5" rx="1.7" fill="#8d9794" />
      {/* lights */}
      <path d="M356 94 L370 98 L370 104 L352 102 Z" fill="#34e0a1" opacity="0.9" />
      <rect x="31" y="98" width="10" height="6" rx="2" fill="#f87171" opacity="0.85" />
      {/* charge accent line */}
      <path d="M44 122 L360 122" stroke="#34e0a1" strokeWidth="2" opacity="0.7" />

      {/* wheels */}
      {[100, 300].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="132" r="25" fill="#0d0f0f" />
          <circle cx={cx} cy="132" r="15" fill="#c7cdcb" />
          <circle cx={cx} cy="132" r="6" fill="#4a5250" />
          {[0, 72, 144, 216, 288].map((a) => (
            <line
              key={a}
              x1={cx}
              y1={132}
              x2={cx + 14 * Math.cos((a * Math.PI) / 180)}
              y2={132 + 14 * Math.sin((a * Math.PI) / 180)}
              stroke="#8d9794"
              strokeWidth="2"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
