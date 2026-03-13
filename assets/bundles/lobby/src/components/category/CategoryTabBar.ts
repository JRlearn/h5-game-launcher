import {
    _decorator,
    Node,
    Color,
    Layout,
    Button,
    Size,
    Sprite,
    Label,
    Widget,
    log,
    Vec3,
} from 'cc';
import { UIComponentBase } from '../../../../../scripts/core/base/ui/UIComponentBase';
import { GameCategory, ICategoryTab } from '../../model/LobbyModel';
import { OrientationType } from '../../../../../scripts/framework/manager/ui/OrientationManager';
import { NodeFactory } from '../../../../../scripts/core/utils/NodeFactory';

const { ccclass } = _decorator;

/**
 * CategoryTabBar - 類別頁籤捲動列表
 * 負責生成動態頁籤按鈕、處理點擊切換與視覺呈現更新。
 */
@ccclass('CategoryTabBar')
export class CategoryTabBar extends UIComponentBase {
    /** 頁籤切換事件回調 */
    public onCategoryChange: (category: GameCategory) => void = () => {};

    /** 未選中狀態的背景顏色 */
    private readonly _INACTIVE_COLOR = new Color(160, 160, 180, 160);
    /** 捲動內容容器 */
    private _container!: Node;
    /** 頁籤資料清單 */
    private _tabs: ICategoryTab[] = [];
    /** 頁籤按鈕節點緩存 */
    private _buttonNodes: Node[] = [];
    /** 當前選中的索引點 */
    private _currentIndex: number = 0;

    /** 渲染分層引用 */
    private _layers: { bgLayer: Node; labelLayer: Node } | null = null;
    /** 追蹤分層節點的映射 (邏輯節點 -> {背景, 文字}) */
    private _layeredNodesMap: Map<Node, { bg: Node; label: Node; bgPos: Vec3; labelPos: Vec3 }> =
        new Map();
    /** 暫存座標 */
    private _tempWorldPos: Vec3 = new Vec3();
    private _tempChildPos: Vec3 = new Vec3();

    /**
     * 創建 UI 基礎結構
     */
    protected createUI(): void {
        this._updateLayoutBySize();
    }

    /**
     * 根據當前尺寸更新佈局配置
     */
    private _updateLayoutBySize(): void {
        const size = this.getUITransform().contentSize;
        const height = size.height > 0 ? size.height : 176;

        // 寬度若為 0 則預設使用 1920 (防止初始化時尺寸不正確)
        const width = size.width > 0 ? size.width : 1920;
        const finalSize = new Size(width, height);

        this.getUITransform().setContentSize(finalSize);

        // 清除現有按鈕組件節點
        this.node.removeAllChildren();

        // 建立包含 Mask 的捲動區域 (ScrollView)
        const {
            node: svNode,
            content,
            scrollView,
        } = NodeFactory.createScrollView('TabScrollView', finalSize);
        scrollView.vertical = false;
        scrollView.horizontal = true;
        this.node.addChild(svNode);

        // 為 ScrollView 添加 Widget 確保填滿父級
        const svWidget = svNode.addComponent(Widget) as Widget;
        svWidget.isAlignLeft =
            svWidget.isAlignRight =
            svWidget.isAlignTop =
            svWidget.isAlignBottom =
                true;
        svWidget.left = svWidget.right = svWidget.top = svWidget.bottom = 0;
        svWidget.alignMode = Widget.AlignMode.ALWAYS;

        this._container = content;

        const contentTrans = this.getUITransform(this._container);
        contentTrans.setAnchorPoint(0, 0.5);
        contentTrans.setContentSize(0, height);

        const layout = this.getOrAddComponent(this._container, Layout);
        layout.type = Layout.Type.HORIZONTAL;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.spacingX = 33; // 15 * 2.2
        layout.alignHorizontal = true;

        // 初始化分層容器
        this._layers = {
            bgLayer: NodeFactory.createUINode('BgLayer', {
                parent: this._container,
                size: contentTrans.contentSize,
                anchor: contentTrans.anchorPoint,
            }),
            labelLayer: NodeFactory.createUINode('LabelLayer', {
                parent: this._container,
                size: contentTrans.contentSize,
                anchor: contentTrans.anchorPoint,
            }),
        };

        // 若已有資料則自動重新生成
        if (this._tabs.length > 0) {
            this.setup(this._tabs);
        }
        this.onOrientationChange(OrientationType.LANDSCAPE);
    }

    /**
     * 每幀同步分層節點的位置
     */
    protected lateUpdate(): void {
        if (!this._layers) return;

        this._layeredNodesMap.forEach((data, logicalNode) => {
            if (!logicalNode.isValid) return;

            logicalNode.getWorldPosition(this._tempWorldPos);

            // 同步背景
            this._tempChildPos.set(
                this._tempWorldPos.x + data.bgPos.x,
                this._tempWorldPos.y + data.bgPos.y,
                this._tempWorldPos.z + data.bgPos.z,
            );
            data.bg.setWorldPosition(this._tempChildPos);

            // 同步文字
            this._tempChildPos.set(
                this._tempWorldPos.x + data.labelPos.x,
                this._tempWorldPos.y + data.labelPos.y,
                this._tempWorldPos.z + data.labelPos.z,
            );
            data.label.setWorldPosition(this._tempChildPos);
        });
    }

