import closestParent from "../utils/closest-parent";
import forSelect from "../utils/for-select";
import h from "../utils/html";
import IAm from "../utils/i-am";
import LikeAPI from "../utils/likecomm-api";
import matches from "../utils/matches";
import { registerModule } from "./../base/modules";

const module = registerModule("likecomm"),
  authModule = registerModule("likecomm-auth", false);

const likeAPI = new LikeAPI();

module.init((settings) => {
  likeAPI.anonymous = !settings.isModuleEnabled(authModule);

  {
    let firstConnect = true;
    likeAPI.onConnect(() => {
      if (firstConnect) {
        firstConnect = false;
      } else {
        updateLikesOnPage();
      }
    });
    likeAPI.watch();
  }

  document.body.classList.toggle("bf2-likecomm-anon", likeAPI.anonymous);

  document.body.addEventListener("click", (e) => {
    if (!likeAPI.anonymous && matches(e.target, ".bf2-likecomm-act")) {
      const likeBlock = closestParent(e.target, ".bf2-likecomm-cont"),
        commId = closestParent(likeBlock, ".comment").dataset.commId,
        postId = closestParent(likeBlock, ".post").dataset.postId,
        countBlock = likeBlock.querySelector(".bf2-likecomm-count"),
        currentCount = parseInt(countBlock.innerHTML);

      if (!commId) {
        return; // клик по схлопнутым комментам
      }

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
      if (!commId) {
        return; // клик по схлопнутым комментам
      }
      const listEl = h("", h("em", "Loading\u2026"));
      showList(closestParent(e.target, ".bf2-likecomm-cont"), listEl);
      likeAPI.likes(commId).then(async (users) => {
        if (users.length == 0) {
          listEl.innerHTML = "<em>Not available.</em>";
          return;
        }
        listEl.innerHTML = "";
        const iAm = await IAm.ready;
        const withMe = users.some((u) => u === iAm.me);
        users.sort();
        users = users.filter((u) => u !== iAm.me);
        if (withMe) {
          users.unshift(iAm.me);
        }

        users.forEach((u) => {
          listEl.appendChild(h("", h("a.bf2-user-link", { href: `/${u}` }, u)));
        });
      });
    }

    if (!closestParent(e.target, ".bf2-likecomm-cont")) {
      hideList();
    }
  });
});

// Выбираем иконки потому что они появляются в коде позже комментариев
module.watch(".comments .comment .comment-icon", (node) => {
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
  requestLikesForComment(id);

  commentNode.appendChild(
    h(
      ".bf2-likecomm-shift",
      h(
        ".bf2-likecomm-cont",
        {
          id: `likecomm-${id}`,
          "data-lc-updated": "0",
          "data-lc-count": "0",
          "data-lc-my": "0",
          "data-comm-id": id,
        },
        h("span.bf2-likecomm-count", "0"),
        h("i.fa.fa-heart.bf2-likecomm-act"),
      ),
    ),
  );
});

module.watch(".comments .comment .more-comments-link", (node) => {
  const postID = closestParent(node, ".post").dataset.postId;

  requestLikesForPost(postID);

  node.appendChild(
    h(
      ".bf2-likecomm-folded",
      {
        id: `lc-post-${postID}`,
        "data-lc-updated": "0",
        "data-lc-count": "0", // полное число лайков у поста
        "data-lc-my": "0", // полное число лайков пользователя у поста
        "data-post-id": postID,
      },
      " with ",
      h("span.bf2-likecomm-count", "0"),
      h("i.fa.fa-heart"),
      h("span.bf2-likecomm-count-label", " likes"),
    ),
  );
});

let lastUpdated = 0;

