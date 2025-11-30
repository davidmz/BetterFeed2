import { attPreviewUrl } from "../utils/api";
import h from "../utils/html";
import { registerModule } from "./../base/modules";

const module = registerModule("previews-in-comments", false);

const YOUTUBE_VIDEO_RE =
  /^https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:v=|.+&v=)))([\w-]+)/i;

module.watch(".comment", async (node) => {
  if (
    node.querySelector(".bf2-prvs") ||
    node.querySelector(".comment > [class^='_previews']") // native support
  ) {
    return;
  }

  const links = node.querySelectorAll(".media-link");

  const previews = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    // Freefeed images
    if (
      link.origin === "https://media.freefeed.net" &&
      link.pathname.startsWith("/attachments/") &&
      /\.(jpg|png|gif|webp)$/.test(link.pathname)
    ) {
      const m =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.exec(
          link.pathname,
        );
      if (!m) {
        continue;
      }
      previews.push({ thumb: attPreviewUrl(m[0], 120, 120), link });
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
    return el;
  });

  const cont = h(".bf2-prvs", images);
  node.appendChild(cont);
});
