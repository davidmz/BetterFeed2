import {registeredModules} from "./modules";

export default class Settings {

    constructor(o = null, trustedData = false) {
        this.modules = new Map;
        registeredModules.forEach(m => {
            if (!m.alwaysEnabled) {
                this.modules.set(m.name, m.enabledByDefault);
            }
        });

        this.hideAliens = false;
        this.commentCloudsMode = 2;

        // инициализация из объекта
        if (o) {
            (o.modules || []).forEach(([k, v]) => {
                if (trustedData || this.modules.has(k)) {
                    this.modules.set(k, !!v);
                }
            });
            this.hideAliens = !!o.hideAliens;
            if (o.commentCloudsMode === 1 || o.commentCloudsMode === 2) {
                this.commentCloudsMode = o.commentCloudsMode;
            }
        }
    }

    toJSON() {
        const o = {modules: []};
        this.modules.forEach((v, k) => o.modules.push([k, v]));
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
            m
            && (m.alwaysEnabled || !this.modules.has(m.name) && m.enabledByDefault || this.modules.get(m.name))
            && !m.requiredModules.map(name => registeredModules.get(name)).some(m => !this.isModuleEnabled(m))
        );
    }
}
