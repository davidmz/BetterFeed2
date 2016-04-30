import {registerModule} from "./../base/modules";
import h from "../utils/html";

const module = registerModule("moon");

//noinspection HtmlUnknownAttribute 
const moonXML = `<svg class="bf2-moon" viewBox="-4 -4 108 108" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <circle class="bf2-moon-shadow" cx="50" cy="50" r="54"></circle>
        <path class="bf2-moon-light" d="M 50 0 a 30 50 0 0 0 0 100 a 50 50 0 0 0 0 -100 Z"></path>
    </svg>`;

module.watch("h1 a:first-child", node => {
    node.parentNode.insertBefore(h("span"), node.nextSibling).innerHTML = moonXML;
    drawMoonPhase(currentMoonPhase());
    setInterval(() => drawMoonPhase(currentMoonPhase()), 1000 * 3600);
});

const newMoon = new Date("Thu Apr 07 2016 14:22:37 GMT+0300").getTime(),
    month = Math.round(86400 * 29.53058812 * 1000);

function currentMoonPhase() {
    return (((new Date()).getTime() - newMoon) / month) % 1;
}

// phase = [0..1], 0 = 1 = новолуние, 0.5 = полнолуние
function drawMoonPhase(phase) {
    const moonEl = document.querySelector(".bf2-moon");
    if (!moonEl) {
        return;
    }
    const lightEl = moonEl.querySelector(".bf2-moon-light");
    const radius = 50;
    const xRadius = radius * Math.abs(Math.cos(2 * Math.PI * phase));

    let path;
    if (phase < 0.25) {
        path = `M 50 0 a ${xRadius} 50 0 0 1 0 100 a 50 50 0 0 0 0 -100 Z`;
    } else if (phase < 0.5) {
        path = `M 50 0 a ${xRadius} 50 0 0 0 0 100 a 50 50 0 0 0 0 -100 Z`;
    } else if (phase < 0.75) {
        path = `M 50 0 a 50 50 0 0 0 0 100 a ${xRadius} 50 0 0 0 0 -100 Z`;
    } else {
        path = `M 50 0 a 50 50 0 0 0 0 100 a ${xRadius} 50 0 0 1 0 -100 Z`;
    }
    lightEl.setAttribute("d", path);

    if (Math.abs(0.5 - phase) < 0.05) {
        moonEl.parentNode.setAttribute("title", "Achtung Vollmond!");
    } else {
        moonEl.parentNode.removeAttribute("title");
    }
}