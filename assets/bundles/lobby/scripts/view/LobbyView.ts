import { Node } from 'cc';
import { ViewBase } from '../../../../scripts/framework/mvc/view/ViewBase';
import { IGameData } from '../model/LobbyModel';
import { GameListPanel } from '../components/gameList/GameListPanel';
import { CategoryTabBar } from '../components/category/CategoryTabBar';

/**
 * LobbyView - 大廳視圖層
 * 
 * 負責構建大廳的整體 UI 結構：
 * 1. 分類頁籤 (CategoryTabBar)
 * 2. 遊戲列表 (GameListPanel)
 */
export class LobbyView extends ViewBase {
    public gameListPanel!: GameListPanel;
    public categoryTabBar!: CategoryTabBar;

    private readonly bundleName = 'lobby';

    public override init(): void {
        // 1. 建立分類頁籤
        this.categoryTabBar = this.createComponent(
            this.bundleName,
            'CategoryTabBar',
            CategoryTabBar,
        );
        this.categoryTabBar.init();
        this.addChild(this.categoryTabBar);

        // 2. 建立遊戲列表面板
        this.gameListPanel = this.createComponent(
            this.bundleName,
            'GameListPanel',
            GameListPanel
        );
        this.gameListPanel.init();
        this.addChild(this.gameListPanel);
    }

    /**
     * 渲染遊戲列表（由 Controller 傳入過濾後的資料）
     */
    public renderGameList(games: IGameData[]): void {
        if (this.gameListPanel) {
            this.gameListPanel.renderList(games);
        }
    }
}
