/**
 * Unified widget loader — CHAT / TEXT_US / BOTH.
 * Iframe is transparent and sized via postMessage from /embed/widget (no outer chrome).
 */
(function widgetBootstrap() {
  var script =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var widgetKey = script && script.getAttribute("data-widget-key");
  var appOriginAttr = script && script.getAttribute("data-app-origin");
  var RESIZE_MSG = "converge-widget-embed-resize";

  function resolveAppOrigin() {
    if (appOriginAttr && appOriginAttr.indexOf("//") !== -1) {
      try {
        return new URL(appOriginAttr).origin;
      } catch (e) {
        return "";
      }
    }
    if (typeof location !== "undefined") return location.origin;
    return "";
  }

  if (!widgetKey) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[Interchanges widget] Missing data-widget-key.");
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
  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
  );
  iframe.style.position = "fixed";
  iframe.style.border = "0";
  iframe.style.background = "transparent";
  iframe.style.colorScheme = "normal";
  iframe.style.overflow = "hidden";
  iframe.style.width = "58px";
  iframe.style.height = "58px";
  iframe.style.bottom = "16px";
  iframe.style.right = "16px";
  iframe.style.zIndex = "2147483645";
  iframe.style.boxShadow = "none";
  iframe.style.borderRadius = "0";

  var params = new URLSearchParams({
    widgetKey: widgetKey,
    parentHost: parentHost,
    parentPage: parentPage || "",
  });
  iframe.src = APP_ORIGIN + "/embed/widget?" + params.toString();

  function applyFramePosition(d) {
    var bottom = typeof d.insetBottomPx === "number" ? d.insetBottomPx : 16;
    var side = typeof d.insetSidePx === "number" ? d.insetSidePx : 16;
    var pos = d.position || "right";

    iframe.style.bottom = bottom + "px";
    iframe.style.left = "auto";
    iframe.style.right = "auto";
    iframe.style.transform = "none";

    if (pos === "left") {
      iframe.style.left = side + "px";
    } else if (pos === "center") {
      iframe.style.left = "50%";
      iframe.style.transform = "translateX(-50%)";
    } else {
      iframe.style.right = side + "px";
    }
  }

  function iframeContentOrigin() {
    try {
      return new URL(iframe.src).origin;
    } catch (e) {
      return "";
    }
  }

  function isTrustedMessageOrigin(origin) {
    if (!origin) return false;
    if (APP_ORIGIN && origin === APP_ORIGIN) return true;
    var fromIframe = iframeContentOrigin();
    return fromIframe && origin === fromIframe;
  }

  function applyFrameSize(d) {
    var launcherMin = 58;
    var w =
      typeof d.width === "number" && d.width > 0 ? Math.ceil(d.width) : launcherMin;
    var h =
      typeof d.height === "number" && d.height > 0 ? Math.ceil(d.height) : launcherMin;

    if (d.open) {
      var hostMaxW =
        typeof window !== "undefined" ? window.innerWidth - 32 : w;
      var hostMaxH =
        typeof window !== "undefined" ? window.innerHeight - 32 : h;
      w = Math.min(w, hostMaxW);
      h = Math.min(h, hostMaxH);
    } else {
      w = Math.max(launcherMin, w);
      h = Math.max(launcherMin, h);
    }

    iframe.style.width = w + "px";
    iframe.style.height = h + "px";
    iframe.style.overflow = d.open ? "hidden" : "hidden";
    applyFramePosition(d);
  }

  window.addEventListener("message", function (ev) {
    if (!ev.data || ev.data.type !== RESIZE_MSG) return;
    if (!isTrustedMessageOrigin(ev.origin)) return;
    applyFrameSize(ev.data);
  });

  function mount() {
    if (iframe.parentNode) return;
    document.body.appendChild(iframe);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
