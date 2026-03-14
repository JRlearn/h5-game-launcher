import {
    _decorator,
    Node,
    Label,
    tween,
    Vec3,
    Color,
    Layers,
    UITransform,
    Size,
    Sprite,
    SpriteFrame,
} from 'cc';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { ResManager } from '../../../../../core/systems/resource/ResManager';
import { UIComponentBase } from '../../../../../core/game/base/ui/UIComponentBase';
import { OrientationType } from '../../../../../core/systems/screen/OrientationManager';
import { GameConfig } from '../config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * MultiplierMeter - 累計倍數顯示組件 (Iteration 24: Refactored to UIComponentBase)
 */
@ccclass('MultiplierMeter')
export class MultiplierMeter extends UIComponentBase {
    private _valLabel: Label | null = null;
    private _bgSprite: Sprite | null = null;

    protected createUI(): void {
        this._buildUI();
    }

    protected onOrientationChange(orientation: OrientationType): void {
        // 可根據方向調整倍數表位置
    }

    public updateValue(val: number): void {
        if (!this._valLabel) return;
        this._valLabel.string = `${val}x`;

        tween(this.node)
            .to(0.1, { scale: new Vec3(1.2, 1.2, 1.2) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    private _buildUI(): void {
        const trans = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        trans.setContentSize(120, 120);

        // 圓形背景
        const bg = NodeFactory.createSpriteNode('Bg', new Color(0, 0, 0, 150)).node;
        bg.getComponent(UITransform)!.setContentSize(120, 120);
        this.node.addChild(bg);

        // 金色圓圈邊框
        const border = NodeFactory.createSpriteNode('Border', new Color(218, 165, 32)).node;
        border.getComponent(UITransform)!.setContentSize(110, 110);
        this.node.addChild(border);

        // 數值
        const { label: val } = NodeFactory.createLabelNode('Val', '1x', 32);
        val.color = Color.YELLOW;
        this._valLabel = val;
        this.node.addChild(val.node);

        const { label: title } = NodeFactory.createLabelNode('Title', 'MULT', 16);
        title.color = Color.WHITE;
        title.node.setPosition(0, -35);
        this.node.addChild(title.node);
    }
}
