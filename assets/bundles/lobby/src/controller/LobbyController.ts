import { LobbyModel, GameCategory, IGameData } from '../model/LobbyModel';
import { LobbyView } from '../view/LobbyView';
import { error, log } from 'cc';
import { ControllerBase } from '../../../../scripts/core/base/mvc/controller/ControllerBase';
import { AppConfig } from '../../../../scripts/config/AppConfig';
import { GameManager } from '../../../../scripts/framework/manager/game/GameManager';

/**
 * LobbyController - 大廳控制器
 * 負責協調 LobbyModel 與 LobbyView 之間的互動。
 */
export class LobbyController extends ControllerBase<LobbyView, LobbyModel> {
    /**
     * 初始化控制器
     * 在介面加載完成後執行，綁定 View 事件並推送初始資料。
     */
    public init(): void {
        if (!this.view) {
            error('Lobby', 'LobbyController: 尚未綁定 LobbyView');
            return;
        }

        // 注入按鈕與頁籤的回調事件
        this.view.gameListPanel.onGameSelected = this._onGameSelected.bind(this);
        this.view.categoryTabBar.onCategoryChange = this._onCategoryChanged.bind(this);

        // 驅動頁籤組件生成基礎數據
        this.view.categoryTabBar.setup(this.model.getCategoryTabs());

        // 渲染初始化的全部遊戲列表
        this.view.renderGameList(this.model.getGameList());

        log('Lobby', '✅ LobbyController 初始化完成');
    }

    /**
     * 處理頁籤切換事件
     * @param category 目標遊戲類別
     */
    private _onCategoryChanged(category: GameCategory): void {
        log('Lobby', `分類切換 → ${category}`);
        this.view.renderGameList(this.model.getGameListByCategory(category));
    }

    /**
     * 處理遊戲選擇與進入事件
     * @param gameId 遊戲唯一識別碼
     * @param bundleName 遊戲資源包名稱
     */
    private _onGameSelected(data: IGameData): void {
        log('Lobby', `玩家選擇遊戲 → ${data.id} (${data.bundleName})`);
        GameManager.getInstance().enterGame(
            data.id,
            AppConfig.DEFAULT_GAME_PREFAB_PATH,
            data.mainComponent || 'Main'
        );
    }
}
