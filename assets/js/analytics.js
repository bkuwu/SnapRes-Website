(function () {
  "use strict";

  var CFG = window.SNAPRES_CONFIG || {};
  var ENDPOINT = CFG.STATS_API || "";
  var GC_URL = CFG.GOATCOUNTER_URL || "";
  var DOWNLOAD_FLAG_KEY = "snapres-download-counted";

  function ping(path) {
    if (!ENDPOINT) return;
    var url = ENDPOINT + path;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
    } else {
      fetch(url, { method: "POST", keepalive: true }).catch(function () {});
    }
  }

  if (ENDPOINT) {
    ping("/api/hit");
    setInterval(function () {
      if (document.visibilityState === "visible") ping("/api/heartbeat");
    }, 180000);
  }

  if (GC_URL && !/YOURCODE/.test(GC_URL)) {
    var gc = document.createElement("script");
    gc.async = true;
    gc.src = "https://gc.zgo.at/count.js";
    gc.setAttribute("data-goatcounter", GC_URL);
    document.head.appendChild(gc);
  }

  function sendGoatEvent(path, title) {
    if (!GC_URL || /YOURCODE/.test(GC_URL)) return;
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({ path: path, title: title, event: true });
      return;
    }
    var img = new Image(1, 1);
    img.src = GC_URL + "?p=" + encodeURIComponent(path) + "&t=" + encodeURIComponent(title) + "&e=true";
  }

  window.SnapResTrackDownload = function () {
    var already;
    try { already = localStorage.getItem(DOWNLOAD_FLAG_KEY); } catch (e) { already = null; }
    if (already === "1") return;
    try { localStorage.setItem(DOWNLOAD_FLAG_KEY, "1"); } catch (e) {}
    sendGoatEvent("/download-click", "Download click");
  };
})();
