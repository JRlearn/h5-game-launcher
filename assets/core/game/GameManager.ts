import { director, log } from 'cc';
import { AppConfig } from '../../app/config/Config';
import { LanguageType } from '../systems/language/LanguageType';
import { BrowserUtils } from '../utils/BrowserUtils';
import { GameState } from './GameState';
import { SceneManager } from '../systems/screen/SceneManager';

/**
 * GameManager - 遊戲管理器
 * 負責管理遊戲全域狀態與生命週期邏輯。
 */
export class GameManager {
    private static _instance: GameManager | null = null;

    /** 當前遊戲狀態 */
    private _gameState: GameState = GameState.INIT;
    /** 當前運行的遊戲 ID */
    private _currentGameId: string | null = null;

    private constructor() {}

    public static getInstance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance!;
    }

    /**
     * 初始化管理器
     */
    public init(): void {
        log('[GameManager] 初始化完成');
        this.setGameState(GameState.INIT);
    }

    /**
     * 獲取啟動配置參數
     * 職責：整合來自環境（如 URL）的參數與應用預設值
     */
    public getLaunchConfig(): { gameId: string | null; path: string; lang: LanguageType | null } {
        const gameId = BrowserUtils.parseURLParam('game');
        const path = BrowserUtils.parseURLParam('path') || AppConfig.DEFAULT_GAME_PREFAB_PATH;
        const lang = BrowserUtils.parseURLParam('lang') || AppConfig.DEFAULT_LANGUAGE;

        return {
            gameId,
            path,
            lang: lang as LanguageType,
        };
    }

    /**
     * 設定遊戲狀態
     */
    public setGameState(state: GameState): void {
        this._gameState = state;
        log(`[GameManager] 遊戲狀態變更: ${state}`);
    }

    public getGameState(): GameState {
        return this._gameState;
    }

    /**
     * 暫停遊戲
     */
    public pauseGame(): void {
        if (this._gameState === GameState.PAUSED) return;

        log('[GameManager] 暫停遊戲');
        this.setGameState(GameState.PAUSED);
        director.pause();
    }

    /**
     * 恢復遊戲
     */
    public resumeGame(): void {
        if (this._gameState !== GameState.PAUSED) return;

        log('[GameManager] 恢復遊戲');
        this.setGameState(GameState.PLAYING);
        director.resume();
    }

    /**
     * 結束遊戲
     */
    public endGame(): void {
        log('[GameManager] 結束遊戲');
        this.setGameState(GameState.GAMEOVER);
    }

    /**
     * 進入遊戲
     * @param gameId 遊戲識別碼
     */
    public async enterGame(gameId: string): Promise<void> {
        this.setGameState(GameState.PLAYING);
        this._currentGameId = gameId;
        await SceneManager.getInstance().enterGame(gameId);
    }

    /**
     * 返回大廳
     */
    public returnToLobby(): void {
        this.setGameState(GameState.LOBBY);
        this._currentGameId = null;
        SceneManager.getInstance().returnToLobby();
    }
}
