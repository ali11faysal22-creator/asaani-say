'use client'

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  return audioContext
}

// Browsers keep a freshly-created AudioContext suspended until a real user gesture —
// prime it on the first click/keypress anywhere on the page so a later, programmatic
// playNotificationSound() call (triggered by a background poll, not a click) still works.
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getContext()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }
  window.addEventListener('pointerdown', unlock, { once: true, passive: true })
  window.addEventListener('keydown', unlock, { once: true, passive: true })
}

/** Loud two-strike bell chime, synthesized with the Web Audio API so no audio file is
 * needed. A real bell's tone is inharmonic (its overtones aren't clean multiples of the
 * fundamental) — layering a few of those ratios per strike is what makes this read as a
 * "bell" instead of a plain beep. */
export function playNotificationSound() {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  // A limiter on the shared output bus lets each partial ring out loud without the
  // several overlapping sine waves clipping/crackling when their peaks line up.
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -12
  limiter.knee.value = 6
  limiter.ratio.value = 12
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  const masterGain = ctx.createGain()
  masterGain.gain.value = 1.6
  limiter.connect(masterGain)
  masterGain.connect(ctx.destination)

  const now = ctx.currentTime
  const fundamental = 1046.5 // C6 — bright, cuts through background noise
  const partials: Array<[ratio: number, peakLevel: number]> = [
    [1, 0.55],
    [2.4, 0.3],
    [3.8, 0.18],
    [0.5, 0.4], // an octave down, for body/loudness under the bright top note
  ]
  const strikeOffsets = [0, 0.32]

  for (const strikeOffset of strikeOffsets) {
    const start = now + strikeOffset
    for (const [ratio, peakLevel] of partials) {
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = fundamental * ratio
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(peakLevel, start + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85)
      oscillator.connect(gain)
      gain.connect(limiter)
      oscillator.start(start)
      oscillator.stop(start + 0.9)
    }
  }
}
