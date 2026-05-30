const fs = require("node:fs");
const path = require("node:path");

const vendorPath = path.resolve(__dirname, "../dist/build/mp-weixin/common/vendor.js");

if (!fs.existsSync(vendorPath)) {
  console.warn("[postbuild] vendor.js not found, skip mp-weixin cleanup.");
  process.exit(0);
}

const source = fs.readFileSync(vendorPath, "utf8");
const cleaned = source.replace(
  /!function\(\)\{if\(h\(wx\.preloadAssets\)\)\{[\s\S]*?\}\}\(\),wx\.createApp=/,
  "wx.createApp="
);

if (cleaned === source) {
  console.warn("[postbuild] wx.preloadAssets block not found, skip mp-weixin cleanup.");
  process.exit(0);
}

fs.writeFileSync(vendorPath, cleaned);
console.log("[postbuild] removed wx.preloadAssets from mp-weixin vendor.js.");
