import {
    _decorator,
    Node,
    Layout,
    size,
    Size,
    Widget,
    ScrollView,
    Vec3,
    Rect,
    UITransform,
} from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { GameListItem, ILayerNodes } from './GameListItem';
import { UIComponentBase } from '../../../../../scripts/core/base/ui/UIComponentBase';
import { NodeFactory } from '../../../../../scripts/core/utils/NodeFactory';
import { OrientationType } from '../../../../../scripts/framework/manager/ui/OrientationManager';

const { ccclass } = _decorator;

/**
 * GameListPanel - 遊戲列表面板
 * 負責展示遊戲網格列表，處理自動佈局與旋轉適配。
 */
@ccclass('GameListPanel')
export class GameListPanel extends UIComponentBase {
    /** 當遊戲被選中時的回調 (由 Controller 註冊) */
    public onGameSelected: (data: IGameData) => void = () => {};
    /** 放置遊戲項目的實際佈局容器 (被 Layout 元件控制) */
    private listContainer!: Node;
    /** 渲染分層引用 */
    private _layers!: ILayerNodes;
    /** 快取所有遊戲項目的 Node */
    private _itemInstances: Node[] = [];

    /**
     * 實作基類 UI 建立邏輯，定義初始 ScrollView 結構
     */
    protected createUI(): void {
        const itemHeight = 380;
        const spacingY = 40;
        const paddingTop = 20;
        const paddingBottom = 20;
        const panelHeight = itemHeight * 2 + spacingY + paddingTop + paddingBottom;
        const panelSize = new Size(1200, panelHeight);

        this.getUITransform().setContentSize(panelSize);

        // 1. 建立 ScrollView 與 Content (這層負責捲動，不加 Layout)
        const { node: svNode, content } = NodeFactory.createScrollView('ScrollView', panelSize);
        this.node.addChild(svNode);
        const contentTrans = this.getUITransform(content);
        contentTrans.anchorX = 0;
        contentTrans.setContentSize(1200, panelHeight);
        content.setPosition(-panelSize.width / 2, 0);

        // 2. 建立分層容器 (這些節點會隨 Content 捲動，但不參與 Layout)
        this._layers = {
            bgLayer: NodeFactory.createUINode('BgLayer', { parent: content, size: contentTrans.contentSize, anchor: contentTrans.anchorPoint }),
            iconLayer: NodeFactory.createUINode('IconLayer', { parent: content, size: contentTrans.contentSize, anchor: contentTrans.anchorPoint }),
            labelLayer: NodeFactory.createUINode('LabelLayer', { parent: content, size: contentTrans.contentSize, anchor: contentTrans.anchorPoint }),
        };

        // 3. 建立實際負責排版的佈局節點
        this.listContainer = NodeFactory.createUINode('ItemLayout', { parent: content, size: contentTrans.contentSize, anchor: contentTrans.anchorPoint });

        const scrollView = svNode.getComponent(ScrollView)!;
        scrollView.vertical = false;
        scrollView.horizontal = true;
        // 綁定滾動事件
        svNode.on(ScrollView.EventType.SCROLLING, this._onScrolling, this);

        const layout = this.getOrAddComponent(this.listContainer, Layout);
        layout.type = Layout.Type.GRID;
        layout.startAxis = Layout.AxisDirection.VERTICAL;
        layout.paddingLeft = layout.paddingRight = 40;
        layout.paddingTop = paddingTop;
        layout.paddingBottom = paddingBottom;
        layout.spacingX = 40;
        layout.spacingY = spacingY;
        layout.cellSize = size(280, itemHeight);
        layout.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT;
        layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;

        // 重要：讓 Content 跟隨 Layout 節點的大小變化 (這樣 ScrollView 才知道多長)
        // 注意：Cocos 3.x Layout.resizeMode 為 CONTAINER 時會撐開自己
    }

