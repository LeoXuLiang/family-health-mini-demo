const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "../dist/build/mp-weixin");
const vendorPath = path.join(distDir, "common/vendor.js");

// 1. Clean up vendor.js preloadAssets
if (fs.existsSync(vendorPath)) {
  const source = fs.readFileSync(vendorPath, "utf8");
  const cleaned = source.replace(
    /!function\(\)\{if\(h\(wx\.preloadAssets\)\)\{[\s\S]*?\}\}\(\),wx\.createApp=/,
    "wx.createApp="
  );

  if (cleaned !== source) {
    fs.writeFileSync(vendorPath, cleaned);
    console.log("[postbuild] removed wx.preloadAssets from mp-weixin vendor.js.");
  } else {
    console.warn("[postbuild] wx.preloadAssets block not found.");
  }
} else {
  console.warn("[postbuild] vendor.js not found.");
}

// 2. Copy cloud functions to dist
const srcCloudDir = path.resolve(__dirname, "../cloudfunctions");
const destCloudDir = path.join(distDir, "cloudfunctions");

if (fs.existsSync(srcCloudDir)) {
  fs.cpSync(srcCloudDir, destCloudDir, { recursive: true });
  console.log("[postbuild] copied cloud functions to dist/.");
} else {
  console.warn("[postbuild] cloudfunctions/ not found.");
}
