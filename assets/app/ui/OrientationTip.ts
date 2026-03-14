import { _decorator, Node, Color, Widget, BlockInputEvents } from 'cc';
import { UIComponentBase } from '../../core/game/base/ui/UIComponentBase';
import { NodeFactory } from '../../core/utils/NodeFactory';
import { OrientationType } from '../../core/systems/screen/OrientationManager';

const { ccclass } = _decorator;

/**
 * OrientationTip - 螢幕旋轉提示組件
 *
 * 當寬高比不符合遊戲設計時顯示 (例如直屏遊戲被橫著拿)
 */
@ccclass('OrientationTip')
export class OrientationTip extends UIComponentBase {
    private _tipNode!: Node;

    protected createUI(): void {
        this.node.layer = 25; // UI_2D

        // 確保提示根節點填滿父級 (Canvas)
        const rootWidget = this.getOrAddComponent(this.node, Widget);
        rootWidget.isAlignLeft =
            rootWidget.isAlignRight =
            rootWidget.isAlignTop =
            rootWidget.isAlignBottom =
                true;
        rootWidget.left = rootWidget.right = rootWidget.top = rootWidget.bottom = 0;
        rootWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // 1. 建立黑色半透明背景 (遮罩全螢幕並攔截輸入)
        const { node: bg } = NodeFactory.createSpriteNode('Background', new Color(0, 0, 0, 180));
        this.node.addChild(bg);

        const uiTrans = this.getUITransform(bg);
        uiTrans.setContentSize(3000, 3000);
        const bgWidget = bg.addComponent(Widget);
        bgWidget.isAlignLeft =
            bgWidget.isAlignRight =
            bgWidget.isAlignTop =
            bgWidget.isAlignBottom =
                true;
        bgWidget.left = bgWidget.right = bgWidget.top = bgWidget.bottom = -1000; // 邊界溢出確保覆蓋
        bgWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        bg.addComponent(BlockInputEvents);

        // 2. 建立提示內容容器
        this._tipNode = NodeFactory.createUINode('Content');
        this.node.addChild(this._tipNode);
        const tipWidget = this._tipNode.addComponent(Widget);
        tipWidget.isAlignHorizontalCenter = tipWidget.isAlignVerticalCenter = true;
        tipWidget.horizontalCenter = tipWidget.verticalCenter = 0;
        tipWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // 3. 建立圖標或文字
        const { label } = NodeFactory.createLabelNode('Text', '請旋轉螢幕以獲得最佳體驗', 40);
        label.color = Color.WHITE;
        this._tipNode.addChild(label.node);

        // 4. 預設隱藏
        this.node.active = false;
    }

    protected override onOrientationChange(orientation: OrientationType): void {
        this._refreshVisibility();
    }

    public updateVisibility(): void {
        this.initUI(); // 確保 UI 已建立
        this._refreshVisibility();
    }

    private _refreshVisibility(): void {
        // const shouldShow = OrientationManager.getInstance().shouldShowRotateTip;
        // this.node.active = shouldShow;
        // if (shouldShow) {
        //     // 每次顯示時確保置頂
        //     this.node.setSiblingIndex(999);
        // }
    }
}
