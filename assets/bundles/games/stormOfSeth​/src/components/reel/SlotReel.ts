import { _decorator, Node, Color, UITransform, Layout, Size, Vec3, tween, Mask } from 'cc';
import { UIComponentBase } from '../../../../../../scripts/core/base/ui/UIComponentBase';
import { NodeFactory } from '../../../../../../scripts/core/utils/NodeFactory';

const { ccclass } = _decorator;

/**
 * SlotReel - 單個輪盤組件
 */
@ccclass('SlotReel')
export class SlotReel extends UIComponentBase {
    private _container!: Node;
    private _icons: Node[] = [];
    private _iconSize = new Size(120, 120);
    private _visibleCount = 3;

    protected createUI(): void {
        const totalHeight = this._iconSize.height * this._visibleCount;
        this.getUITransform().setContentSize(this._iconSize.width, totalHeight);

        // 1. 遮罩 (Mask)
        const maskNode = this.createChild('Mask');
        const mask = maskNode.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        this.getUITransform(maskNode).setContentSize(this._iconSize.width, totalHeight);

        // 2. 容器
        this._container = new Node('IconContainer');
        this._container.addComponent(UITransform).setAnchorPoint(0.5, 1);
        maskNode.addChild(this._container);

        const layout = this._container.addComponent(Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;
        layout.spacingY = 0;

        // 3. 初始生成圖示 (示意)
        for (let i = 0; i < this._visibleCount + 2; i++) {
            this._createIcon();
        }
    }

    private _createIcon(): void {
        const { node } = NodeFactory.createSpriteNode('Icon', new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255));
        this.getUITransform(node).setContentSize(this._iconSize.width, this._iconSize.height);
        this._container.addChild(node);
        this._icons.push(node);
    }

    /**
     * 執行動效
     */
    public async spin(): Promise<void> {
        // 簡單的位移動效示意
        return new Promise((resolve) => {
            const startPos = new Vec3(0, 0, 0);
            const targetPos = new Vec3(0, -500, 0);
            
            this._container.setPosition(startPos);
            
            tween(this._container)
                .to(1.5, { position: targetPos }, { easing: 'quintIn' })
                .call(() => {
                    this._container.setPosition(startPos);
                    resolve();
                })
                .start();
        });
    }
}
