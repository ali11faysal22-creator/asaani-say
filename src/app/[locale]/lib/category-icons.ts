import {
  Bug,
  Flame,
  Hammer,
  Home,
  Paintbrush,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  wrench: Wrench,
  zap: Zap,
  wind: Wind,
  hammer: Hammer,
  bug: Bug,
  flame: Flame,
  paintbrush: Paintbrush,
}

export function categoryIcon(icon?: string | null): LucideIcon {
  if (!icon) return Wrench
  return ICONS[icon] || Wrench
}
