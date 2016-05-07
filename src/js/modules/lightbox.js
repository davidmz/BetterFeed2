import {registerModule} from "./../base/modules";
import closestParent from "../utils/closest-parent";
import forSelect from "../utils/for-select";
import * as inject from "../utils/inject";
import bfRoot from "../utils/bf-root";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/src/js/ui/photoswipe-ui-default";

import htmlCode from "html!./../../photoswipe/photoswipe.html";

const module = registerModule("lightbox");

module.init(() => {
    document.body.insertAdjacentHTML("beforeend", htmlCode);
    inject.CSS(`${bfRoot}/src/photoswipe/photoswipe.css`);
    inject.CSS(`${bfRoot}/src/photoswipe/default-skin/default-skin.css`);
    document.body.classList.add("bf2-lightboxed-images");
});

module.init(() => {
    document.addEventListener("click", e => {
        if (e.button != 0) {
            return;
        }

        const imgAts = closestParent(e.target, ".image-attachments");
        if (!imgAts) {
            return;
        }
        e.preventDefault();

        const items = forSelect(imgAts, ".attachment > a").map(a => {
            const m = a.title.match(/(\d+)\D(\d+)px\)$/);
            return {
                w: m ? parseInt(m[1]) : 0,
                h: m ? parseInt(m[2]) : 0,
                src: a.href,
                msrc: a.firstElementChild.src,
                _att: a.parentNode
            };
        }).filter(it => it.w > 0);

        let index = 0;
        const clicked = closestParent(e.target, ".attachment");
        items.some(({_att}, i) => {
            if (_att === clicked) {
                index = i;
                return true;
            }
            return false;
        });

        const slideShow = new PhotoSwipe(
            document.body.querySelector(".bf2-pswp"),
            PhotoSwipeUI_Default,
            items,
            {
                bgOpacity: 0.8,
                history: false,
                getThumbBoundsFn: thumbBoundsFn(items),
                shareButtons: [{id: 'download', label: 'Download image', url: '{{raw_image_url}}', download: true}],
                index
            }
        );
        slideShow.init();
    });
});

function thumbBoundsFn(items) {
    return idx => {
        const rect = items[idx]._att.querySelector("img").getBoundingClientRect();
        const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
        return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
    };
}