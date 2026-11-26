/** Smoothly scroll to the top (instantly with reduced motion) and drop any #anchor from the URL. */
export function scrollToTop() {
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  if (window.location.hash) {
    history.replaceState(history.state, "", window.location.pathname + window.location.search);
  }
}
