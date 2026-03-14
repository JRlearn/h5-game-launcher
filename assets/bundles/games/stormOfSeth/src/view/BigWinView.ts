import {
    _decorator,
    Node,
    Label,
    tween,
    Vec3,
    UIOpacity,
    Color,
    Layers,
    UITransform,
    Size,
} from 'cc';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { SoundManager } from '../../../../../core/systems/audio/SoundManager';
import { UIComponentBase } from '../../../../../core/game/base/ui/UIComponentBase';
import { OrientationType } from '../../../../../core/systems/screen/OrientationManager';
import { GameConfig } from '../config/GameConfig';

const { ccclass } = _decorator;

/**
 * BigWinView - 大獎慶祝彈窗 (優化版)
 * 單一職責：顯示中獎慶祝及數碼滾動。
 */
@ccclass('BigWinView')
export class BigWinView extends UIComponentBase {
    private _amountLabel: Label | null = null;
    private _titleLabel: Label | null = null;
    private _rootNode: Node | null = null;

    protected createUI(): void {
        this._buildUI();
    }

    protected onOrientationChange(orientation: OrientationType): void {
        // 自適應處理
    }

    public show(amount: number, callback?: () => void): void {
        this.initUI();
        /* SoundManager.getInstance().playSFX(
            GameConfig.getResBundleName(),
            'audio/big_win_celebration',
        ); */

        if (this._rootNode) {
            this._rootNode.setScale(0, 0, 0);
            const opacity = this.getOrAddComponent(this._rootNode, UIOpacity);
            opacity.opacity = 0;

            // 決定大獎等級
            let titleStr = 'BIG WIN!';
            let titleColor = Color.YELLOW;
            if (amount >= 500) {
                titleStr = 'MEGA WIN!!';
                titleColor = new Color(255, 140, 0); // Orange
            }
            if (amount >= 1000) {
                titleStr = 'SUPER WIN!!!';
                titleColor = new Color(255, 50, 50); // Red
            }

            if (this._titleLabel) {
                this._titleLabel.string = titleStr;
                this._titleLabel.color = titleColor;
            }

            tween(this._rootNode)
                .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();

            tween(opacity).to(0.3, { opacity: 255 }).start();

            // 數碼滾動動畫
            if (this._amountLabel) {
                const counter = { val: 0 };
                tween(counter)
                    .to(
                        2.0,
                        { val: amount },
                        {
                            onUpdate: () => {
                                if (this._amountLabel)
                                    this._amountLabel.string = Math.floor(
                                        counter.val,
                                    ).toLocaleString();
                            },
                        },
                    )
                    .delay(1.0)
                    .call(() => {
                        tween(opacity)
                            .to(0.5, { opacity: 0 })
                            .call(() => {
                                if (callback) callback();
                                this.node.destroy();
                            })
                            .start();
                    })
                    .start();
            }
        }
    }

    private _buildUI(): void {
        this.getUITransform().setContentSize(720, 1280);

        // 背景遮罩
        const { node: mask } = NodeFactory.createSpriteNode('Mask', new Color(0, 0, 0, 180));
        this.getUITransform(mask).setContentSize(2000, 2000);
        this.node.addChild(mask);

        // 主容器
        this._rootNode = new Node('Main');
        this._rootNode.layer = Layers.Enum.DEFAULT;
        this.getUITransform(this._rootNode).setContentSize(600, 400);
        this.node.addChild(this._rootNode);

        // 大標題
        const { label: title } = NodeFactory.createLabelNode('Title', 'BIG WIN!', 80);
        title.color = Color.YELLOW;
        title.node.setPosition(0, 120);
        this._titleLabel = title;
        this._rootNode.addChild(title.node);

        // 贏分數字
        const { label: amount } = NodeFactory.createLabelNode('Amount', '0', 120);
        amount.color = Color.WHITE;
        amount.node.setPosition(0, 0);
        this._amountLabel = amount;
        this._rootNode.addChild(amount.node);

        // 埃及裝飾背景 (模擬)
        const { node: deco } = NodeFactory.createSpriteNode('Deco', new Color(255, 215, 0, 50));
        this.getUITransform(deco).setContentSize(650, 300);
        this._rootNode.insertChild(deco, 0);

        // 裝飾動畫 (縮放跳動)
        tween(this._rootNode)
            .repeatForever(
                tween()
                    .to(0.1, { scale: new Vec3(1.05, 1.05, 1.05) })
                    .to(0.1, { scale: new Vec3(1, 1, 1) })
                    .delay(0.5),
            )
            .start();
    }
}
