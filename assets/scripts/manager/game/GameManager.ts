import { _decorator, director, log } from 'cc';
const { ccclass } = _decorator;

/**
 * GameManager - 遊戲管理器，用於管理遊戲的全局邏輯。
 * 單例模式設計，確保全局只有一個實例。
 */
export class GameManager {
    private static instance: GameManager | null = null; // 單例實例

    private gameState: string = 'INIT'; // 遊戲狀態（例如 INIT, RUNNING, PAUSED, GAMEOVER）

    private constructor() {} // 私有構造函數，防止外部實例化

    public static getInstance(): GameManager {
        if (!this.instance) {
            this.instance = new GameManager();
        }
        return this.instance;
    }

    /**
     * 初始化遊戲管理器。
     * 在遊戲啟動時調用。
     */
    public init(): void {
        log('GameManager 初始化完成');
        this.setGameState('INIT');
    }

    /**
     * 設置遊戲狀態。
     * @param state - 新的遊戲狀態。
     */
    public setGameState(state: string): void {
        this.gameState = state;
        log(`遊戲狀態已更改為: ${state}`);
    }

    /**
     * 獲取當前遊戲狀態。
     * @returns 當前遊戲狀態。
     */
    public getGameState(): string {
        return this.gameState;
    }

    /**
     * 切換場景。
     * @param sceneName - 要加載的場景名稱。
     */
    public loadScene(sceneName: string): void {
        log(`正在加載場景: ${sceneName}`);
        director.loadScene(sceneName, () => {
            log(`場景 ${sceneName} 加載完成`);
        });
    }

    /**
     * 暫停遊戲。
     */
    public pauseGame(): void {
        log('遊戲已暫停');
        this.setGameState('PAUSED');
        director.pause();
    }

    /**
     * 恢復遊戲。
     */
    public resumeGame(): void {
        log('遊戲已恢復');
        this.setGameState('RUNNING');
        director.resume();
    }

    /**
     * 結束遊戲。
     */
    public endGame(): void {
        log('遊戲已結束');
        this.setGameState('GAMEOVER');
        // 可以在這裡添加遊戲結束的邏輯，例如顯示結束畫面或統計分數
    }

    /**
     * 重啟遊戲。
     * 通常用於重新開始當前場景。
     */
    public restartGame(): void {
        log('遊戲正在重啟');
        const currentScene = director.getScene()?.name;
        if (currentScene) {
            this.loadScene(currentScene);
        } else {
            log('無法獲取當前場景名稱');
        }
    }
}
