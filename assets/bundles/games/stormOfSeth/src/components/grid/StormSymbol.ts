import {
    _decorator,
    Node,
    UITransform,
    SpriteFrame,
    Rect,
    Color,
    UIOpacity,
    tween,
    Vec3,
    Label,
} from 'cc';
import { DefaultSymbolContainer } from '../../../../../common/src/slot/components/symbol/DefaultSymbolContainer';
import { SymbolData } from '../../model/SymbolData';
import { ResManager } from '../../../../../../core/systems/resource/ResManager';
import { NodeFactory } from '../../../../../../core/utils/NodeFactory';
import { SoundManager } from '../../../../../../core/systems/audio/SoundManager';
import { GameConfig } from '../../config/GameConfig';

const { ccclass } = _decorator;

/**
 * StormSymbol - 戰神賽特專用圖騰元件
 * 繼承自 DefaultSymbolContainer，負責特有圖騰的掉落、消除與外觀狀態。
 */
@ccclass('StormSymbol')
export class StormSymbol extends DefaultSymbolContainer {
    private _glowNode: Node | null = null;
    private _labelNode: Node | null = null;
    private _data: SymbolData | null = null;

    public get data(): SymbolData | null {
        return this._data;
    }

    /**
     * 初始化單一符號元件
     * @param data 符號資料
     * @param size 符號長寬
     */
    public init(data: SymbolData, size: number): void {
        this._data = data;
        const trans = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        trans.setContentSize(size, size);

        if (this._sprite) {
            const spriteTrans = this._sprite.node.getComponent(UITransform);
            if (spriteTrans) spriteTrans.setContentSize(size - 10, size - 10);
            this.updateSymbolView();
        }
    }

    private updateSymbolView(): void {
        if (!this._data || !this._sprite) return;

        const typeIdx = this._data.type;
        const GRID_COLS = 4;
        const GRID_ROWS = 3;

        ResManager.getInstance()
            .load(GameConfig.getResBundleName(), 'textures/symbols/spriteFrame', SpriteFrame)
            .then((sf) => {
                if (sf && this._sprite && this._sprite.isValid) {
                    const cloneSf = sf.clone();
                    const texSize = sf.originalSize;
                    const cellW = texSize.width / GRID_COLS;
                    const cellH = texSize.height / GRID_ROWS;

                    const sx = (typeIdx % GRID_COLS) * cellW;
                    const sy = Math.floor(typeIdx / GRID_COLS) * cellH;

                    cloneSf.rect = new Rect(sx, sy, cellW, cellH);
                    this._sprite.spriteFrame = cloneSf;
                }
            });

        if (this._data.type === 9) {
            this.createMultiplierGlow(this._data.multiplier || 2);
        } else if (this._data.type === 8) {
            this.createScatterLabel();
        }
    }

    private createMultiplierGlow(mult: number): void {
        if (!this._glowNode) {
            this._glowNode = new Node('Glow');
            this.node.insertChild(this._glowNode, 0);
            const { sprite } = NodeFactory.createSpriteNode(
                'GlowSprite',
                new Color(255, 215, 0, 100),
            );
            this._glowNode.addChild(sprite.node);
            const trans = this._glowNode.addComponent(UITransform);
            trans.setContentSize(this.node.getComponent(UITransform)!.contentSize);

            const glowOpacity = this._glowNode.addComponent(UIOpacity);
            tween(glowOpacity)
                .to(1.0, { opacity: 200 })
                .to(1.0, { opacity: 50 })
                .union()
                .repeatForever()
                .start();

            const { label } = NodeFactory.createLabelNode('Val', `${mult}x`, 32);
            label.color = Color.YELLOW;
            label.node.setPosition(0, -30);
            this._labelNode = label.node;
            this.node.addChild(this._labelNode);
        }
    }

    private createScatterLabel(): void {
        if (!this._labelNode) {
            const { label } = NodeFactory.createLabelNode('Scatter', 'SCATTER', 16);
            label.color = Color.CYAN;
            label.node.setPosition(0, -35);
            this._labelNode = label.node;
            this.node.addChild(this._labelNode);
        }
    }

    /**
     * 播放掉落進場動畫
     */
    public async playDrop(delay: number, duration: number, suspense: boolean): Promise<void> {
        const originalPos = this.node.position.clone();
        this.node.setPosition(originalPos.x, originalPos.y + 500);

        return new Promise<void>((resolve) => {
            tween(this.node)
                .delay(delay)
                .call(() => {
                    /* if (suspense && this._data?.type === 8) {
                        SoundManager.getInstance().playSFX(
                            GameConfig.getResBundleName(),
                            'audio/scatter_near_miss',
                        );
                    } */
                })
                .to(duration, { position: originalPos }, { easing: 'bounceOut' })
                .call(() => resolve())
                .start();
        });
    }

    /**
     * 播放消除爆炸動畫
     */
    public async playExplode(isTurbo: boolean): Promise<void> {
        return new Promise<void>((resolve) => {
            const opacityComp = this.node.addComponent(UIOpacity);
            const speedFactor = isTurbo ? 0.3 : 1.0;
            tween(this.node)
                .to(0.15 * speedFactor, { scale: new Vec3(1.3, 1.3, 1.3) })
                .call(() => {
                    tween(opacityComp)
                        .to(0.2 * speedFactor, { opacity: 0 }, { easing: 'fade' })
                        .call(() => {
                            this.node.destroy();
                            resolve();
                        })
                        .start();

                    tween(this.node)
                        .to(0.2 * speedFactor, { scale: new Vec3(0.5, 0.5, 0.5) })
                        .start();
                })
                .start();
        });
    }

    public getColor(): Color {
        return this._sprite ? this._sprite.color : Color.WHITE;
    }
}
