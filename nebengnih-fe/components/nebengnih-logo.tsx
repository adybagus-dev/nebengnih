import Image from "next/image"

interface NebengNihLogoProps {
  className?: string
}

export function NebengNihLogo({ className }: NebengNihLogoProps) {
  return (
    <Image
      src="/nebengnih-logo.png"
      alt="NebengNih logo"
      width={48}
      height={48}
      className={className}
      priority={false}
    />
  )
}
