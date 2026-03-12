import {
    _decorator,
    Camera,
    Canvas,
    Color,
    Component,
    director,
    Node,
    Scene,
    UITransform,
    Widget,
} from 'cc';
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
export class AppScene extends Scene {
    constructor(name: string) {
        super(name);
        LogManager.getInstance().info('App', '🚀 App 啟動中...');

        const canvas = this.createCanvas();
        const gameRoot = this.createGameRoot();
        const lobbyRoot = this.createLobbyRoot();

        const camera = this.createCamera();
        canvas.addChild(camera);
        canvas.addChild(gameRoot);
        canvas.addChild(lobbyRoot);

        this.addChild(canvas);

        SceneManager.getInstance().init(gameRoot, lobbyRoot);
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
            // await this.launchLobby();
        }
    }

    private createCanvas() {
        const canvasNode = new Node('Canvas');
        const canvas = canvasNode.addComponent(Canvas);
        canvas.renderMode = 0; // SCREEN_SPACE;

        // Widget 自動對齊
        const widget = canvasNode.addComponent(Widget);
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.alignMode = Widget.AlignMode.ALWAYS;

        return canvasNode;
    }

    private createGameRoot() {
        const node = new Node('GameRoot');
        return node;
    }

    private createLobbyRoot() {
        const node = new Node('LobbyRoot');
        return node;
    }

    private createCamera() {
        const cameraNode = new Node('Camera');
        const camera = cameraNode.addComponent(Camera);
        // 設置清除標誌
        camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
        // 設置背景顏色
        camera.clearColor = new Color(0, 0, 0, 255);
        // 設置位置
        cameraNode.setPosition(0, 0, 1000);
        return cameraNode;
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
