export default function sanitize(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
