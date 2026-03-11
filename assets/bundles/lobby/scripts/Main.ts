import { _decorator, Component } from 'cc';
import { LogManager } from '../../../scripts/manager/core/LogManager';
import { LobbyController } from './controller/LobbyController';
import { LobbyModel } from './model/LobbyModel';
import { LobbyView } from './view/LobbyView';

const { ccclass } = _decorator;

/**
 * 大廳模組進入點 (Main)
 *
 * 在「單場景架構」中，大廳作為一個 Prefab 被載入。
 * 此腳本掛載於大廳根節點，負責處理大廳模組級別的生命週期。
 */
@ccclass('Main')
export class Main extends Component {
    private controller: LobbyController = null!;
    private model: LobbyModel = null!;
    private view: LobbyView = null!;

    protected onLoad(): void {
        LogManager.getInstance().info('Lobby', '🏠 大廳模組 (Lobby) 腳本載入');

        // 初始化 MVC
        this.model = new LobbyModel();

        // 獲取掛載在同一個節點上的 View 組件
        this.view = this.getComponent(LobbyView)!;
        if (!this.view) {
            LogManager.getInstance().error('Lobby', '❌ 找不到 LobbyView 組件');
            return;
        }

        this.controller = new LobbyController(this.view, this.model);
        this.controller.init();
    }

    protected start(): void {
        LogManager.getInstance().info('Lobby', '✨ 大廳模組啟動完成');
    }

    /**
     * 處理模組卸載前的清理邏輯 (如有需要)
     */
    protected onDestroy(): void {
        LogManager.getInstance().info('Lobby', '🧹 大廳模組資源釋放中...');
    }
}
