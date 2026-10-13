/**
 * Stable key for a UI phrase: messages/*.json store translations under this hash of the
 * English text, so `t('Some text')` finds its Urdu twin. Server and client must agree,
 * which is why the hashing lives in one plain module that both can import.
 */
export function phraseKey(text: string): string {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `p_${(hash >>> 0).toString(36)}`
}
