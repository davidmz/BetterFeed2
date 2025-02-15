// ==UserScript==
// @name BetterFeed
// @namespace https://github.com/davidmz/BetterFeed2
// @version 2.25.3
// @description Some cool features for FreeFeed
// @include https://freefeed.net/*
// @exclude https://freefeed.net/v1/*
// ==/UserScript==

(function(){"use strict";const i="bf2-version",r="bf2-next-update",s=Date.now();let a=null,o=0;if(i in localStorage&&(a=localStorage[i],o=parseInt(localStorage[r]),isNaN(o)&&(o=0)),s>o){localStorage[r]=s+3600*1e3;var t=new XMLHttpRequest;t.open("GET","https://api.github.com/repos/davidmz/BetterFeed2/tags?page=1&per_page=1"),t.responseType="json",t.onload=function(){var e=t.response;e.length===1&&"name"in e[0]&&(localStorage[i]=e[0].name,localStorage[r]=s+24*3600*1e3,a===null&&l(e[0].name))},t.send()}a!==null&&l(a);function l(e){window.__BetterFeedRoot="https://cdn.jsdelivr.net/gh/davidmz/BetterFeed2@"+e;var n=document.createElement("script");n.src=window.__BetterFeedRoot+"/build/better-feed.min.js",n.type="text/javascript",n.charset="utf-8",n.async=!0,document.head.appendChild(n)}})();
