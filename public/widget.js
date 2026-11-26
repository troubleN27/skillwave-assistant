/*!
 * Skillwave Academy chat widget.
 * Usage: <script src="https://<school-site>/widget.js" data-lang="ru" async></script>
 */
(function () {
  "use strict";

  if (window.__skillwaveWidget) return;
  window.__skillwaveWidget = true;

  var script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"][data-lang], script[src*="widget.js"]');
  if (!script) return;

  var BASE = new URL(script.src).origin;
  var LANG = script.getAttribute("data-lang") === "en" ? "en" : "ru";
  var TEXT = {
    ru: { open: "Открыть чат с ассистентом", close: "Закрыть чат", title: "Чат с ассистентом Skillwave Academy" },
    en: { open: "Open chat with the assistant", close: "Close chat", title: "Skillwave Academy assistant chat" },
  }[LANG];
  var MOBILE_QUERY = window.matchMedia("(max-width: 639px)");
  var INK = "#121110";
  var SUN = "#FFFF00";

  var ICON_CHAT =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
  var ICON_CLOSE =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  var open = false;
  var frame = null;

  var container = document.createElement("div");
  container.setAttribute("data-skillwave-widget", "");
  container.style.cssText =
    "position:fixed;z-index:2147483646;display:none;overflow:hidden;background:#FBF3D0;" +
    "box-shadow:8px 8px 0 " + INK + ";border:2px solid " + INK + ";";

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", TEXT.open);
  button.setAttribute("aria-expanded", "false");
  button.innerHTML = ICON_CHAT;
  button.style.cssText =
    "position:fixed;z-index:2147483647;right:24px;bottom:24px;width:56px;height:56px;border:2px solid " + SUN + ";border-radius:0;" +
    "display:grid;place-items:center;cursor:pointer;color:" + SUN + ";background:" + INK + ";" +
    "box-shadow:4px 4px 0 rgba(18,17,16,.3);transition:transform .15s ease;";
  button.addEventListener("mouseenter", function () { button.style.transform = "translate(-2px,-2px)"; });
  button.addEventListener("mouseleave", function () { button.style.transform = ""; });
  button.addEventListener("click", function () { setOpen(!open); });

  function layout() {
    var mobile = MOBILE_QUERY.matches;
    if (mobile) {
      container.style.inset = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.borderRadius = "0";
      container.style.border = "0";
      button.style.right = "16px";
      button.style.bottom = "16px";
      // The close button is inside the full-screen chat on phones.
      button.style.display = open ? "none" : "grid";
    } else {
      container.style.inset = "auto 24px 96px auto";
      container.style.width = "380px";
      container.style.height = "min(600px, calc(100vh - 128px))";
      container.style.borderRadius = "0";
      container.style.border = "2px solid " + INK;
      button.style.right = "24px";
      button.style.bottom = "24px";
      button.style.display = "grid";
    }
  }

  function ensureFrame() {
    if (frame) return;
    frame = document.createElement("iframe");
    frame.src = BASE + "/embed?lang=" + LANG;
    frame.title = TEXT.title;
    frame.setAttribute("allow", "clipboard-write");
    frame.style.cssText = "width:100%;height:100%;border:0;display:block;";
    container.appendChild(frame);
  }

  function setOpen(next) {
    open = next;
    if (open) ensureFrame();
    container.style.display = open ? "block" : "none";
    button.innerHTML = open ? ICON_CLOSE : ICON_CHAT;
    button.setAttribute("aria-label", open ? TEXT.close : TEXT.open);
    button.setAttribute("aria-expanded", String(open));
    layout();
    if (open && frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "skillwave:open" }, BASE);
      frame.focus();
    } else if (!open) {
      button.focus();
    }
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== BASE || !frame || event.source !== frame.contentWindow) return;
    if (event.data && event.data.type === "skillwave:close") setOpen(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && open) setOpen(false);
  });
  if (MOBILE_QUERY.addEventListener) MOBILE_QUERY.addEventListener("change", layout);

  function mount() {
    layout();
    document.body.appendChild(container);
    document.body.appendChild(button);
  }

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
