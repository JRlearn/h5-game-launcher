/**
 * EventName - 統一管理事件名稱，避免 Magic String。
 */
export const EventName = {
    // Game Flow
    GAME_START: 'game-start',
    GAME_END: 'game-end',

    // UI
    OPEN_POPUP: 'open-popup',
    CLOSE_POPUP: 'close-popup',

    // Player
    PLAYER_HP_CHANGE: 'player-hp-change',
    PLAYER_SCORE_CHANGE: 'player-score-change',

    // Scene
    SCENE_CHANGE: 'scene-change',

    // System
    LANGUAGE_CHANGED: 'language-changed',

    // Launcher
    LAUNCHER_PROGRESS: 'launcher-progress',
    LAUNCHER_COMPLETE: 'launcher-complete',
    LAUNCHER_ERROR: 'launcher-error',
} as const;

export type EventNameType = (typeof EventName)[keyof typeof EventName];
