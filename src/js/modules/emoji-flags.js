import { registerModule } from "../base/modules";

const module = registerModule("emoji-flags");

module.init(() => {
  if (!isEmojiFlagsSupported()) {
    useEmojiFont();
  }
});

async function useEmojiFont() {
  // Regional indicator symbols 'A' to 'Z'
  const text = Array.from(Array(26).keys())
    .map((i) => String.fromCodePoint(0x1f1e6 + i))
    .join("");

  const family = "Noto Color Emoji";

  const query = new URLSearchParams({
    family,
    text,
    display: "swap",
  }).toString();

  const resp = await fetch("https://fonts.googleapis.com/css2?" + query);
  if (!resp.ok) {
    console.error("Cannot fetch style from Google Fonts");
    return;
  }
  const respText = await resp.text();
  const [fontURL] = /https:\/\/[^)]+/.exec(respText);

  const e = document.createElement("style");
  // Google doesn't include 'unicode-range' to its code, so we need to rewrite
  // it.
  e.textContent = `
  @font-face {
    font-family: '${family}';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    unicode-range: U+1F1E6-1F1FF;
    src: url(${fontURL}) format('woff2');
  }
  body {
    font-family: ${family},${
      getComputedStyle(document.body).fontFamily
    } !important;
  }
  `;
  document.head.appendChild(e);
}

function isEmojiFlagsSupported() {
  // Emoji flags support detection, based on Modernizer code:
  // https://raw.githubusercontent.com/browserleaks/Modernizr/master/feature-detects/emoji.js
  const ctx = document.createElement("canvas").getContext("2d");
  const backingStoreRatio =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;
  const offset = 12 * backingStoreRatio;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";
  ctx.font = "32px Arial";
  ctx.fillText("\uD83C\uDDFA\uD83C\uDDE6", 0, 0); // UA flag, that has no black pixels

  const centerPixel = ctx.getImageData(offset, offset, 1, 1).data;
  return centerPixel[0] !== 0 || centerPixel[1] !== 0 || centerPixel[2] !== 0;
}
