import {registeredModules} from "./modules";

export default class Settings {

    constructor(o = null, trustedData = false) {
        this.modules = new Map;
        registeredModules.forEach(m => {
            if (!m.alwaysEnabled) {
                this.modules.set(m.name, m.enabledByDefault);
            }
        });

        this.hidePostsFrom = new Set;
        this.hideAliens = false;
        this.commentCloudsMode = 2;

        // инициализация из объекта
        if (o) {
            (o.modules || []).forEach(([k, v]) => {
                if (trustedData || this.modules.has(k)) {
                    this.modules.set(k, !!v);
                }
            });
            (o.hidePostsFrom || []).forEach(u => this.hidePostsFrom.add(u));
            this.hideAliens = !!o.hideAliens;
            if (o.commentCloudsMode === 1 || o.commentCloudsMode === 2) {
                this.commentCloudsMode = o.commentCloudsMode;
            }
        }
    }

    toJSON() {
        const o = {modules: [], hidePostsFrom: []};
        this.modules.forEach((v, k) => o.modules.push([k, v]));
        this.hidePostsFrom.forEach(u => o.hidePostsFrom.push(u));
        o.hideAliens = this.hideAliens;
        o.commentCloudsMode = this.commentCloudsMode;
        return o;
    }

    /**
     * @param {Module} m
     * @return {boolean}
     */
    isModuleEnabled(m) {
        return (
            (m.alwaysEnabled || !this.modules.has(m.name) && m.enabledByDefault || this.modules.get(m.name))
            && !m.requiredModules.map(name => registeredModules.get(name)).some(m => !this.isModuleEnabled(m))
        );
    }
}
