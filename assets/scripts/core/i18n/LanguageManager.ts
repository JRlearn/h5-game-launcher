import { log, error } from 'cc';
import { EventBus } from '../../core/event/EventBus';
import { EventName } from '../../core/event/EventName';
import { LanguageType } from './LanguageType';

/**
 * LanguageManager - 多語系管理器，用於管理遊戲中的多語言文本。
 * 單例模式設計，確保全局只有一個實例。
 */
export class LanguageManager {
    private static instance: LanguageManager | null = null; // 單例實例
    private currentLanguage: LanguageType = LanguageType.EN_US; // 當前語言，默認為英文
    private translations: Map<string, any> = new Map(); // 存儲語言對應的翻譯表

    private constructor() {} // 私有構造函數，防止外部實例化

    /**
     * 獲取 LanguageManager 單例實例。
     * @returns LanguageManager 單例。
     */
    public static getInstance(): LanguageManager {
        if (!this.instance) {
            this.instance = new LanguageManager();
        }
        return this.instance!;
    }

    /**
     * 初始化語言管理器。
     * @param defaultLanguage - 默認語言。
     */
    public init(defaultLanguage: LanguageType): void {
        this.currentLanguage = defaultLanguage;
        log(`語言管理器初始化完成，當前語言: ${this.currentLanguage}`);
    }

    /**
     * 加載語言資源。
     * @param language - 語言代碼（如 'en', 'zh', 'jp'）。
     * @param translations - 該語言的翻譯表。
     */
    public loadLanguage(language: LanguageType, translations: any): void {
        this.translations.set(language, translations);
        log(`語言資源加載完成: ${language}`);
    }

    /**
     * 切換語言。
     * @param language - 要切換的語言代碼。
     */
    public setLanguage(language: LanguageType): void {
        if (!this.translations.has(language)) {
            error(`語言資源未加載: ${language}`);
            return;
        }
        this.currentLanguage = language;
        log(`語言已切換為: ${language}`);
        EventBus.emit(EventName.LANGUAGE_CHANGED, undefined);
    }

    /**
     * 獲取當前語言。
     * @returns 當前語言代碼。
     */
    public getLanguage(): LanguageType {
        return this.currentLanguage;
    }

    /**
     * 獲取翻譯文本。
     * @param key - 翻譯鍵值。
     * @returns 翻譯文本，如果未找到則返回鍵值本身。
     */
    public t(key: string): string {
        const translations = this.translations.get(this.currentLanguage);
        if (translations && translations[key]) {
            return translations[key];
        }
        log(`翻譯未找到: ${key}`);
        return key; // 如果未找到翻譯，返回鍵值本身
    }
}
