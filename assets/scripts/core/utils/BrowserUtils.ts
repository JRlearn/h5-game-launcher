/**
 * BrowserUtils - 瀏覽器相關工具
 */
export class BrowserUtils {
    /**
     * 解析 URL 參數
     * @param key 參數名稱
     * @returns 參數值或 null
     */
    public static parseURLParam(key: string): string | null {
        if (typeof window === 'undefined' || !window.location) return null;
        try {
            const urlParams = new URL(window.location.href).searchParams;
            return urlParams.get(key);
        } catch (e) {
            return null;
        }
    }
}
