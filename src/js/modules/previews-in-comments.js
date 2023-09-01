import h from "../utils/html";
import { registerModule } from "./../base/modules";

const module = registerModule("previews-in-comments", false);

const YOUTUBE_VIDEO_RE =
  /^https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:v=|.+&v=)))([\w-]+)/i;

module.watch(".comment", async (node) => {
  if (node.querySelector(".bf2-prvs")) {
    return;
  }

  const links = node.querySelectorAll(".media-link");

  const previews = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    // Freefeed images
    if (
      link.origin === "https://media.freefeed.net" &&
      /\.(jpg|png|gif|webp)$/.test(link.pathname)
    ) {
      let thumb = link.href.replace(
        /\/attachments(\/\w+)?\/[0-9a-f]{8}-/,
        (t) => {
          const parts = t.split("/");
          if (parts.length === 3) {
            parts.splice(2, 0, "thumbnails");
          } else if (parts.length === 4) {
            parts[2] = "thumbnails";
          }
          return parts.join("/");
        },
      );
      thumb.replace(/\.webp$/, ".jpg");
      previews.push({ thumb, link });
    }

    // Youtube
    if (YOUTUBE_VIDEO_RE.test(link.href)) {
      const [, id] = YOUTUBE_VIDEO_RE.exec(link.href);
      previews.push({
        thumb: `https://img.youtube.com/vi/${id}/default.jpg`,
        link,
        type: "video",
      });
    }
  }

  if (previews.length === 0) {
    return;
  }

  const images = previews.map((p) => {
    const el = h("img.bf2-prvs__item", { src: p.thumb, loading: "lazy" });
    if (p.type === "video") {
      el.classList.add("bf2-prvs__item--video");
    }
    el.addEventListener("click", () => p.link.click());
    el.addEventListener(
      "error",
      () => (el.src = p.thumb.replace("/thumbnails", "")),
    );
    return el;
  });

  const cont = h(".bf2-prvs", images);
  node.appendChild(cont);
});