    /**
     * 當環境發生旋轉時的回調處理
     * @param orientation 當前方向
     */
    protected onOrientationChange(orientation: OrientationType): void {
        log('onOrientationChange', orientation);
        const isLandscape = orientation === OrientationType.LANDSCAPE;
        const newWidth = isLandscape ? 1920 : 1080;
        const height = isLandscape ? 200 : 1920;
        this.getUITransform().setContentSize(newWidth, height);
        const svNode = this.node.getChildByName('TabScrollView');
        if (svNode) {
            this.getUITransform(svNode).setContentSize(newWidth, height);
            const vpNode = svNode.getChildByName('Viewport');
            if (vpNode) {
                this.getUITransform(vpNode).setContentSize(newWidth, height);
                const content = vpNode.getChildByName('Content');
                if (content && this._layers) {
                    const contentTrans = this.getUITransform(content);
                    this.getUITransform(this._layers.bgLayer).setContentSize(
                        contentTrans.contentSize,
                    );
                    this.getUITransform(this._layers.labelLayer).setContentSize(
                        contentTrans.contentSize,
                    );
                }
            }
        }
    }

    /**
     * 配置頁籤資料並生成按鈕
     * @param tabs 頁籤資料陣列
     */
    public setup(tabs: ICategoryTab[]): void {
        this.initUI();
        this._tabs = tabs;
        this._clearButtons();

        tabs.forEach((tab, index) => {
            const btnNode = this._createTabNode(tab, index);
            this._container.addChild(btnNode);
            this._buttonNodes.push(btnNode);
        });

        this.selectTab(this._currentIndex, true);
    }

    /**
     * 點擊切換頁籤
     * @param index 目標索引
     * @param force 是否強制執行 (忽略重複檢查)
     */
    public selectTab(index: number, force: boolean = false): void {
        if (index < 0 || index >= this._tabs.length) return;
        
        // 如果點選的是同一個頁籤，則不執行切換邏輯 (除非是強制執行)
        if (!force && index === this._currentIndex && this._buttonNodes.length > 0) {
            return;
        }

        this._currentIndex = index;
        this._updateVisuals();
        this.onCategoryChange(this._tabs[index].id);
    }

    /**
     * 生成單個頁籤按鈕節點
     * @param tab 頁籤資料
     * @param index 索引位置
     * @returns 按鈕節點
     */
    private _createTabNode(tab: ICategoryTab, index: number): Node {
        // 1. 建立邏輯節點 (放在 Layout 中)
        const logicalNode = NodeFactory.createUINode(`Tab_${tab.id}`);
        this.getUITransform(logicalNode).setContentSize(352, 110);

        // 2. 建立背景 (放在 BgLayer)
        const { node: bgNode, sprite } = NodeFactory.createSpriteNode(
            'Background',
            this._INACTIVE_COLOR,
        );
        this.getUITransform(bgNode).setContentSize(352, 110);
        bgNode.setParent(this._layers!.bgLayer);

        // 3. 建立文字 (放在 LabelLayer)
        const { node: labelNode, label } = NodeFactory.createLabelNode('Label', tab.label, 53);
        label.cacheMode = Label.CacheMode.CHAR; // 優化 DrawCall
        labelNode.setParent(this._layers!.labelLayer);

        // 紀錄映射關係與初始偏移 (這裡按鈕中心點即邏輯節點中心)
        this._layeredNodesMap.set(logicalNode, {
            bg: bgNode,
            label: labelNode,
            bgPos: Vec3.ZERO.clone(),
            labelPos: Vec3.ZERO.clone(),
        });

        // 4. 按鈕組件留在邏輯節點上以接收輸入
        const btn = logicalNode.addComponent(Button);
        btn.transition = Button.Transition.SCALE;
        btn.zoomScale = 0.95;

        logicalNode.on(Button.EventType.CLICK, () => this.selectTab(index), this);

        return logicalNode;
    }

    /**
     * 更新按鈕視覺狀態（選中/未選中）
     */
    private _updateVisuals(): void {
        this._buttonNodes.forEach((logicalNode: Node, index: number) => {
            const isActive = index === this._currentIndex;
            const data = this._layeredNodesMap.get(logicalNode);
            if (!data) return;

            const sprite = data.bg.getComponent(Sprite);
            if (sprite) {
                sprite.color = isActive ? new Color(100, 140, 255, 255) : this._INACTIVE_COLOR;
            }
            const label = data.label.getComponent(Label);
            if (label) {
                label.color = isActive ? Color.WHITE : new Color(220, 220, 220, 255);
            }
        });
    }

    /**
     * 清除所有舊的按鈕節點
     */
    private _clearButtons(): void {
        this._buttonNodes.forEach((node) => {
            const data = this._layeredNodesMap.get(node);
            if (data) {
                data.bg.destroy();
                data.label.destroy();
            }
            node.destroy();
        });
        this._buttonNodes = [];
        this._layeredNodesMap.clear();
    }
}
