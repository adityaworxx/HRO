export const AVATAR_COLOR_CLASSES = [
  'avatar-tint-blue',
  'avatar-tint-emerald',
  'avatar-tint-purple',
  'avatar-tint-amber',
  'avatar-tint-rose',
  'avatar-tint-cyan',
  'avatar-tint-indigo',
  'avatar-tint-orange',
] as const;

export function getAvatarColorClass(name: string): string {
  if (!name) return 'avatar-tint-blue';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLOR_CLASSES.length;
  return AVATAR_COLOR_CLASSES[index] ?? 'avatar-tint-blue';
}
