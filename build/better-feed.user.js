// ==UserScript==
// @name BetterFeed
// @namespace https://github.com/davidmz/BetterFeed2
// @version 2.22.1
// @description Some cool features for FreeFeed
// @include https://freefeed.net/*
// @exclude https://freefeed.net/v1/*
// ==/UserScript==

(()=>{var e="bf2-version",t="bf2-next-update",a=Date.now(),n=null,o=0;if(e in localStorage&&(n=localStorage[e],o=parseInt(localStorage[t]),isNaN(o)&&(o=0)),a>o){localStorage[t]=a+36e5;var r=new XMLHttpRequest;r.open("GET","https://api.github.com/repos/davidmz/BetterFeed2/tags?page=1&per_page=1"),r.responseType="json",r.onload=function(){var o=r.response;1===o.length&&"name"in o[0]&&(localStorage[e]=o[0].name,localStorage[t]=a+864e5,null===n&&l(o[0].name))},r.send()}function l(e){window.__BetterFeedRoot="https://cdn.jsdelivr.net/gh/davidmz/BetterFeed2@"+e;var t=document.createElement("script");t.src=window.__BetterFeedRoot+"/build/better-feed.min.js",t.type="text/javascript",t.charset="utf-8",t.async=!0,document.head.appendChild(t)}null!==n&&l(n)})();