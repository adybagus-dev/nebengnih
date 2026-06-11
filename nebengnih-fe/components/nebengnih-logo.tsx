interface NebengNihLogoProps {
  className?: string
}

/**
 * NebengNih brandmark: the letter "N" drawn as a winding route
 * with a start pin (top-left) and a destination pin (bottom-right).
 * Uses currentColor so it inherits the surrounding text color.
 */
export function NebengNihLogo({ className }: NebengNihLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="NebengNih logo"
      className={className}
    >
      {/* N-shaped route: left riser, diagonal, right riser */}
      <path
        d="M13 41 V18 L35 41 V13"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Start pin (top-left) */}
      <circle cx="13" cy="10" r="4.5" stroke="currentColor" strokeWidth="3" />
      <circle cx="13" cy="10" r="1.4" fill="currentColor" />

      {/* Destination pin (bottom-right) */}
      <circle cx="38" cy="38" r="4.5" stroke="currentColor" strokeWidth="3" />
      <circle cx="38" cy="38" r="1.4" fill="currentColor" />
    </svg>
  )
}
