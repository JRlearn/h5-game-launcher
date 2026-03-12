import { _decorator, director, log } from 'cc';
import { AppConfig } from '../../../config/AppConfig';

/**
 * GameManager - 遊戲管理器，用於管理遊戲的全局邏輯與啟動分流。
 */
export class GameManager {
    /** 單例 */
    private static _instance: GameManager | null = null;
    /** 遊戲狀態 */
    private _gameState: string = 'INIT';
    /** 私有構造 */
    private constructor() {}

    /**
     * 獲取單例
     */
    public static getInstance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }

    /**
     * 初始化
     */
    public init(): void {
        log('[GameManager] 初始化完成');
        this.setGameState('INIT');
    }

    /**
     * 獲取啟動配置參數（解析 URL）
     */
    public getLaunchConfig() {
        const gameId = this._parseURLParams('game');
        const path = this._parseURLParams('path') || AppConfig.DEFAULT_GAME_PREFAB_PATH;
        const lang = this._parseURLParams('lang');

        return {
            gameId,
            path,
            lang: lang as any,
        };
    }

    /**
     * 設定遊戲狀態
     */
    public setGameState(state: string): void {
        this._gameState = state;
        log(`[GameManager] 遊戲狀態已更改為: ${state}`);
    }

    /**
     * 獲取遊戲狀態
     */
    public getGameState(): string {
        return this._gameState;
    }

    /**
     * 解析 URL 參數
     */
    private _parseURLParams(key: string): string | null {
        if (typeof window === 'undefined' || !window.location) return null;
        try {
            const urlParams = new URL(window.location.href).searchParams;
            return urlParams.get(key);
        } catch (e) {
            return null;
        }
    }

    /**
     * 暫停遊戲
     */
    public pauseGame(): void {
        log('遊戲已暫停');
        this.setGameState('PAUSED');
        director.pause();
    }

    /**
     * 恢復遊戲
     */
    public resumeGame(): void {
        log('遊戲已恢復');
        this.setGameState('RUNNING');
        director.resume();
    }

    /**
     * 結束遊戲
     */
    public endGame(): void {
        log('遊戲已結束');
        this.setGameState('GAMEOVER');
    }
}
