import { _decorator, Node, Layout, size, Size } from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { GameListItem } from './GameListItem';
import { UIComponentBase } from '../../../../../scripts/core/base/ui/UIComponentBase';
import { NodeFactory } from '../../../../../scripts/core/utils/NodeFactory';

const { ccclass } = _decorator;

/**
 * GameListPanel - 遊戲列表面板
 * 
 * 優化點：
 * 1. 繼承 UIComponentBase，自動處理圖層與初始化生命週期。
 * 2. 使用 NodeFactory 管理層建立 ScrollView，程式碼更簡潔。
 */
@ccclass('GameListPanel')
export class GameListPanel extends UIComponentBase {
    public listContainer!: Node;

    /** 由 Controller 直接賦值 */
    public onGameSelected: (gameId: string, bundleName: string) => void = () => {};

    private _itemInstances: Node[] = [];

    /**
     * 實作基類 UI 建立邏輯
     */
    protected createUI(): void {
        const panelSize = new Size(680, 1000); // 預設改為適配豎屏
        this.getUITransform().setContentSize(panelSize);

        // 使用 NodeFactory 工廠方法建立複雜的 ScrollView 結構
        const { node: svNode, content } = NodeFactory.createScrollView('ScrollView', panelSize);
        this.node.addChild(svNode);
        this.listContainer = content;

        // 配置佈局 (豎屏建議 2 直列)
        const layout = this.getOrAddComponent(this.listContainer, Layout);
        layout.type = Layout.Type.GRID;
        layout.paddingLeft = layout.paddingRight = 30;
        layout.paddingTop = layout.paddingBottom = 20;
        layout.spacingX = 40;
        layout.spacingY = 40;
        layout.cellSize = size(290, 360); // 2 個橫排剛好接近 680
        layout.startAxis = Layout.AxisDirection.HORIZONTAL;
        layout.affectedByScale = true;
    }

    /**
     * 監聽旋轉
     */
    protected override onOrientationChange(orientation: any): void {
        const isLandscape = orientation === 'landscape';
        const newWidth = isLandscape ? 1200 : 680;
        const newHeight = isLandscape ? 560 : 1000;
        
        this.getUITransform().setContentSize(newWidth, newHeight);
        
        const svNode = this.node.getChildByName('ScrollView');
        if (svNode) {
            this.getUITransform(svNode).setContentSize(newWidth, newHeight);
            const vpNode = svNode.getChildByName('Viewport');
            if (vpNode) this.getUITransform(vpNode).setContentSize(newWidth, newHeight);
        }

        const layout = this.listContainer.getComponent(Layout);
        if (layout) {
            // 橫向可以 5 個，直向 2 個
            layout.cellSize = isLandscape ? size(200, 260) : size(290, 360);
            layout.updateLayout();
        }
    }

    /**
     * 根據遊戲資料列表重新渲染
     */
    public renderList(games: IGameData[]): void {
        this.initUI(); // 確保 UI 結構已建立
        this._clearList();

        games.forEach((game) => {
            const { component: itemComp } = NodeFactory.createNodeWithComponent(
                `GameItem_${game.id}`, 
                GameListItem, 
                { parent: this.listContainer }
            );

            this._itemInstances.push(itemComp.node);

            itemComp.setup(game, (gameId: string, bundleName: string) => {
                this.onGameSelected(gameId, bundleName);
            });
        });

        const layout = this.listContainer.getComponent(Layout);
        if (layout) layout.updateLayout();
    }

    private _clearList(): void {
        this._itemInstances.forEach((node) => node.destroy());
        this._itemInstances = [];
    }
}
