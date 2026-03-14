import { director, game, Game, log, error } from 'cc';
import { AppConfig } from '../../app/config/Config';
import { LanguageType } from '../systems/language/LanguageType';
import { BrowserUtils } from '../utils/BrowserUtils';
import { GameState } from './GameState';
import { SceneManager } from '../systems/screen/SceneManager';
import { SoundManager } from '../systems/audio/SoundManager';
import { ResManager } from '../systems/resource/ResManager';
import { EventBus } from '../systems/event/EventBus';
import { EventName } from '../systems/event/EventName';
import { HttpConnector } from '../net/HttpConnector';

/**
 * GameManager - 遊戲管理器
 * 職責：全域生命週期調度、環境門戶 (Facade)、會話狀態管理。
 */
export class GameManager {
    private static _instance: GameManager | null = null;

    /** 當前遊戲狀態 */
    private _gameState: GameState = GameState.INIT;
    /** 當前運行的遊戲 ID */
    private _currentGameId: string | null = null;

    // --- 使用者會話資訊 (Session) ---
    private _userId: string = 'Guest';
    private _balance: number = 0;
    private _isLoggedIn: boolean = false;

    private constructor() {}

    public static getInstance(): GameManager {
        if (!GameManager._instance) {
            GameManager._instance = new GameManager();
        }
        return GameManager._instance!;
    }

    /**
     * 啟動與引導序列 (Bootstrap)
     * 負責應用程式最原生的初始化邏輯。
     */
    public async bootstrap(): Promise<void> {
        log('[GameManager] 執行 Bootstrap 引導序列');
        this.setupEnvironmentalListeners();
        this.init();

        // 模擬初始登入 (Phase 3)
        await this.login('mock-session-token');
    }

    /**
     * 使用者登入
     * @param token 登入憑證
     */
    public async login(token: string): Promise<void> {
        log(`[GameManager] 執行登入程序, token: ${token}`);
        try {
            // 目前使用 Mock 資料替代，未來可對接真實 API
            // const data = await HttpConnector.getInstance().get<any>(`https://api.game.com/user/profile?token=${token}`);
            
            // 模擬請求延遲
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockData = {
                userId: 'Billy_888',
                balance: 10000.00
            };

            this._userId = mockData.userId;
            this._balance = mockData.balance;
            this._isLoggedIn = true;

            log(`[GameManager] 登入成功: ${this._userId}, 餘額: ${this._balance}`);
            
            // 通知 UI 更新
            EventBus.emit(EventName.USER_BALANCE_CHANGED, this._balance);
        } catch (err) {
            error('[GameManager] 登入失敗:', err);
        }
    }

    /**
     * 初始化管理器基礎狀態
     */
    public init(): void {
        log('[GameManager] 初始化完成');
        this.setGameState(GameState.INIT);
    }

    /**
     * 設定環境事件監聽 (例如：視窗切換、斷網)
     */
    private setupEnvironmentalListeners(): void {
        // 進入背景：暫停遊戲、靜音
        game.on(Game.EVENT_HIDE, () => {
            log('[GameManager] 檢測到遊戲進入背景');
            this.handleGameHide();
        });

        // 回到前景：恢復遊戲、取消靜音
        game.on(Game.EVENT_SHOW, () => {
            log('[GameManager] 檢測到遊戲回到前景');
            this.handleGameShow();
        });
    }

    /**
     * 處理遊戲進入背景
     */
    private handleGameHide(): void {
        if (this._gameState === GameState.PLAYING) {
            this.pauseGame();
        }
    }

    /**
     * 處理遊戲回到前景
     */
    private handleGameShow(): void {
        // 這裡可以加入邏輯判定是否需要自動恢復，或等待使用者點擊暫停框
        // 目前暫定自動恢復
        if (this._gameState === GameState.PAUSED) {
            this.resumeGame();
        }
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

        log('[GameManager] 暫停遊戲 (包含音效)');
        this.setGameState(GameState.PAUSED);
        director.pause();

        // 靜音處理
        SoundManager.getInstance().pauseBGM();
    }

    /**
     * 恢復遊戲
     */
    public resumeGame(): void {
        if (this._gameState !== GameState.PAUSED) return;

        log('[GameManager] 恢復遊戲 (包含音效)');
        this.setGameState(GameState.PLAYING);
        director.resume();

        // 恢復音量處理
        SoundManager.getInstance().resumeBGM();
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
        log(`[GameManager] 進入子遊戲: ${gameId}`);
        this.setGameState(GameState.PLAYING);
        this._currentGameId = gameId;
        await SceneManager.getInstance().enterGame(gameId);
    }

    /**
     * 返回大廳
     */
    public returnToLobby(): void {
        log('[GameManager] 返回大廳，執行清場邏輯');

        this.setGameState(GameState.LOBBY);
        SceneManager.getInstance().returnToLobby();
        this._currentGameId = null;

        // 發送通知
        EventBus.emit(EventName.SUBGAME_EXIT, undefined);
    }

    // ==========================================
    // 橋接服務 (Subgame Bridge / Facade)
    // 專門提供子遊戲呼叫的外殼服務介面
    // ==========================================

    /**
     * 獲取當前使用者資訊
     */
    public get userInfo(): { userId: string, balance: number } {
        return {
            userId: this._userId,
            balance: this._balance
        };
    }

    /**
     * 更新使用者餘額 (同步至外殼 UI 與伺服器)
     * @param amount 新的餘額數值
     */
    public updateBalance(amount: number): void {
        this._balance = amount;
        log(`[GameManager] 餘額更新: ${this._balance}`);

        // 發送全域事件通知 UI 更新 (如 HeaderView)
        EventBus.emit(EventName.USER_BALANCE_CHANGED, this._balance);
    }

    /**
     * 退出目前子遊戲
     */
    public exitCurrentGame(): void {
        this.returnToLobby();
    }
}
