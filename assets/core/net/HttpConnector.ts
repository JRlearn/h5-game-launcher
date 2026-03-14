import { log, error } from 'cc';

/**
 * HttpConnector - HTTP 請求連接器
 * 基於 Fetch API 實作的異步並行請求工具。
 */
export class HttpConnector {
    private static _instance: HttpConnector | null = null;

    public static getInstance(): HttpConnector {
        if (!this._instance) {
            this._instance = new HttpConnector();
        }
        return this._instance!;
    }

    private constructor() {}

    /**
     * 發送 GET 請求
     */
    public async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'GET', headers });
    }

    /**
     * 發送 POST 請求
     */
    public async post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body),
        });
    }

    /**
     * 核心請求方法
     */
    public async request<T>(url: string, options: RequestInit): Promise<T> {
        log(`[HTTP][${options.method}] Requesting: ${url}`);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            return data as T;
        } catch (err) {
            error(`[HTTP] Request Failed: ${url}`, err);
            throw err;
        }
    }
}
