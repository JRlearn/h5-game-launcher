import { _decorator, Canvas, Component, director, Node } from 'cc';
import { SceneManager } from './manager/scene/SceneManager';
import { LogManager } from './manager/core/LogManager';
import { AppConfig } from './config/AppConfig';
import { GameManager } from './manager/game/GameManager';
import { LanguageManager } from './manager/i18n/LanguageManager';
import { LanguageType } from './utils/i18n/LanguageType';
const { ccclass, property } = _decorator;

/**
 * App - 核心主場景控制腳本
 * 負責單場景架構的啟動分流與全域管理。
 */
export class App {
    public init(): void {
        LogManager.getInstance().info('App', '🚀 App 啟動中...');
        const canvas = director.getScene()?.getChildByName('Canvas');
        LogManager.getInstance().info('', canvas?.children);

        const gameRoot = canvas?.getChildByName('GameRoot');
        LogManager.getInstance().info('', gameRoot);
        const lobbyRoot = canvas?.getChildByName('LobbyRoot');

        // 3. 注入並初始化 SceneManager 所需的掛載容器
        if (gameRoot && lobbyRoot) SceneManager.getInstance().init(gameRoot, lobbyRoot);
    }

    public async start(): Promise<void> {
        // 3. 處理語系切換 (如果有透過 URL 指定 lang)
        const lang = this.parseURLParams('lang');
        if (lang) {
            LogManager.getInstance().info('App', `🌐 切換語系至: ${lang}`);
            LanguageManager.getInstance().setLanguage(lang as LanguageType);
        }

        // 4. 取得分流參數
        const targetGame = this.parseURLParams('game');
        const customPath = this.parseURLParams('path');

        if (targetGame) {
            // URL 範例: ?game=bullsAndCows
            await this.launchGame(targetGame, customPath);
        } else {
            // 預設進入大廳
            await this.launchLobby();
        }
    }

    /**
     * 啟動大廳
     */
    private async launchLobby() {
        LogManager.getInstance().info('App', '🏠 導向遊戲大廳');
        GameManager.getInstance().setGameState('LOBBY');

        try {
            await SceneManager.getInstance().returnToLobby();
        } catch (err) {
            LogManager.getInstance().error('App', '❌ 進入大廳失敗', err);
        }
    }

    /**
     * 啟動指定遊戲
     * @param gameId 遊戲 Bundle 名稱 (不含 games/ 前綴)
     * @param path 可選的特定 Prefab 路徑
     */
    private async launchGame(gameId: string, path?: string | null) {
        LogManager.getInstance().info('App', `🕹️ 導向遊戲: ${gameId}`);
        GameManager.getInstance().setGameState('PLAYING');

        const prefabPath = path || AppConfig.DEFAULT_GAME_PREFAB_PATH;
        const bundleName = `${AppConfig.GAMES_DIR_PREFIX}${gameId}`;

        // bullsAndCows 的 UI Prefab 清單，與 GameRoot 並行加載
        // 若未來新增遊戲，可在各遊戲的 AppConfig 分支中管理此清單
        const BULLS_AND_COWS_UI_PREFABS = [
            'prefabs/GuessNumPanel',
            'prefabs/LaLaKeyboardPanel',
            'prefabs/MenuPanel',
            'prefabs/CreateGamePanel',
            'prefabs/JoinGamePanel',
            'prefabs/SetupGuessPanel',
            'prefabs/ResultPanel',
            'prefabs/Toast',
            'prefabs/WaitingMask',
        ];

        try {
            await SceneManager.getInstance().enterGame({
                bundleName,
                path: prefabPath,
                isPrefab: true,
                uiPrefabPaths: gameId === 'bullsAndCows' ? BULLS_AND_COWS_UI_PREFABS : [],
            });
        } catch (err) {
            LogManager.getInstance().error('App', `❌ 進入遊戲 ${gameId} 失敗`, err);
            this.launchLobby();
        }
    }


    /**
     * 輔助方法：解析 URL 參數
     */
    private parseURLParams(key: string): string | null {
        if (typeof window === 'undefined' || !window.location) return null;
        try {
            const urlParams = new URL(window.location.href).searchParams;
            return urlParams.get(key);
        } catch (e) {
            return null;
        }
    }
}
