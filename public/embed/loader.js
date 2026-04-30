/**
 * Converge embeddable chat widget loader.
 * Mount: add before </body>:
 *   <script src="https://YOUR_APP_ORIGIN/embed/loader.js"
 *     data-widget-id="WIDGET_ID"
 *     data-mode="iframe"
 *     defer></script>
 *
 * data-mode: "iframe" (default) | "shadow" — shadow attaches an open shadow root and places the iframe inside for style isolation from the host page.
 * data-base-url: optional; defaults to the origin of this script.
 * data-brand-title / data-greeting / data-accent: optional overrides passed to the embed app query string.
 */
(function () {
  var script = document.currentScript;
  if (!script || !script.getAttribute) return;

  var widgetId = script.getAttribute("data-widget-id") || script.getAttribute("data-id") || "";
  var mode = (script.getAttribute("data-mode") || "iframe").toLowerCase();
  var baseUrlAttr = script.getAttribute("data-base-url");
  var baseUrl = (baseUrlAttr || "").replace(/\/+$/, "");
  if (!baseUrl) {
    try {
      baseUrl = new URL(script.src).origin;
    } catch (e) {
      return;
    }
  }

  var qs = new URLSearchParams();
  if (widgetId) qs.set("widgetId", widgetId);
  var title = script.getAttribute("data-brand-title");
  if (title) qs.set("title", title);
  var greeting = script.getAttribute("data-greeting");
  if (greeting) qs.set("greeting", greeting);
  var accent = script.getAttribute("data-accent");
  if (accent) qs.set("accent", accent);

  var src = baseUrl + "/embed/chat-widget?" + qs.toString();
  var z = "2147483646";

  var iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Live chat");
  iframe.setAttribute("src", src);
  iframe.setAttribute("allow", "clipboard-write");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.style.border = "none";
  iframe.style.position = "fixed";
  iframe.style.right = "12px";
  iframe.style.bottom = "12px";
  iframe.style.width = "min(432px, 100vw - 24px)";
  iframe.style.height = "min(720px, 100vh - 24px)";
  iframe.style.maxWidth = "calc(100vw - 24px)";
  iframe.style.maxHeight = "calc(100vh - 24px)";
  iframe.style.zIndex = z;
  iframe.style.background = "transparent";
  iframe.style.overflow = "hidden";

  function appendToBody(node) {
    function run() {
      if (document.body) document.body.appendChild(node);
    }
    if (document.body) run();
    else document.addEventListener("DOMContentLoaded", run);
  }

  if (mode === "shadow") {
    var host = document.createElement("div");
    host.id = "converge-chat-widget-host";
    host.setAttribute("data-converge-chat", "1");
    host.style.cssText =
      "all:initial;position:fixed;right:0;bottom:0;width:min(432px,100vw);height:min(720px,100vh);z-index:" +
      z +
      ";pointer-events:none;";
    try {
      var root = host.attachShadow({ mode: "open" });
      iframe.style.pointerEvents = "auto";
      iframe.style.right = "12px";
      iframe.style.bottom = "12px";
      root.appendChild(iframe);
      appendToBody(host);
    } catch (err) {
      appendToBody(iframe);
    }
  } else {
    appendToBody(iframe);
  }
})();