    /**
     * 處理螢幕方向旋轉，動態調整容器與網格 Cell 大小
     * @param orientation 螢幕方向
     */
    protected override onOrientationChange(orientation: OrientationType): void {
        const contentSize = this.getUITransform().contentSize;
        const currentWidth = contentSize.width;

        const itemHeight = 380;
        const spacingY = 40;
        const panelHeight = itemHeight * 2 + spacingY + 40;

        const svNode = this.node.getChildByName('ScrollView');
        if (svNode) {
            this.getUITransform(svNode).setContentSize(currentWidth, panelHeight);
            const vpNode = svNode.getChildByName('Viewport');
            if (vpNode) {
                this.getUITransform(vpNode).setContentSize(currentWidth, panelHeight);
                const vpWidget = this.getOrAddComponent(vpNode, Widget) as Widget;
                vpWidget.isAlignLeft =
                    vpWidget.isAlignRight =
                    vpWidget.isAlignTop =
                    vpWidget.isAlignBottom =
                        true;
                vpWidget.left = vpWidget.right = vpWidget.top = vpWidget.bottom = 0;
            }
        }

        // 更新 Content 與各個分層容器的大小
        const content = svNode?.getChildByName('Viewport')?.getChildByName('Content');
        if (content) {
            const contentTrans = this.getUITransform(content);
            contentTrans.setContentSize(currentWidth, panelHeight);
            content.setPosition(-currentWidth / 2, 0);

            if (this._layers) {
                this.getUITransform(this._layers.bgLayer).setContentSize(currentWidth, panelHeight);
                this.getUITransform(this._layers.iconLayer).setContentSize(currentWidth, panelHeight);
                this.getUITransform(this._layers.labelLayer).setContentSize(currentWidth, panelHeight);
            }
        }

        const layout = this.listContainer.getComponent(Layout);
        if (layout) {
            layout.spacingX = orientation === OrientationType.LANDSCAPE ? 60 : 40;
            layout.updateLayout();
        }

        // 切換方向後立即重新檢查一次可見性
        this._updateItemsVisibility();
    }

    /**
     * 基於遊戲清單重新渲染列表
     * @param games 遊戲資料陣列
     */
    public renderList(games: IGameData[]): void {
        this.initUI();
        this._clearList();

        games.forEach((game) => {
            const { node, component: itemComp } = NodeFactory.createNodeWithComponent(
                `GameItem_${game.id}`,
                GameListItem,
            );

            // 先設定資料與分層容器，再加入節點樹 (確保 createUI 時 layers 已存在)
            itemComp.setup(game, (data: IGameData) => {
                this.onGameSelected(data);
            }, this._layers);

            this.listContainer.addChild(node);
            this._itemInstances.push(node);
        });

        const layout = this.listContainer.getComponent(Layout);
        if (layout) layout.updateLayout();

        // 由於我們使用了分層同步，當 Layout 撐開時，Content 與分層容器也應跟隨大小
        const currentContentSize = this.getUITransform(this.listContainer).contentSize.clone();
        const contentTrans = this.getUITransform(this.listContainer.parent!);
        contentTrans.setContentSize(currentContentSize);

        this.getUITransform(this._layers.bgLayer).setContentSize(currentContentSize);
        this.getUITransform(this._layers.iconLayer).setContentSize(currentContentSize);
        this.getUITransform(this._layers.labelLayer).setContentSize(currentContentSize);

        // 渲染完後立即檢查初始可見性 (延遲一個 frame 確保 Layout 已完成)
        this.scheduleOnce(() => {
            this._updateItemsVisibility();
        }, 0);
    }

    /**
     * 滾動事件回調
     */
    private _onScrolling(): void {
        this._updateItemsVisibility();
    }

    /**
     * 更新所有項目的資源載入狀態 (動態載入核心)
     */
    private _updateItemsVisibility(): void {
        const svNode = this.node.getChildByName('ScrollView');
        if (!svNode) return;

        const viewport = svNode.getChildByName('Viewport');
        if (!viewport) return;

        // 1. 取得 Viewport 在世界座標的包圍盒
        const vpTrans = viewport.getComponent(UITransform)!;
        const vpWorldRect = vpTrans.getBoundingBoxToWorld();

        // 2. 設定預加載緩衝區 (左右各增加 500 像素)
        const buffer = 500;
        const viewRect = new Rect(
            vpWorldRect.x - buffer,
            vpWorldRect.y,
            vpWorldRect.width + buffer * 2,
            vpWorldRect.height,
        );

        // 3. 檢查每個 Item 是否在 buffer 範圍內
        this._itemInstances.forEach((node) => {
            if (!node.isValid) return;
            const itemTrans = node.getComponent(UITransform)!;
            const itemWorldRect = itemTrans.getBoundingBoxToWorld();

            const itemComp = node.getComponent(GameListItem)!;

            // 是否相交 (進入可視或緩衝區)
            if (viewRect.intersects(itemWorldRect)) {
                itemComp.loadIcon();
            } else {
                // 距離太遠則卸載資源以節省記憶體
                itemComp.unloadIcon();
            }
        });
    }

    /**
     * 清理所有現存的遊戲項目節點
     */
    private _clearList(): void {
        this._itemInstances.forEach((node) => node.destroy());
        this._itemInstances = [];
    }
}
