window.SNAPRES_CONFIG = {
  DOWNLOAD_URL: "https://github.com/bkuwu/SnapRes/releases/download/v2.0.0/SnapRes.Setup.2.0.0.exe",
  GITHUB_REPO_URL: "https://github.com/bkuwu/SnapRes",
  GITHUB_OWNER: "bkuwu",
  GITHUB_REPO: "SnapRes",
  // Carries forward downloads from before an asset got replaced (GitHub resets
  // an asset's download count to 0 when you delete/re-upload it, even with the
  // same filename). Calculated so the displayed total reads 190 as of the last
  // reset (189 old total + 1 real download since). Bump this again the same way
  // if you ever replace the release asset in place instead of publishing a new one.
  DOWNLOAD_COUNT_OFFSET: 165,
  YOUTUBE_URL: "https://www.youtube.com/@bkuuuuu",
  DISCORD_URL: "https://discord.gg/MzX9wJ6Tyf",
  CONTACT_EMAIL: "hakobennadja66@gmail.com",
  VERSION_LABEL: "v2.0.0",
  // Set this to your deployed Worker URL, e.g. "https://snapres-stats.YOURSUBDOMAIN.workers.dev"
  // Leave empty to disable stats tracking entirely.
  STATS_API: "https://snapres-stats.bku.workers.dev",
};
