import { Widget } from 'cc';
import { IGameData } from '../model/LobbyModel';
import { GameListPanel } from '../components/gameList/GameListPanel';
import { CategoryTabBar } from '../components/category/CategoryTabBar';
import { SpriteFrame, Color } from 'cc';
import { ViewBase } from '../../../../core/game/base/mvc/view/ViewBase';
import { NodeFactory } from '../../../../core/utils/NodeFactory';
import { AppConfig } from '../../../../app/config/Config';
import { ResManager } from '../../../../core/systems/resource/ResManager';
import { LanguageManager } from '../../../../core/systems/language/LanguageManager';

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
        rootTrans.setContentSize(AppConfig.DESIGN_WIDTH, AppConfig.DESIGN_HEIGHT);

        // 加上 Widget 確保在不同解析度下保持居中或填滿
        const widget = this.getOrAddComponent(this.root, Widget);
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = widget.bottom = widget.left = widget.right = 0;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // 2. 建立主背景圖
        this._initBackground();

        // 3. 建立分類頁籤
        const { component: tabComp } = NodeFactory.createNodeWithComponent(
            'CategoryTabBar',
            CategoryTabBar,
            { parent: this.root },
        );
        this.categoryTabBar = tabComp;
        this.getUITransform(this.categoryTabBar.node).setContentSize(1496, 176);

        // 為 CategoryTabBar 添加 Widget 確保置頂與置中
        const tabWidget = this.getOrAddComponent(this.categoryTabBar.node, Widget);
        tabWidget.isAlignTop = true;
        tabWidget.top = 20;
        tabWidget.isAlignHorizontalCenter = true;
        tabWidget.horizontalCenter = 0;
        tabWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // 4. 建立遊戲列表面板
        const { component: panelComp } = NodeFactory.createNodeWithComponent(
            'GameListPanel',
            GameListPanel,
            { parent: this.root },
        );
        this.gameListPanel = panelComp;

        // 為 GameListPanel 添加 Widget 使其填滿剩餘空間
        const panelWidget = this.getOrAddComponent(this.gameListPanel.node, Widget);
        panelWidget.isAlignTop = true;
        panelWidget.top = 220; // 在頁籤下方 (20 top + 176 height + padding)
        panelWidget.isAlignBottom = true;
        panelWidget.bottom = 40;
        panelWidget.isAlignLeft = panelWidget.isAlignRight = true;
        panelWidget.left = panelWidget.right = 100; // 兩側間距
        panelWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // 觸發初始大小計算
        panelWidget.updateAlignment();
    }

    /**
     * 建立並載入大廳背景
     */
    private async _initBackground(): Promise<void> {
        // 先給一個比較深的預設底色，避免加載前全黑
        const { node, sprite } = NodeFactory.createSpriteNode(
            'Background',
            new Color(20, 25, 35, 255),
            { parent: this.root },
        );
        node.setSiblingIndex(0); // 確保在最底層

        // 滿版對齊
        const bgWidget = this.getOrAddComponent(node, Widget);
        bgWidget.isAlignTop =
            bgWidget.isAlignBottom =
            bgWidget.isAlignLeft =
            bgWidget.isAlignRight =
                true;
        bgWidget.top = bgWidget.bottom = bgWidget.left = bgWidget.right = 0;
        bgWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        try {
            // 異步載入背景圖 (從語系資源包)
            const lang = LanguageManager.getInstance().getLanguage();
            const resBundle = `${AppConfig.BUNDLE_LOBBY}_${lang}`;
            const bgPath = 'textures/bg/spriteFrame';

            // 下載並套用背景貼圖
            const sf = await ResManager.getInstance().load(resBundle, bgPath, SpriteFrame);
            if (sf && sprite && sprite.isValid) {
                sprite.spriteFrame = sf;
            }
        } catch (err) {
            console.error('[LobbyView] 背景圖加載失敗:', err);
        }
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
