import { _decorator, Node, Color, Layout, Button, Size, UITransform } from 'cc';
import { GameCategory, ICategoryTab } from '../../model/LobbyModel';
import { UIComponentBase } from '../../../../../scripts/core/base/ui/UIComponentBase';
import { NodeFactory } from '../../../../../scripts/core/utils/NodeFactory';
import { OrientationType } from '../../../../../scripts/framework/manager/ui/OrientationManager';

const { ccclass } = _decorator;

/**
 * CategoryTabBar - 類別頁籤列表 (優化版)
 */
@ccclass('CategoryTabBar')
export class CategoryTabBar extends UIComponentBase {
    public onCategoryChange: (category: GameCategory) => void = () => {};

    private readonly _INACTIVE_COLOR = new Color(160, 160, 180, 160);
    private _container!: Node;
    private _tabs: ICategoryTab[] = [];
    private _buttonNodes: Node[] = [];
    private _currentIndex: number = 0;

    protected createUI(): void {
        this._updateLayoutBySize();
    }

    private _updateLayoutBySize(): void {
        const isLandscape = this.node.scene.name !== 'Portrait'; // 這裡僅為示意，實例中我們用 OrientationManager
        // 為了通用性，我們統一代碼生成時的基礎尺寸
        const width = 1200;
        const height = 80;
        const size = new Size(width, height);
        this.getUITransform().setContentSize(size);

        // 清除舊有的 (如有)
        this.node.removeAllChildren();

        // 使用 NodeFactory 建立包含 Mask 的捲動區域
        const {
            node: svNode,
            content,
            scrollView,
        } = NodeFactory.createScrollView('TabScrollView', size);
        scrollView.vertical = false;
        scrollView.horizontal = true;
        this.node.addChild(svNode);

        this._container = content;

        const contentTrans = this.getUITransform(this._container);
        contentTrans.setAnchorPoint(0, 0.5);
        contentTrans.setContentSize(0, height);

        const layout = this.getOrAddComponent(this._container, Layout);
        layout.type = Layout.Type.HORIZONTAL;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.spacingX = 15;
        layout.paddingLeft = layout.paddingRight = 20;
        layout.alignHorizontal = true;

        // 如果已經有資料，重新生成按鈕
        if (this._tabs.length > 0) {
            this.setup(this._tabs);
        }
    }

    /**
     * 實作螢幕旋轉事件回調
     */
    protected onOrientationChange(orientation: OrientationType): void {
        // 當方向改變時，可以根據需要調整佈局
        // 例如：橫向時寬度 1200，直向時寬度 700
        const newWidth = orientation === OrientationType.LANDSCAPE ? 1200 : 700;
        this.getUITransform().setContentSize(newWidth, 80);

        // 取得 ScrollView 並更新尺寸
        const svNode = this.node.getChildByName('TabScrollView');
        if (svNode) {
            this.getUITransform(svNode).setContentSize(newWidth, 80);
            const vpNode = svNode.getChildByName('Viewport');
            if (vpNode) this.getUITransform(vpNode).setContentSize(newWidth, 80);
        }
    }

    public setup(tabs: ICategoryTab[]): void {
        this.initUI();
        this._tabs = tabs;
        this._clearButtons();

        tabs.forEach((tab, index) => {
            const btnNode = this._createTabNode(tab, index);
            this._container.addChild(btnNode);
            this._buttonNodes.push(btnNode);
        });

        this.selectTab(this._currentIndex);
    }

    private _createTabNode(tab: ICategoryTab, index: number): Node {
        const { node, sprite } = NodeFactory.createSpriteNode(
            `Tab_${tab.id}`,
            this._INACTIVE_COLOR,
        );
        this.getUITransform(node).setContentSize(160, 50);

        const { label } = NodeFactory.createLabelNode('Label', tab.label, 24);
        node.addChild(label.node);

        const btn = node.addComponent(Button);
        btn.transition = Button.Transition.SCALE;
        btn.zoomScale = 0.95;

        node.on(Button.EventType.CLICK, () => this.selectTab(index), this);

        return node;
    }

    public selectTab(index: number): void {
        if (index < 0 || index >= this._tabs.length) return;
        this._currentIndex = index;
        this._updateVisuals();
        this.onCategoryChange(this._tabs[index].id);
    }

    private _updateVisuals(): void {
        this._buttonNodes.forEach((node, index) => {
            const isActive = index === this._currentIndex;
            this.getSprite(node)!.color = isActive
                ? new Color(100, 140, 255, 255)
                : this._INACTIVE_COLOR;
            this.getLabel(node)!.color = isActive ? Color.WHITE : new Color(220, 220, 220, 255);
        });
    }

    private _clearButtons(): void {
        this._buttonNodes.forEach((node) => node.destroy());
        this._buttonNodes = [];
    }

    private getSprite(node: Node) {
        return node.getComponent('cc.Sprite') as any;
    }
    private getLabel(node: Node) {
        return node.getComponentInChildren('cc.Label') as any;
    }
}
