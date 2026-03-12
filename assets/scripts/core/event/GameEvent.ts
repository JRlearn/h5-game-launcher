import { EventName } from './EventName';

/**
 * GameEventMap - 定義事件對應的資料型別，確保型別安全。
 */
export interface GameEventMap {
    // Game
    [EventName.GAME_START]: void;
    [EventName.GAME_END]: void;

    // UI
    [EventName.OPEN_POPUP]: {
        name: string;
    };
    [EventName.CLOSE_POPUP]: {
        name: string;
    };

    // Player
    [EventName.PLAYER_HP_CHANGE]: {
        hp: number;
    };
    [EventName.PLAYER_SCORE_CHANGE]: {
        score: number;
    };

    // Scene
    [EventName.SCENE_CHANGE]: {
        scene: string;
    };

    // System
    [EventName.LANGUAGE_CHANGED]: void;

    // Launcher
    [EventName.LAUNCHER_PROGRESS]: {
        progress: number;
        stepDescription?: string;
    };
    [EventName.LAUNCHER_COMPLETE]: void;
    [EventName.LAUNCHER_ERROR]: {
        step: string;
        error: any;
    };
}
