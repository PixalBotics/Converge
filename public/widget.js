/**
 * Unified widget loader — single script for CHAT / TEXT_US / BOTH.
 *
 * Embed on customer site:
 * <script src="https://YOUR_APP_ORIGIN/widget.js"
 *         data-widget-key="wgt_xxx"
 *         data-deploy-key="YOUR_DEPLOY_KEY"
 *         defer></script>
 */
(function widgetBootstrap() {
  var script =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var widgetKey = script && script.getAttribute("data-widget-key");
  var deployKey = script && script.getAttribute("data-deploy-key");
  var appOriginAttr = script && script.getAttribute("data-app-origin");

  function resolveAppOrigin() {
    if (appOriginAttr && appOriginAttr.indexOf("//") !== -1) {
      try {
        return new URL(appOriginAttr).origin;
      } catch (e) {
        return "";
      }
    }
    /** Same-origin fallback when loader is hosted on the SaaS domain */
    if (typeof location !== "undefined") return location.origin;
    return "";
  }

  if (!widgetKey || !deployKey) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[Interchanges widget] Missing data-widget-key or data-deploy-key.");
    }
    return;
  }

  var APP_ORIGIN = resolveAppOrigin();
  if (!APP_ORIGIN && typeof console !== "undefined" && console.error) {
    console.error("[Interchanges widget] Could not resolve app origin. Set data-app-origin.");
    return;
  }

  var parentHost =
    typeof location !== "undefined" && location.hostname
      ? location.hostname
      : "";
  var parentPage =
    typeof location !== "undefined" ? location.href.split("#")[0] : "";

  var iframe = document.createElement("iframe");
  iframe.title = "Messaging widget";
  iframe.setAttribute("allow", "clipboard-write");
  /** Sandboxed-but-functional: allow-scripts + same-origin navigations for SaaS-hosted UI only */
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-popup",
  );
  iframe.style.position = "fixed";
  iframe.style.border = "0";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 12px 32px rgba(15,23,42,0.35)";
  iframe.style.width = "min(440px,calc(100vw - 32px))";
  iframe.style.height = "560px";
  iframe.style.maxHeight = "calc(100vh - 32px)";
  iframe.style.bottom = "16px";
  iframe.style.right = "16px";
  iframe.style.zIndex = "2147483645";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.transition = "opacity .2s ease";

  var params = new URLSearchParams({
    widgetKey: widgetKey,
    deployKey: deployKey,
    parentHost: parentHost,
    parentPage: parentPage || "",
  });
  iframe.src = APP_ORIGIN + "/embed/widget?" + params.toString();

  iframe.onload = function () {
    iframe.style.opacity = "1";
    iframe.style.pointerEvents = "auto";
  };

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open chat");
  toggle.textContent = "Chat";
  toggle.style.position = "fixed";
  toggle.style.bottom = "20px";
  toggle.style.right = "20px";
  toggle.style.zIndex = "2147483646";
  toggle.style.width = "56px";
  toggle.style.height = "56px";
  toggle.style.borderRadius = "50%";
  toggle.style.border = "0";
  toggle.style.cursor = "pointer";
  toggle.style.boxShadow = "0 10px 24px rgba(2,12,43,0.45)";
  toggle.style.background = "#1e63d5";
  toggle.style.color = "#fff";
  toggle.style.fontWeight = "700";
  toggle.style.fontSize = "13px";

  var open = false;
  toggle.addEventListener("click", function () {
    open = !open;
    iframe.style.opacity = open ? "1" : "0";
    iframe.style.pointerEvents = open ? "auto" : "none";
    toggle.style.opacity = open ? "0" : "1";
    toggle.style.pointerEvents = open ? "none" : "auto";
    if (!open) return;
    if (iframe.parentNode) return;
    document.body.appendChild(iframe);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function appendNodes() {
      document.body.appendChild(toggle);
    });
  } else {
    document.body.appendChild(toggle);
  }
})();
