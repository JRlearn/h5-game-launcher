import { Layout, Widget } from 'cc';
import { IGameData } from '../model/LobbyModel';
import { GameListPanel } from '../components/gameList/GameListPanel';
import { CategoryTabBar } from '../components/category/CategoryTabBar';
import { ViewBase } from '../../../../scripts/core/base/mvc/view/ViewBase';
import { NodeFactory } from '../../../../scripts/core/utils/NodeFactory';

/**
 * LobbyView - 大廳視圖層
 *
 * 負責構建大廳的整體 UI 結構：
 * 1. 分類頁籤 (CategoryTabBar) - 置頂
 * 2. 遊戲列表 (GameListPanel) - 下方滾動區
 */
export class LobbyView extends ViewBase {
    public gameListPanel!: GameListPanel;
    public categoryTabBar!: CategoryTabBar;

    public override init(): void {
        // 1. 設定根節點為全螢幕
        const rootTrans = this.getUITransform();
        rootTrans.setContentSize(720, 1280);

        // 加上 Widget 確保在不同解析度下保持居中或填滿
        const widget = this.getOrAddComponent(this.root, Widget);
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = widget.bottom = widget.left = widget.right = 0;
        widget.alignMode = Widget.AlignMode.ALWAYS;

        // 2. 設定根節點佈局 (垂直排列)
        const layout = this.getOrAddComponent(this.root, Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;
        layout.spacingY = 20;
        layout.paddingTop = 60; // 頂部留點呼吸空間
        layout.resizeMode = Layout.ResizeMode.NONE;

        // 3. 建立分類頁籤
        const { component: tabComp } = NodeFactory.createNodeWithComponent(
            'CategoryTabBar',
            CategoryTabBar,
            { parent: this.root },
        );
        this.categoryTabBar = tabComp;
        this.getUITransform(this.categoryTabBar.node).setContentSize(680, 80);

        // 4. 建立遊戲列表面板
        const { component: panelComp } = NodeFactory.createNodeWithComponent(
            'GameListPanel',
            GameListPanel,
            { parent: this.root },
        );
        this.gameListPanel = panelComp;
        this.getUITransform(this.gameListPanel.node).setContentSize(680, 1000);
    }

    /**
     * 渲染遊戲列表
     */
    public renderGameList(games: IGameData[]): void {
        if (this.gameListPanel) {
            this.gameListPanel.renderList(games);
        }
    }
}
