import { Color, Layout, Widget, Button, Node } from 'cc';
import { ViewBase } from '../../../../../scripts/core/base/mvc/view/ViewBase';
import { NodeFactory } from '../../../../../scripts/core/utils/NodeFactory';
import { SlotReel } from '../components/reel/SlotReel';

/**
 * SlotView - 消除類 Slot 視圖層
 */
export class SlotView extends ViewBase {
    public onSpinClick: () => void = () => {};
    private _reels: SlotReel[] = [];

    public override init(): void {
        const rootTrans = this.getUITransform();
        rootTrans.setContentSize(720, 1280);

        // 1. 背景
        const { node: bg } = NodeFactory.createSpriteNode('Background', new Color(20, 20, 30, 255));
        this.root.addChild(bg);
        const bgWidget = bg.addComponent(Widget);
        bgWidget.isAlignLeft =
            bgWidget.isAlignRight =
            bgWidget.isAlignTop =
            bgWidget.isAlignBottom =
                true;
        bgWidget.left = bgWidget.right = bgWidget.top = bgWidget.bottom = 0;
        bgWidget.alignMode = Widget.AlignMode.ALWAYS;

        // 2. 主容器 (垂直佈局)
        const layout = this.getOrAddComponent(this.root, Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.spacingY = 50;
        layout.paddingTop = 100;

        // 3. 標題
        const { label: title } = NodeFactory.createLabelNode('Title', 'SLOT MASTER', 60);
        title.color = new Color(255, 215, 0);
        this.root.addChild(title.node);

        // 4. 輪盤區域 (Slot Reels Area)
        const { node: reelsArea } = NodeFactory.createSpriteNode(
            'ReelsArea',
            new Color(0, 0, 0, 100),
        );
        this.getUITransform(reelsArea).setContentSize(680, 450);
        this.root.addChild(reelsArea);

        const reelLayout = reelsArea.addComponent(Layout);
        reelLayout.type = Layout.Type.HORIZONTAL;
        reelLayout.spacingX = 10;
        reelLayout.resizeMode = Layout.ResizeMode.CHILDREN;

        // 建立 5 個輪盤
        for (let i = 0; i < 5; i++) {
            const { component: reel } = NodeFactory.createNodeWithComponent(`Reel_${i}`, SlotReel, {
                parent: reelsArea,
            });
            this._reels.push(reel as SlotReel);
        }

        // 5. 控制面板區域
        const { node: controlPanel } = NodeFactory.createSpriteNode(
            'ControlPanel',
            new Color(40, 40, 60, 255),
        );
        this.getUITransform(controlPanel).setContentSize(680, 200);
        this.root.addChild(controlPanel);

        // 加上 Spin 按鈕
        const { node: spinBtnNode } = NodeFactory.createSpriteNode('SpinBtn', new Color(50, 180, 50));
        this.getUITransform(spinBtnNode).setContentSize(200, 80);
        controlPanel.addChild(spinBtnNode);
        const { label: spinText } = NodeFactory.createLabelNode('Label', 'SPIN', 36);
        spinBtnNode.addChild(spinText.node);
        const btn = spinBtnNode.addComponent(Button);
        btn.node.on(Button.EventType.CLICK, () => this.onSpinClick(), this);
    }

    /**
     * 同步或按順序轉動所有輪盤
     * @returns Promise<void>
     */
    public async spinAllReels(): Promise<void> {
        const promises = this._reels.map((reel, index) => {
            return new Promise<void>((resolve) => {
                setTimeout(async () => {
                    await reel.spin();
                    resolve();
                }, index * 200); // 階梯式啟動
            });
        });
        await Promise.all(promises);
    }
}
