/**
 * GameState - 遊戲狀態列舉
 */
export enum GameState {
    /** 初始化 */
    INIT = 'INIT',
    /** 遊戲大廳 */
    LOBBY = 'LOBBY',
    /** 運行中 (子遊戲) */
    PLAYING = 'PLAYING',
    /** 暫停 */
    PAUSED = 'PAUSED',
    /** 遊戲結束 */
    GAMEOVER = 'GAMEOVER',
}
