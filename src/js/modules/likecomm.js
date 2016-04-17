import {registerModule} from "./../base/modules";
import LikeAPI from "../utils/likecomm-api";
import IAm from "../utils/i-am";
import closestParent from "../utils/closest-parent";
import h from "../utils/html";
import matches from "../utils/matches";

const module = registerModule("likecomm");

const likeAPI = new LikeAPI();

likeAPI.onLike(({id, likes, withMy})=> {
    const node = document.getElementById(`likecomm-${id}`);
    if (node) {
        node.querySelector(".bf2-likecomm-count").innerHTML = likes.toString(10);
        node.classList.toggle("bf2-likecomm-liked", likes > 0);
        node.classList.toggle("bf2-likecomm-with-my", withMy);
    }
});

module.init(() => {
    likeAPI.watch();

    document.body.addEventListener("click", e => {
        if (matches(e.target, ".bf2-likecomm-act")) {
            const likeBlock = closestParent(e.target, ".bf2-likecomm-cont"),
                commId = closestParent(likeBlock, ".comment").dataset.commId,
                postId = closestParent(likeBlock, ".post").dataset.postId,
                countBlock = likeBlock.querySelector(".bf2-likecomm-count"),
                currentCount = parseInt(countBlock.innerHTML);

            if (likeBlock.classList.contains("bf2-likecomm-with-my")) {
                likeAPI.unlike(commId);
                // оптимистично обновляем сразу
                countBlock.innerHTML = (currentCount - 1).toString(10);
                likeBlock.classList.toggle("bf2-likecomm-liked", currentCount > 1);
                likeBlock.classList.remove("bf2-likecomm-with-my");
            } else {
                likeAPI.like(commId, postId);
                // оптимистично обновляем сразу
                countBlock.innerHTML = (currentCount + 1).toString(10);
                likeBlock.classList.add("bf2-likecomm-liked");
                likeBlock.classList.add("bf2-likecomm-with-my");
            }
        }

        if (matches(e.target, ".bf2-likecomm-count")) {
            const commId = closestParent(e.target, ".comment").dataset.commId;
            const listEl = h("", "Loading\u2026");
            showList(closestParent(e.target, ".bf2-likecomm-cont"), listEl);
            likeAPI.likes(commId).then(async(users) => {
                listEl.innerHTML = "";
                const iAm = await IAm.ready;
                const withMe = closestParent(e.target, ".bf2-likecomm-cont").classList.contains("bf2-likecomm-with-my");
                users.sort();
                users = users.filter(u => u !== iAm.me);
                if (withMe) {
                    users.unshift(iAm.me);
                }

                users.forEach(u => {
                    listEl.appendChild(h("", h("a", {href: `/${u}`}, u)));
                });
            });
        }

        if (!closestParent(e.target, ".bf2-likecomm-cont")) {
            hideList();
        }
    });
});

// Выбираем иконки потому что они появляются в коде позже комментариев
module.watch(".comments .comment .comment-icon", node => {
    if (!node.id) {
        // ссылка "Add comment"
        return;
    }
    const commentNode = closestParent(node, ".comment");
    if (commentNode.querySelector("textarea")) {
        // Форма создания нового коммента
        return;
    }
    const id = node.id.match(/^comment-(.+)/)[1];
    commentNode.dataset.commId = id;
    requestLikesForId(id);

    commentNode.appendChild(h(".bf2-likecomm-shift",
        h(".bf2-likecomm-cont", {id: `likecomm-${id}`},
            h("span.bf2-likecomm-count", ""),
            h("i.fa.fa-heart.bf2-likecomm-act")
        )
    ));
});


const maxBatchSize = 50;
let commentsToFetch = [];
let batchFetchTimeout = null;

function requestLikesForId(commId) {
    commentsToFetch.push(commId);
    if (commentsToFetch.length >= maxBatchSize) {
        batchComLikes();
    } else {
        if (batchFetchTimeout) {
            clearTimeout(batchFetchTimeout);
        }
        batchFetchTimeout = setTimeout(batchComLikes, 500);
    }
}

function batchComLikes() {
    if (commentsToFetch.length > 0) {
        likeAPI.allLikes(commentsToFetch);
        commentsToFetch = [];
    }
    if (batchFetchTimeout) {
        clearTimeout(batchFetchTimeout);
        batchFetchTimeout = null;
    }
}

const listEl = h(".bf2-likecomm-list");
function showList(pivot, el) {
    listEl.innerHTML = "";
    listEl.appendChild(el);
    pivot.appendChild(listEl);
}

function hideList() {
    if (listEl.parentNode) {
        listEl.parentNode.removeChild(listEl);
    }
}