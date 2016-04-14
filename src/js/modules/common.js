import {registerModule} from "./../base/modules";

const module = registerModule("common", true, true);

// Свойства постов
module.watch(".timeline-post, .single-post", node => {
    { // ID поста
        const postId = node.querySelector(".post-timestamp").getAttribute("href").match(/^\/.+?\/([\w-]+)/)[1];
        node.id = `post-${postId}`;
        node.dataset.postId = postId;
    }
    { // Автор поста
        const postAuthor = node.querySelector(".post-author").getAttribute("href").substr(1);
        node.dataset.postAuthor = postAuthor;
        node.classList.add(`bf2-post-from-${postAuthor}`);
    }
});

// User cards
module.watch(".user-card", node => {
    {
        node.dataset.userName = node.querySelector(".display-name").getAttribute("href").substr(1);
    }
});