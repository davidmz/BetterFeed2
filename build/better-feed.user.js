// ==UserScript==
// @name BetterFeed
// @namespace https://github.com/davidmz/BetterFeed2
// @version 2.18.5
// @description Some cool features for FreeFeed
// @include https://freefeed.net/*
// @exclude https://freefeed.net/v1/*
// ==/UserScript==

!function(e){function t(a){if(n[a])return n[a].exports;var o=n[a]={exports:{},id:a,loaded:!1};return e[a].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t){"use strict";function n(e){window.__BetterFeedRoot="https://cdn.jsdelivr.net/gh/davidmz/BetterFeed2@"+e;var t=document.createElement("script");t.src=window.__BetterFeedRoot+"/build/better-feed.min.js",t.type="text/javascript",t.charset="utf-8",t.async=!0,document.head.appendChild(t)}var a="bf2-version",o="bf2-next-update",r=Date.now(),l=null,s=0;if(a in localStorage&&(l=localStorage[a],s=parseInt(localStorage[o]),isNaN(s)&&(s=0)),r>s){localStorage[o]=r+36e5;var d=new XMLHttpRequest;d.open("GET","https://api.github.com/repos/davidmz/BetterFeed2/tags?page=1&per_page=1"),d.responseType="json",d.onload=function(){var e=d.response;1===e.length&&"name"in e[0]&&(localStorage[a]=e[0].name,localStorage[o]=r+864e5,null===l&&n(e[0].name))},d.send()}null!==l&&n(l)}]);