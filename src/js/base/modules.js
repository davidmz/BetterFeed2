import forSelect from "../utils/for-select";

export const modules = new Map; // name → module

class Module {
    constructor(name, enabledByDefault = true, alwaysEnabled = false) {
        this.name = name;
        this.alwaysEnabled = alwaysEnabled;
        this.enabledByDefault = enabledByDefault;
        this._watchers = [];
        this._initiators = [];
    }

    init(callback) {
        this._initiators.push(callback);
    }

    watch(selector, callback) {
        this._watchers.push({selector, callback});
    }

    _initiate(settings) {
        this._initiators.forEach(c => c(settings));
        this._watchers.forEach(({selector, callback}) => forSelect(document.body, selector, n => callback(n, settings)));
    }

    _trigger(node) {
        this._watchers.forEach(({selector, callback}) => forSelect(node, selector, n => callback(n, settings)));
    }
}

export function registerModule(name, enabledByDefault = true, alwaysEnabled = false) {
    const m = new Module(name, enabledByDefault, alwaysEnabled);
    modules.set(name, m);
    return m;
}

let settings = null;
/**
 *
 * @param {Settings} aSettings
 */
export function startObserver(aSettings) {
    if (settings) {
        return;
    }
    settings = aSettings;

    modules.forEach(m => {
        if (settings.isModuleEnabled(m)) {
            m._initiate(settings);
        }
    });

    let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            for (let i = 0, l = mutation.addedNodes.length; i < l; i++) {
                let node = mutation.addedNodes[i];
                if (node.nodeType == Node.ELEMENT_NODE) {
                    modules.forEach(m => {
                        if (settings.isModuleEnabled(m)) {
                            m._trigger(node, settings);
                        }
                    });
                }
            }
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});

}
