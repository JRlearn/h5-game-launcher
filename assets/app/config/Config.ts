import { LanguageType } from '../../core/systems/language/LanguageType';

/**
 * 應用程式全域設定檔 (AppConfig)
 *
 * 集中管理遊戲引擎啟動時所需要的靜態參數。
 * 包含：專案基本架構路徑、預設支援的多國語系清單、大廳與遊戲的入口設定。
 * 開發者在專案結構改動時，應優先在此處修改設定以達到全域生效。
 */
export class AppConfig {
    // ==========================================
    // 資源包 (Asset Bundle) 相關配置
    // ==========================================

    /** 共用資源包的名稱 (包含共用 UI, 音效, 語系等) */
    public static readonly BUNDLE_COMMON = 'bundles/common';
    /** 遊戲大廳的資源包名稱 */
    public static readonly BUNDLE_LOBBY = 'lobby_res';
    /** 子遊戲的資源包存放目錄前綴 (URL 會傳入例如 bullsAndCows，我們會在前面加上這個前綴) */
    public static readonly GAMES_DIR_PREFIX = 'bundles/games/';

    // ==========================================
    // 場景 (Scene) 相關配置
    // ==========================================

    /** 啟動場景名稱 (Launcher) */
    public static readonly SCENE_BOOT = 'Launcher';
    /** 核心主場景 (唯一持久場景 App) */
    public static readonly SCENE_MAIN = 'App';
    /** 大廳的預設場景名稱 (相容舊架構或作為備援) */
    public static readonly SCENE_LOBBY = 'Lobby';
    /** 子遊戲預設的進入預製體路徑 (單場景架構) */
    public static readonly DEFAULT_GAME_PREFAB_PATH = 'prefabs/GameRoot';
    /** 子遊戲預設的進入場景路徑 (舊架構相容) */
    public static readonly DEFAULT_GAME_SCENE_PATH = 'scenes/Scene';

    // ==========================================
    // 多國語系 (i18n) 相關配置
    // ==========================================

    /** 專案預設啟用的語系 (Launcher 啟動後會預設顯示此語系) */
    public static readonly DEFAULT_LANGUAGE = LanguageType.ZH_TW;

    /**
     * 專案支援的所有語系清單
     * Launcher 初始化時，會自動去 common bundle 下的 `i18n/${lang}.json` 抓取資料並註冊。
     * 若要擴充語言，請直接在此陣列加入對應的 LanguageType。
     */
    public static readonly SUPPORTED_LANGUAGES: LanguageType[] = [
        LanguageType.ZH_TW,
        LanguageType.EN_US,
    ];

    /** 語系 JSON 檔在 Common Bundle 中的存放目錄路徑 */
    public static readonly I18N_DIR = 'i18n/';

    // ==========================================
    // UI 與 相機 相關配置
    // ==========================================

    /** 相機預設 Z 軸位置 */
    public static readonly CAMERA_Z = 1000;
    /** 相機預設背景顏色 (RGBA) - 使用暗藍色以便區分渲染狀態 */
    public static readonly CAMERA_CLEAR_COLOR = { r: 30, g: 30, b: 50, a: 255 };
    /** 預設 UI 設計解析度寬度 */
    public static readonly DESIGN_WIDTH = 1920;
    /** 預設 UI 設計解析度高度 */
    public static readonly DESIGN_HEIGHT = 1080;
}
