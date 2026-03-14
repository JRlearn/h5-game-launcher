import { _decorator, Sprite, Vec3, UITransform, Color, Node } from 'cc';
import { SymbolContainerBase } from './SymbolContainerBase';

const { ccclass } = _decorator;

/**
 * DefaultSymbolContainer - 預設圖騰容器元件
 * 繼承自 SymbolContainerBase，提供基礎的 Sprite 渲染與縮放功能。
 */
@ccclass('DefaultSymbolContainer')
export class DefaultSymbolContainer extends SymbolContainerBase {
    /** 圖騰渲染組件 */
    protected _sprite: Sprite | null = null;

    /**
     * 覆寫初始化 UI 結構
     */
    protected override _initUI(): void {
        super._initUI();
        this._sprite = this._createSprite();
        this.node.addChild(this._sprite.node);
        this._symbolNode = this._sprite.node;
    }

    /**
     * 內部建立圖騰顯示用的 Sprite 節點
     * @returns Sprite 組件實例
     */
    private _createSprite(): Sprite {
        const spriteNode = new Node('Sprite');
        spriteNode.addComponent(UITransform);
        const sprite = spriteNode.addComponent(Sprite);
        // 預設設為白色單色圖案
        sprite.color = Color.WHITE;
        return sprite;
    }

    /**
     * 更新圖騰顯示紋理
     * @param textureName 紋理資源名稱
     */
    public setSymbolTexture(textureName: string): void {
        console.log(`[DefaultSymbolContainer] 設定紋理: ${textureName}`);
        // TODO: 實際實作需透過 Bundle 載入 SpriteFrame
    }

    /**
     * 更新圖騰顯示節點的縮放
     * @param scale 縮放向量
     */
    public setSymbolScale(scale: Vec3): void {
        if (this._sprite) {
            this._sprite.node.setScale(scale);
        }
    }

    /**
     * 更新圖騰顯示節點的局部座標
     * @param pos 目標局部座標向量
     */
    public setSymbolPosition(pos: Vec3): void {
        if (this._sprite) {
            this._sprite.node.setPosition(pos);
        }
    }
}
