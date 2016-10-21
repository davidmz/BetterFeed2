// ==UserScript==
// @name BetterFeed
// @namespace https://github.com/davidmz/BetterFeed2
// @version 2.1.3
// @description Some cool features for FreeFeed
// @include https://freefeed.net/*
// @exclude https://freefeed.net/v1/*
// ==/UserScript==

!function(e){function t(n){if(a[n])return a[n].exports;var r=a[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var a={};return t.m=e,t.c=a,t.p="",t(0)}([function(e,t){"use strict";function a(e){var t=document.createElement("script");t.src="https://cdn.rawgit.com/davidmz/BetterFeed2/"+e+"/build/better-feed.min.js",t.type="text/javascript",t.charset="utf-8",t.async=!0,document.head.appendChild(t)}var n="bf2-version",r="bf2-next-update",o=Date.now(),l=null,s=0;if(n in localStorage&&(l=localStorage[n],s=parseInt(localStorage[r]),isNaN(s)&&(s=0)),o>s){localStorage[r]=o+36e5;var c=new XMLHttpRequest;c.open("GET","https://api.github.com/repos/davidmz/BetterFeed2/tags?page=1&per_page=1"),c.responseType="json",c.onload=function(){var e=c.response;1==e.length&&"name"in e[0]&&(localStorage[n]=e[0].name,localStorage[r]=o+864e5,null===l&&a(e[0].name))},c.send()}null!==l&&a(l)}]);