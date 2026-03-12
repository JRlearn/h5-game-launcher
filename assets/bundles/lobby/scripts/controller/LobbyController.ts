import { LobbyModel, GameCategory } from '../model/LobbyModel';
import { LobbyView } from '../view/LobbyView';
import { SceneManager } from '../../../../scripts/manager/scene/SceneManager';
import { AppConfig } from '../../../../scripts/config/AppConfig';
import { GameManager } from '../../../../scripts/manager/game/GameManager';
import { ControllerBase } from '../../../../scripts/framework/mvc/controller/ControllerBase';
import { LogManager } from '../../../../scripts/manager/core/LogManager';

/**
 * LobbyController - 大廳控制器
 *
 * init() 在 view.init() 完成後呼叫，此時 panel 實例已存在：
 * 直接對 panel 屬性注入 callback，再傳入資料驅動 View。
 */
export class LobbyController extends ControllerBase<LobbyView, LobbyModel> {
    public init(): void {
        if (!this.view) {
            LogManager.getInstance().error('Lobby', 'LobbyController: 尚未綁定 LobbyView');
            return;
        }

        // 注入回調（Controller → Panel 直接綁定，not via View.init）
        this.view.gameListPanel.onGameSelected = this.onGameSelected.bind(this);
        this.view.categoryTabBar.onCategoryChange = this.onCategoryChanged.bind(this);

        // 傳入資料，驅動 CategoryTabBar 動態生成頁籤
        this.view.categoryTabBar.setup(this.model.getCategoryTabs());

        // 渲染初始遊戲列表（全部）
        this.view.renderGameList(this.model.getGameList());

        LogManager.getInstance().info('Lobby', '✅ LobbyController 初始化完成');
    }

    private onCategoryChanged(category: GameCategory): void {
        LogManager.getInstance().debug('Lobby', `分類切換 → ${category}`);
        this.view.renderGameList(this.model.getGameListByCategory(category));
    }

    private onGameSelected(gameId: string, bundleName: string): void {
        LogManager.getInstance().info('Lobby', `玩家選擇遊戲 → ${gameId} (${bundleName})`);
        GameManager.getInstance().setGameState('PLAYING');
        SceneManager.getInstance().enterGame({
            bundleName,
            path: AppConfig.DEFAULT_GAME_PREFAB_PATH,
            isPrefab: true,
        });
    }
}
