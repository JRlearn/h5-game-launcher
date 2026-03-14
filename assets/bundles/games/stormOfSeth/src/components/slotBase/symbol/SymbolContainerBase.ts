import { _decorator, Component, Node, Vec3, UITransform } from 'cc';

const { ccclass } = _decorator;

/**
 * SymbolContainerBase - 圖騰容器元件基底
 * 負責單個圖騰的顯示、縮放與位置控管。
 */
@ccclass('SymbolContainerBase')
export abstract class SymbolContainerBase extends Component {
    /** 實際顯示圖騰資源的節點 */
    protected _symbolNode: Node | null = null;

    /**
     * 生命週期：加載完成
     */
    protected onLoad(): void {
        this._initUI();
    }

    /**
     * 初始化 UI 結構與基礎組件
     */
    protected _initUI(): void {
        this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        // 子類可在此擴充圖騰資源節點的建立
    }

    /**
     * 設定圖騰資源的紋理或外觀
     * @param textureName 資源名稱或路徑
     */
    public abstract setSymbolTexture(textureName: string): void;

    /**
     * 設定圖騰節點的縮放比例
     * @param scale 縮放向量
     */
    public abstract setSymbolScale(scale: Vec3): void;

    /**
     * 設定圖騰節點的局部座標位置
     * @param pos 目標局部座標向量
     */
    public abstract setSymbolPosition(pos: Vec3): void;

    /**
     * 獲取圖騰所在的 Y 座標值 (便利存取器)
     * @returns Y 座標
     */
    public get y(): number {
        return this.node.position.y;
    }

    /**
     * 設定圖騰所在的 Y 座標值 (便利存取器)
     * @param value 目標 Y 座標
     */
    public set y(value: number) {
        const pos = this.node.position.clone();
        pos.y = value;
        this.node.setPosition(pos);
    }
}
