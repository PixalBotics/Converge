/**

 * Converge embed loader — mounts `/embed/widget` in a fixed iframe on the host page.

 * Tracks page_view from the parent page via Socket.IO (`track_event`) as soon as the script loads.
 * Falls back to REST only when the socket path is unavailable.

 *

 * <script

 *   src="{APP}/widget.js"

 *   data-widget-key="wgt_..."

 *   data-app-origin="{APP}"

 *   data-api-origin="{API}"

 *   defer

 * ></script>

 */

(function () {

  "use strict";



  var RESIZE_MSG = "converge-widget-embed-resize";

  var LAUNCHER_SIZE_PX = 58;

  var DEFAULT_INSET_BOTTOM_PX = 16;

  var DEFAULT_INSET_SIDE_PX = 16;

  var TRACK_DEDUPE_PREFIX = "converge:widget:track:v1";

  var VISITOR_SESSION_PREFIX = "ic.visitor.sessionId.";



  function currentScript() {

    return document.currentScript;

  }



  function pageHost() {

    try {

      return window.location.hostname || "localhost";

    } catch (_e) {

      return "localhost";

    }

  }



  function pageUrl() {

    try {

      return window.location.href;

    } catch (_e) {

      return "";

    }

  }



  function normalizeOrigin(origin) {

    return String(origin || "").replace(/\/+$/, "");

  }



  function trackDedupeKey(sessionId, page) {

    return TRACK_DEDUPE_PREFIX + ":page_view:" + sessionId + ":" + (page || "");

  }



  function shouldSkipPageViewTrack(sessionId, page) {

    try {

      return sessionStorage.getItem(trackDedupeKey(sessionId, page)) === "1";

    } catch (_e) {

      return false;

    }

  }



  function markPageViewTracked(sessionId, page) {

    try {

      sessionStorage.setItem(trackDedupeKey(sessionId, page), "1");

    } catch (_e) {

      /* ignore */

    }

  }



  function ensureVisitorSessionId(widgetKey) {

    var key = VISITOR_SESSION_PREFIX + widgetKey;

    try {

      var existing = sessionStorage.getItem(key);

      if (existing) return existing;

    } catch (_e) {

      /* ignore */

    }

    var created =

      typeof crypto !== "undefined" && crypto.randomUUID

        ? crypto.randomUUID()

        : "vs_" + Math.random().toString(36).slice(2) + "_" + Date.now();

    try {

      sessionStorage.setItem(key, created);

    } catch (_e2) {

      /* ignore */

    }

    return created;

  }



  function screenResolution() {

    try {

      if (window.screen && window.screen.width && window.screen.height) {

        return window.screen.width + "x" + window.screen.height;

      }

    } catch (_e) {

      /* ignore */

    }

    return undefined;

  }



  function peelApiSuccess(json) {

    if (!json || typeof json !== "object") return json;

    if (json.success === true && json.data && typeof json.data === "object") {

      return json.data;

    }

    return json;

  }



  function loadSocketIoClient(apiOrigin) {

    return new Promise(function (resolve, reject) {

      if (typeof io !== "undefined") {

        resolve();

        return;

      }

      var src = normalizeOrigin(apiOrigin) + "/socket.io/socket.io.min.js";

      var existing = document.querySelector('script[data-converge-socket-client="1"]');

      if (existing) {

        existing.addEventListener("load", function () {

          resolve();

        });

        existing.addEventListener("error", reject);

        return;

      }

      var script = document.createElement("script");

      script.src = src;

      script.async = true;

      script.setAttribute("data-converge-socket-client", "1");

      script.onload = function () {

        resolve();

      };

      script.onerror = reject;

      document.head.appendChild(script);

    });

  }



  function sendPageViewHttpFallback(apiOrigin, body, onSent) {

    var url = normalizeOrigin(apiOrigin) + "/widget/analytics/page-view";



    try {

      if (typeof fetch === "function") {

        fetch(url, {

          method: "POST",

          headers: { "Content-Type": "application/json", Accept: "application/json" },

          body: JSON.stringify(body),

          credentials: "omit",

          keepalive: true,

        })

          .then(function () {

            onSent();

          })

          .catch(function () {

            /* iframe embed may still track */

          });

        return;

      }

    } catch (_e) {

      /* fall through */

    }



    try {

      var xhr = new XMLHttpRequest();

      xhr.open("POST", url, true);

      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.setRequestHeader("Accept", "application/json");

      xhr.onload = function () {

        onSent();

      };

      xhr.send(JSON.stringify(body));

    } catch (_e2) {

      /* ignore */

    }

  }



  function sendPageViewViaSocket(apiOrigin, sessionToken, websiteId, body, onSent, onFail) {

    loadSocketIoClient(apiOrigin)

      .then(function () {

        if (typeof io !== "function") {

          onFail();

          return;

        }

        var socket = io(normalizeOrigin(apiOrigin) + "/chat", {

          auth: { token: sessionToken },

          transports: ["websocket", "polling"],

          reconnection: false,

          timeout: 8000,

        });

        var settled = false;

        function finish(ok) {

          if (settled) return;

          settled = true;

          try {

            socket.disconnect();

          } catch (_disconnectErr) {

            /* ignore */

          }

          if (ok) onSent();

          else onFail();

        }

        var payload = {

          websiteId: websiteId,

          eventType: "page_view",

          sessionId: body.sessionId,

          pageUrl: body.pageUrl,

          referrerUrl: body.referrerUrl,

          timezone: body.timezone,

          locale: body.locale,

          screenResolution: body.screenResolution,

        };

        socket.on("connect_error", function () {

          finish(false);

        });

        socket.on("connect", function () {

          if (socket.timeout) {

            socket.timeout(10000).emit("track_event", payload, function (err) {

              finish(!err);

            });

          } else {

            socket.emit("track_event", payload, function () {

              finish(true);

            });

          }

        });

        setTimeout(function () {

          finish(false);

        }, 12000);

      })

      .catch(onFail);

  }



  function sendParentPageViewTrack(widgetKey, apiOrigin) {

    if (!widgetKey || !apiOrigin) return;



    var sessionId = ensureVisitorSessionId(widgetKey);

    var currentPage = pageUrl();

    if (!sessionId || shouldSkipPageViewTrack(sessionId, currentPage)) return;



    var body = {

      widgetKey: widgetKey,

      sessionId: sessionId,

      pageUrl: currentPage,

      referrerUrl: typeof document !== "undefined" ? document.referrer || undefined : undefined,

      timezone:

        typeof Intl !== "undefined" && Intl.DateTimeFormat

          ? Intl.DateTimeFormat().resolvedOptions().timeZone

          : undefined,

      locale: typeof navigator !== "undefined" ? navigator.language : undefined,

      screenResolution: screenResolution(),

    };



    function onSent() {

      markPageViewTracked(sessionId, currentPage);

    }



    function httpFallback() {

      sendPageViewHttpFallback(apiOrigin, body, onSent);

    }



    var sessionUrl = normalizeOrigin(apiOrigin) + "/widget/session";

    var sessionBody = {

      widgetKey: widgetKey,

      originHost: typeof window !== "undefined" ? window.location.origin : undefined,

    };



    if (typeof fetch !== "function") {

      httpFallback();

      return;

    }



    fetch(sessionUrl, {

      method: "POST",

      headers: { "Content-Type": "application/json", Accept: "application/json" },

      body: JSON.stringify(sessionBody),

      credentials: "omit",

    })

      .then(function (res) {

        if (!res.ok) throw new Error("session");

        return res.json();

      })

      .then(function (json) {

        var data = peelApiSuccess(json);

        var token = (data && (data.sessionToken || data.token)) || null;

        var websiteId = (data && data.websiteId) || null;

        if (!token || !websiteId) {

          httpFallback();

          return;

        }

        sendPageViewViaSocket(

          apiOrigin,

          token,

          websiteId,

          body,

          onSent,

          httpFallback,

        );

      })

      .catch(httpFallback);

  }



  function applyFrameLayout(frame, payload) {

    var pos = payload.position === "left" || payload.position === "center"

      ? payload.position

      : "right";

    var bottom = typeof payload.insetBottomPx === "number"

      ? payload.insetBottomPx

      : DEFAULT_INSET_BOTTOM_PX;

    var side = typeof payload.insetSidePx === "number"

      ? payload.insetSidePx

      : DEFAULT_INSET_SIDE_PX;

    var width = typeof payload.width === "number" && payload.width > 0

      ? payload.width

      : LAUNCHER_SIZE_PX;

    var height = typeof payload.height === "number" && payload.height > 0

      ? payload.height

      : LAUNCHER_SIZE_PX;



    var vw = window.innerWidth || width;

    var vh = window.innerHeight || height;

    width = Math.min(Math.ceil(width), vw);

    height = Math.min(Math.ceil(height), vh);



    var style = frame.style;

    style.position = "fixed";

    style.border = "none";

    style.margin = "0";

    style.padding = "0";

    style.background = "transparent";

    style.colorScheme = "normal";

    style.zIndex = "2147483000";

    style.width = width + "px";

    style.height = height + "px";

    style.bottom = bottom + "px";

    style.maxWidth = "100vw";

    style.maxHeight = "100vh";

    style.overflow = "hidden";



    if (pos === "left") {

      style.left = side + "px";

      style.right = "auto";

      style.transform = "";

    } else if (pos === "center") {

      style.left = "50%";

      style.right = "auto";

      style.transform = "translateX(-50%)";

    } else {

      style.right = side + "px";

      style.left = "auto";

      style.transform = "";

    }

  }



  function bootstrap() {

    var script = currentScript();

    if (!script) {

      console.error("[widget] Could not find embed script tag.");

      return;

    }



    var widgetKey = (script.getAttribute("data-widget-key") || "").trim();

    var embedEnv = (script.getAttribute("data-env") || "").trim().toLowerCase();

    if (!embedEnv && script.getAttribute("data-staging") === "1") {

      embedEnv = "staging";

    }

    var appOrigin = normalizeOrigin(

      script.getAttribute("data-app-origin") ||

        script.getAttribute("data-api-origin"),

    );

    var apiOrigin = normalizeOrigin(script.getAttribute("data-api-origin"));



    if (!appOrigin && script.src) {

      try {

        appOrigin = normalizeOrigin(

          new URL(script.src, window.location.href).origin,

        );

      } catch (_e) {

        /* ignore */

      }

    }



    if (!widgetKey || !appOrigin) {

      console.error(

        "[widget] Missing data-widget-key or data-app-origin on the script tag.",

      );

      return;

    }



    sendParentPageViewTrack(widgetKey, apiOrigin);



    var params = new URLSearchParams();

    params.set("widgetKey", widgetKey);

    params.set("parentHost", pageHost());

    params.set("parentPage", pageUrl());

    if (embedEnv) {

      params.set("env", embedEnv);

    }



    var iframe = document.createElement("iframe");

    iframe.setAttribute("title", "Chat widget");

    iframe.setAttribute("allow", "clipboard-write");

    iframe.setAttribute("aria-label", "Chat widget");

    iframe.src = appOrigin + "/embed/widget?" + params.toString();



    applyFrameLayout(iframe, {

      width: LAUNCHER_SIZE_PX,

      height: LAUNCHER_SIZE_PX,

      position: "right",

      insetBottomPx: DEFAULT_INSET_BOTTOM_PX,

      insetSidePx: DEFAULT_INSET_SIDE_PX,

      open: false,

    });



    window.addEventListener("message", function (event) {

      if (!event || !event.data || event.data.type !== RESIZE_MSG) return;

      if (event.origin !== appOrigin) return;

      applyFrameLayout(iframe, event.data);

    });



    if (document.body) {

      document.body.appendChild(iframe);

    } else {

      document.addEventListener("DOMContentLoaded", function () {

        document.body.appendChild(iframe);

      });

    }

  }



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", bootstrap);

  } else {

    bootstrap();

  }

})();


