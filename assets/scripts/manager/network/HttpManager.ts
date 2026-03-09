import { error } from 'cc';

/**
 * HttpManager - HTTP 請求管理器，用於管理遊戲中的 HTTP 請求。
 * 單例模式設計，確保全局只有一個實例。
 */
export class HttpManager {
    private static instance: HttpManager | null = null; // 單例實例

    private constructor() {} // 私有構造函數，防止外部實例化

    /**
     * 獲取 HttpManager 單例實例。
     * @returns HttpManager 單例。
     */
    public static getInstance(): HttpManager {
        if (!this.instance) {
            this.instance = new HttpManager();
        }
        return this.instance;
    }

    /**
     * 發送 GET 請求。
     * @param url - 請求的 URL。
     * @param params - 請求的查詢參數（可選）。
     * @returns Promise，解析為伺服器返回的數據。
     */
    public async get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
        try {
            const queryString = params ? this.buildQueryString(params) : '';
            const response = await fetch(`${url}${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return await this.handleResponse<T>(response);
        } catch (err) {
            error(`GET 請求失敗: ${url}`, err);
            throw err;
        }
    }

    /**
     * 發送 POST 請求。
     * @param url - 請求的 URL。
     * @param body - 請求的數據。
     * @returns Promise，解析為伺服器返回的數據。
     */
    public async post<T>(url: string, body: Record<string, any>): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            return await this.handleResponse<T>(response);
        } catch (err) {
            error(`POST 請求失敗: ${url}`, err);
            throw err;
        }
    }

    /**
     * 發送 PUT 請求。
     * @param url - 請求的 URL。
     * @param body - 請求的數據。
     * @returns Promise，解析為伺服器返回的數據。
     */
    public async put<T>(url: string, body: Record<string, any>): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            return await this.handleResponse<T>(response);
        } catch (err) {
            error(`PUT 請求失敗: ${url}`, err);
            throw err;
        }
    }

    /**
     * 發送 DELETE 請求。
     * @param url - 請求的 URL。
     * @returns Promise，解析為伺服器返回的數據。
     */
    public async delete<T>(url: string): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return await this.handleResponse<T>(response);
        } catch (err) {
            error(`DELETE 請求失敗: ${url}`, err);
            throw err;
        }
    }

    /**
     * 處理伺服器返回的響應。
     * @param response - Fetch API 的響應對象。
     * @returns Promise，解析為伺服器返回的數據。
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            error(`HTTP 請求失敗，狀態碼: ${response.status}, 錯誤信息: ${errorText}`);
            throw new Error(`HTTP 請求失敗，狀態碼: ${response.status}`);
        }
        return response.json() as Promise<T>;
    }

    /**
     * 構建查詢字符串。
     * @param params - 查詢參數對象。
     * @returns 查詢字符串。
     */
    private buildQueryString(params: Record<string, string | number>): string {
        const query = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        return query ? `?${query}` : '';
    }
}
