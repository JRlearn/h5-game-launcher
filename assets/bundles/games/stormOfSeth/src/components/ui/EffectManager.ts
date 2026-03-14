import { _decorator, Component, Node, Color, Vec3, tween, UITransform, Sprite } from 'cc';
import { NodeFactory } from '../../../../../../core/utils/NodeFactory';

const { ccclass } = _decorator;

/**
 * EffectManager - 遊戲特效管理器 (優化版)
 * 單一職責：提供全域粒子特效、閃爍光效等。
 */
@ccclass('EffectManager')
export class EffectManager extends Component {
    private static _instance: EffectManager | null = null;
    public static getInstance(): EffectManager {
        return this._instance!;
    }

    protected onLoad(): void {
        EffectManager._instance = this;
    }

    /**
     * 在指定位置播放金幣噴發效果 (模擬)
     */
    public playWinFountain(startPos: Vec3, count: number = 20): void {
        for (let i = 0; i < count; i++) {
            const coin = new Node('CoinEffect');
            this.node.addChild(coin);
            coin.worldPosition = startPos;
            const sprite = coin.addComponent(Sprite);
            sprite.color = new Color(255, 215, 0); // Gold
            coin.addComponent(UITransform).setContentSize(20, 20);

            const velocity = new Vec3((Math.random() - 0.5) * 400, 500 + Math.random() * 500, 0);
            
            tween(coin)
                .parallel(
                    tween(coin).by(1.5, { position: new Vec3(velocity.x * 1.5, -1000, 0) }, { easing: 'quadIn' }),
                    tween(coin).to(1.5, { scale: new Vec3(0, 0, 0) })
                )
                .call(() => coin.destroy())
                .start();
        }
    }

    /**
     * 圖騰消除時的煙塵效果
     */
    public playExplosionSmoke(pos: Vec3, color: Color): void {
        for (let i = 0; i < 5; i++) {
            const smoke = new Node('Smoke');
            this.node.addChild(smoke);
            smoke.worldPosition = pos;
            const sprite = smoke.addComponent(Sprite);
            sprite.color = new Color(color.r, color.g, color.b, 100);
            smoke.addComponent(UITransform).setContentSize(40, 40);

            const targetPos = pos.clone().add(new Vec3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 0));
            
            tween(smoke)
                .to(0.4, { worldPosition: targetPos, scale: new Vec3(2, 2, 2) }, { easing: 'fade' })
                .call(() => smoke.destroy())
                .start();
        }
    }
}