likeAPI.onLike(({ id, post_id, likes, my_likes, updated }) => {
  const commNode = id ? document.getElementById(`likecomm-${id}`) : null;
  const foldedNode = post_id
    ? document.getElementById(`lc-post-${post_id}`)
    : null;
  if (updated > lastUpdated) {
    lastUpdated = updated;
  }
  if (id) {
    // лайк комментария
    if (commNode) {
      const ds = commNode.dataset;
      if (parseInt(ds.lcUpdated) < updated) {
        commNode.querySelector(".bf2-likecomm-count").innerHTML =
          likes.toString(10);
        commNode.classList.toggle("bf2-likecomm-liked", likes > 0);
        commNode.classList.toggle("bf2-likecomm-with-my", my_likes > 0);

        ds.lcUpdated = updated.toString(10);
        ds.lcCount = likes.toString(10);
        ds.lcMy = my_likes.toString(10);
      }
    }
    if (foldedNode) {
      if (parseInt(foldedNode.dataset.lcUpdated) < updated) {
        requestLikesForPost(post_id);
      } else {
        drawFoldedLikes(foldedNode);
      }
    }
  } else if (foldedNode && parseInt(foldedNode.dataset.lcUpdated) < updated) {
    // лайки поста
    foldedNode.dataset.lcCount = likes;
    foldedNode.dataset.lcMy = my_likes;
    foldedNode.dataset.lcUpdated = updated.toString(10);

    drawFoldedLikes(foldedNode);
  }
});

function drawFoldedLikes(foldedNode) {
  let likes = parseInt(foldedNode.dataset.lcCount),
    myLikes = parseInt(foldedNode.dataset.lcMy);

  //noinspection UnnecessaryLocalVariableJS
  let [visibleLikes, myVisibleLikes] = forSelect(
    closestParent(foldedNode, ".comments"),
    ".bf2-likecomm-cont",
  ).reduce(
    ([l, m], node) => [
      l + parseInt(node.dataset.lcCount),
      m + parseInt(node.dataset.lcMy),
    ],
    [0, 0],
  );

  likes -= visibleLikes;
  myLikes -= myVisibleLikes;

  foldedNode.querySelector(".bf2-likecomm-count").innerHTML =
    likes.toString(10);
  foldedNode.classList.toggle("bf2-likecomm-liked", likes > 0);
  foldedNode.classList.toggle("bf2-likecomm-with-my", myLikes > 0);
  foldedNode.querySelector(".bf2-likecomm-count-label").innerHTML =
    likes == 1 ? " like" : " likes";
}

function updateLikesOnPage() {
  forSelect(
    document.body,
    ".bf2-likecomm-cont, .bf2-likecomm-folded",
    ({ dataset: ds }) => {
      if (ds.commId) {
        requestLikesForComment(ds.commId);
      } else if (ds.postId) {
        requestLikesForPost(ds.postId);
      }
    },
  );
}

const maxBatchSize = 50;
const fetchTimeOut = 500;
const commentsToFetch = [];
const postsToFetch = [];
let batchFetchTimer = null;

function requestLikesForComment(commId) {
  commentsToFetch.push(commId);
  if (commentsToFetch.length >= maxBatchSize) {
    batchLikesFetch();
  } else {
    if (batchFetchTimer) {
      clearTimeout(batchFetchTimer);
    }
    batchFetchTimer = setTimeout(batchLikesFetch, fetchTimeOut);
  }
}

function requestLikesForPost(postId) {
  postsToFetch.push(postId);
  if (postsToFetch.length >= maxBatchSize) {
    batchLikesFetch();
  } else {
    if (batchFetchTimer) {
      clearTimeout(batchFetchTimer);
    }
    batchFetchTimer = setTimeout(batchLikesFetch, fetchTimeOut);
  }
}

function batchLikesFetch() {
  if (commentsToFetch.length > 0) {
    likeAPI.allLikes(commentsToFetch);
    commentsToFetch.length = 0;
  }
  if (postsToFetch.length > 0) {
    likeAPI.allPostsLikes(postsToFetch);
    postsToFetch.length = 0;
  }
  if (batchFetchTimer) {
    clearTimeout(batchFetchTimer);
    batchFetchTimer = null;
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
