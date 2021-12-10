import localforage from "localforage";
import { registerModule } from "./../base/modules";

const module = registerModule("ani-gifs");

const db = localforage.createInstance({ name: "BF2_aniGifs" });

module.watch(
  ".image-attachments .attachment img[src$='.gif'][src*='/attachments/']:not(.bf2-gif)",
  async (img) => {
    img.classList.add("bf2-gif");
    if (await isAnimated(img.src)) {
      img.parentNode.classList.add("bf2-animated-gif");
      img.removeAttribute("srcSet");
      drawImage(img);
    }
  }
);

async function isAnimated(src) {
  try {
    const id = src.match(/([\w-]+)\.gif$/)[1];
    let ani = await db.getItem(id);
    if (ani === null) {
      ani = await isAnimatedByContent(src);
      db.setItem(id, ani);
    }
    return ani;
  } catch (e) {
    console.warn(`Gif analyze problem (${src}): ${e}`);
    return false;
  }
}

// https://gist.github.com/marckubischta/261ad8427a214022890b
// (was https://gist.github.com/lakenen/3012623)
function isAnimatedByContent(src) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", src, true);
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("load", () => {
      var arr = new Uint8Array(xhr.response),
        i,
        len,
        length = arr.length,
        frames = 0;

      // make sure it's a gif (GIF8)
      if (
        arr[0] !== 0x47 ||
        arr[1] !== 0x49 ||
        arr[2] !== 0x46 ||
        arr[3] !== 0x38
      ) {
        reject("Not a gif file");
        return;
      }

      //ported from php http://www.php.net/manual/en/function.imagecreatefromgif.php#104473
      //an animated gif contains multiple "frames", with each frame having a
      //header made up of:
      // * a static 3-byte sequence (\x00\x21\xF9
      // * one byte indicating the length of the header (usually \x04)
      // * variable length header (usually 4 bytes)
      // * a static 2-byte sequence (\x00\x2C) (some variants may use \x00\x21 ?)
      // We read through the file as long as we haven't reached the end of the file
      // and we haven't yet found at least 2 frame headers
      for (i = 0, len = length - 3; i < len && frames < 2; ++i) {
        if (
          /* arr[i] === 0x00 && */ arr[i + 1] === 0x21 &&
          arr[i + 2] === 0xf9
        ) {
          let blockLength = arr[i + 3],
            afterBlock = i + 4 + blockLength;
          if (
            afterBlock + 1 < length &&
            arr[afterBlock] === 0x00 &&
            (arr[afterBlock + 1] === 0x2c || arr[afterBlock + 1] === 0x21)
          ) {
            frames++;
          }
        }
      }

      // if frame count > 1, it's animated
      resolve(frames > 1);
    });
    xhr.send();
  });
}

function drawImage(img) {
  if (img.src.match(/^data:/)) return;
  const canvas = document.createElement("canvas");
  const w = (canvas.width = img.width);
  const h = (canvas.height = img.height);

  const img2 = new Image();
  img2.crossOrigin = "anonymous";
  img2.onload = () => {
    canvas.getContext("2d").drawImage(img2, 0, 0, w, h);
    img.src = canvas.toDataURL();
  };
  img2.src = img.src;
}
