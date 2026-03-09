import { _decorator, EventKeyboard, EventTarget, input, Input, KeyCode, log } from 'cc';

/**
 * EventManager - 事件管理器，用於管理全局事件的註冊、觸發和移除。
 * 單例模式設計，確保全局只有一個實例。
 */
export class EventManager {
    private static instance: EventManager | null = null; // 單例實例
    private eventTarget: EventTarget = new EventTarget(); // Cocos 提供的事件系統
    // 私有構造函數，防止外部實例化
    private constructor() {
        console.log('EventManager 初始化');
        this.initTestCase(); // 初始化測試事件
    }

    public static getInstance(): EventManager {
        if (!this.instance) {
            this.instance = new EventManager();
        }
        return this.instance;
    }

    /**
     * 註冊事件。
     * @param eventName - 事件名稱。
     * @param callback - 事件觸發時的回調函數。
     * @param target - 回調函數的執行上下文（可選）。
     */
    public on(eventName: string, callback: (...args: any[]) => void, target?: any): void {
        this.eventTarget.on(eventName, callback, target);
        log(`事件註冊成功: ${eventName}`);
    }

    /**
     * 註冊一次性事件（觸發一次後自動移除）。
     * @param eventName - 事件名稱。
     * @param callback - 事件觸發時的回調函數。
     * @param target - 回調函數的執行上下文（可選）。
     */
    public once(eventName: string, callback: (...args: any[]) => void, target?: any): void {
        this.eventTarget.once(eventName, callback, target);
        log(`一次性事件註冊成功: ${eventName}`);
    }

    /**
     * 觸發事件。
     * @param eventName - 事件名稱。
     * @param args - 傳遞給回調函數的參數（可選）。
     */
    public emit(eventName: string, ...args: any[]): void {
        this.eventTarget.emit(eventName, ...args);
        log(`事件觸發: ${eventName}`);
    }

    /**
     * 移除事件。
     * @param eventName - 事件名稱。
     * @param callback - 要移除的回調函數（可選）。
     * @param target - 回調函數的執行上下文（可選）。
     */
    public off(eventName: string, callback?: (...args: any[]) => void, target?: any): void {
        this.eventTarget.off(eventName, callback, target);
        log(`事件移除成功: ${eventName}`);
    }

    /**
     * 移除目標所有事件。
     * @param target - 要移除的目標上下文（可選）。
     */
    public targetOff(target: any): void {
        this.eventTarget.targetOff(target);
        log('該對象所有事件已移除', target);
    }

    /////////////////////// 測試用 //////////////////////////

    private testCaseMap: Map<number, Function[]> = new Map<number, Function[]>();
    /**
     * 註冊測試事件(註冊1~9的數字按下時的事件)。
     */
    public subscribeTestCase(key: number, callback: Function): void {
        // 1. 檢查 key 是否在範圍內
        if (key < 0 || key > 9) {
            log(`測試事件註冊失敗: ${key} 不在範圍0~9內`);
            return;
        }

        this.testCaseMap.get(key)?.push(callback);
    }

    public clearAllTestCase(): void {
        this.testCaseMap.clear(); // 清空測試事件映射
        this.cerateTestCaseMap();
    }

    private initTestCase() {
        this.cerateTestCaseMap();
        input.on(Input.EventType.KEY_DOWN, (event: EventKeyboard) => {
            let key = event.keyCode - KeyCode.NUM_0; // 將按鍵碼轉換為 0~9 的範圍
            if (key < 0 || key > 9) {
                log(`測試事件註冊失敗: ${key} 不在範圍0~9內`);
                return;
            }
            log(`廣播測試case事件: ${key}`);
            this.emitTestCase(key);
        });
    }

    private emitTestCase(key: number) {
        this.testCaseMap.get(key)?.forEach((callback) => {
            callback?.();
        });
    }

    private cerateTestCaseMap() {
        for (let i = 0; i < 10; i++) {
            this.testCaseMap.set(i, []);
        }
    }
    /////////////////////////////////////////////////////////
}
