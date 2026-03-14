import { _decorator, Node, Label, tween, Vec3, UIOpacity, Color, Layers, UITransform } from 'cc';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { SoundManager } from '../../../../../core/systems/audio/SoundManager';
import { UIComponentBase } from '../../../../../core/game/base/ui/UIComponentBase';
import { OrientationType } from '../../../../../core/systems/screen/OrientationManager';
import { LanguageManager } from '../../../../../core/systems/language/LanguageManager';
import { GameConfig } from '../config/GameConfig';

const { ccclass } = _decorator;

/**
 * FreeSpinIntroView - 免費遊戲啟動過場
 * 單一職責：顯示進入免費遊戲的提示與動畫。
 */
@ccclass('FreeSpinIntroView')
export class FreeSpinIntroView extends UIComponentBase {
    private _rootNode: Node | null = null;

    protected createUI(): void {
        this._buildUI();
    }

    protected onOrientationChange(orientation: OrientationType): void {
        // 自適應
    }

    public show(callback?: () => void): void {
        this.initUI();
        // SoundManager.getInstance().playSFX(GameConfig.getResBundleName(), 'audio/fs_intro_long');

        if (this._rootNode) {
            this._rootNode.setScale(0, 0, 0);
            const opacity = this.getOrAddComponent(this._rootNode, UIOpacity);
            opacity.opacity = 0;

            tween(opacity).to(0.4, { opacity: 255 }).start();

            tween(this._rootNode)
                .to(0.6, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .delay(2.0)
                .to(0.5, { scale: new Vec3(1.5, 1.5, 1.5) })
                .parallel(tween(opacity).to(0.5, { opacity: 0 }))
                .call(() => {
                    if (callback) callback();
                    this.node.destroy();
                })
                .start();
        }
    }

    private _buildUI(): void {
        this.getUITransform().setContentSize(720, 1280);

        // 背景遮罩
        const { node: bg } = NodeFactory.createSpriteNode('Mask', new Color(0, 0, 0, 200));
        this.getUITransform(bg).setContentSize(2000, 2000);
        this.node.addChild(bg);

        // 主容器
        this._rootNode = new Node('Main');
        this._rootNode.layer = Layers.Enum.DEFAULT;
        this.node.addChild(this._rootNode);

        // 標題文字
        const lang = LanguageManager.getInstance();
        const { label: title } = NodeFactory.createLabelNode(
            'Title',
            lang.t('FREE SPINS TRIGGERED'),
            60,
        );
        title.color = new Color(255, 215, 0);
        this._rootNode.addChild(title.node);

        // 次標題
        const { label: sub } = NodeFactory.createLabelNode('Sub', '15 SPINS', 40);
        sub.color = Color.WHITE;
        sub.node.setPosition(0, -80);
        this._rootNode.addChild(sub.node);

        // 埃及圖案背景模擬 (發光圓環)
        const { node: ring } = NodeFactory.createSpriteNode('Ring', new Color(255, 215, 0, 80));
        this.getUITransform(ring).setContentSize(400, 400);
        this._rootNode.insertChild(ring, 0);

        tween(ring)
            .repeatForever(tween().by(3, { angle: 360 }))
            .start();
    }
}
