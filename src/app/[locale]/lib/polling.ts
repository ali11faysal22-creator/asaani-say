/**
 * Runs `task` now and then every `intervalMs`, but only while the tab is visible - background
 * tabs stop hitting the API, and one catch-up run fires as soon as the tab is shown again.
 * Returns a cleanup function for useEffect.
 */
export function startPolling(task: () => void | Promise<void>, intervalMs: number): () => void {
  let stopped = false
  const run = () => {
    if (stopped || document.hidden) return
    void task()
  }
  run()
  const timer = window.setInterval(run, intervalMs)
  document.addEventListener('visibilitychange', run)
  return () => {
    stopped = true
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', run)
  }
}
