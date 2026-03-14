import { _decorator } from 'cc';

export enum GameStage {
    INIT = 'init',
    LOAD_ASSETS = 'load_assets',
    START = 'start',
    STOP = 'stop',
    DESTROY = 'destroy',
}

/**
 * GameLifecycle 定義子遊戲生命週期階段
 */
export class GameLifecycle {
    // 實作生命週期監聽與分發
}
