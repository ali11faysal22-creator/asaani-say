const PALETTE = ['#EE6C52', '#2a78d6', '#1baf7a', '#4a3aa7', '#eda100']

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function InitialsAvatar({ name, size = 8 }: { name: string; size?: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'
  const color = PALETTE[hashString(name) % PALETTE.length]

  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-white font-bold shrink-0"
      style={{ backgroundColor: color, width: `${size * 4}px`, height: `${size * 4}px`, fontSize: `${size * 1.4}px` }}
    >
      {initials}
    </span>
  )
}
