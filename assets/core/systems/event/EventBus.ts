import { EventTarget } from 'cc';
import { GameEventMap } from './GameEvent';

/**
 * EventBus - 統一事件入口，使用 Cocos EventTarget 實現。
 * 提供靜態方法以方便全局調用，並透過 GameEventMap 確保型別安全。
 */
export class EventBus {
    private static _eventTarget: EventTarget = new EventTarget();

    /**
     * 註冊事件
     * @param event 事件名稱
     * @param callback 回調函數
     * @param target 執行的目標上下文
     */
    public static on<K extends keyof GameEventMap>(
        event: K,
        callback: (data: GameEventMap[K]) => void,
        target?: any,
    ) {
        this._eventTarget.on(event as string, callback, target);
    }

    /**
     * 註冊一次性事件
     * @param event 事件名稱
     * @param callback 回調函數
     * @param target 執行的目標上下文
     */
    public static once<K extends keyof GameEventMap>(
        event: K,
        callback: (data: GameEventMap[K]) => void,
        target?: any,
    ) {
        this._eventTarget.once(event as string, callback, target);
    }

    /**
     * 發送事件
     * @param event 事件名稱
     * @param data 事件數據
     */
    public static emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]) {
        this._eventTarget.emit(event as string, data);
    }

    /**
     * 移除事件
     * @param event 事件名稱
     * @param callback 回調函數
     * @param target 執行的目標上下文
     */
    public static off<K extends keyof GameEventMap>(
        event: K,
        callback?: (data: GameEventMap[K]) => void,
        target?: any,
    ) {
        this._eventTarget.off(event as string, callback, target);
    }

    /**
     * 移除 target 所有事件
     * @param target 目標上下文
     */
    public static targetOff(target: any) {
        this._eventTarget.targetOff(target);
    }
}
