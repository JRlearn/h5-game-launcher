import { LanguageManager } from '../../../../../core/systems/language/LanguageManager';

/**
 * GameConfig - 戰神賽特遊戲配置
 * 職責：集中管理遊戲相關的常數、資源包名稱等。
 */
export class GameConfig {
    /** 遊戲主資源包名稱 */
    public static readonly BUNDLE_NAME = 'stormOfSeth';

    /** 語系資源包前綴 */
    private static readonly RES_BUNDLE_PREFIX = 'stormOfSeth_res_';

    /**
     * 獲取當前語系對應的資源包名稱
     * @returns 資源包名稱 (例如: stormOfSeth_res_EN-us)
     */
    public static getResBundleName(): string {
        const lang = LanguageManager.getInstance().getLanguage();
        return `${this.RES_BUNDLE_PREFIX}${lang}`;
    }
}
