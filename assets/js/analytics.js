(function () {
  "use strict";

  var CFG = window.SNAPRES_CONFIG || {};
  var ENDPOINT = CFG.STATS_API || "";
  if (!ENDPOINT) return; // not configured yet, do nothing

  function ping(path) {
    var url = ENDPOINT + path;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([], { type: "text/plain" }));
    } else {
      fetch(url, { method: "POST", keepalive: true }).catch(function () {});
    }
  }

  // Record the pageview + register this visitor as "live" as soon as the page loads.
  ping("/api/hit");

  // Keep the "live now" count accurate while the tab stays open.
  // (Interval kept long on purpose to limit KV write volume against the daily cap.)
  setInterval(function () {
    if (document.visibilityState === "visible") ping("/api/heartbeat");
  }, 180000);

  // Exposed so the download button can call this right before navigating away.
  window.SnapResTrackDownload = function () {
    ping("/api/download");
  };
})();
