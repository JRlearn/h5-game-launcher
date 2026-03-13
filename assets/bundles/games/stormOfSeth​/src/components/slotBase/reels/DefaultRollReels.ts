import { _decorator, Vec3, Mask, Node, UITransform, Graphics, Color } from 'cc';
import { DefaultSymbolContainer } from '../symbol/DefaultSymbolContainer';
import { IRollReelsSetting, RollReelsBase } from './RollReelsBase';

const { ccclass } = _decorator;

/**
 * 預設滾動類型轉輪設定檔 (Cocos Creator 3.8.8)
 */
export class DefaultRollReelsSetting implements IRollReelsSetting {
    /**
     * 獲取輪帶單次循環的轉動距離
     * @param reelIndex 軸索引
     * @returns 距離數值
     */
    public getReelCycleDistance(reelIndex: number): number {
        return 500;
    }

    /**
     * 獲取總軸數
     * @returns 軸數
     */
    public getReelCount(): number {
        return 5;
    }

    /**
     * 獲取單軸上的圖騰總數
     * @param reelIndex 軸索引
     * @returns 圖騰數量
     */
    public getReelSymbolCount(reelIndex: number): number {
        return 5;
    }

    /**
     * 獲取圖騰在設計解析度下的初始位置
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @returns 位置向量 (Vec3)
     */
    public getReelSymbolContainerOriPos(reelIndex: number, symbolIndex: number): Vec3 {
        return new Vec3(reelIndex * 100, symbolIndex * 100, 0);
    }

    /**
     * 獲取輪帶容器的設計寬度
     * @returns 寬度
     */
    public getReelContainerWidth(): number {
        return 500;
    }

    /**
     * 獲取輪帶容器的設計高度
     * @returns 高度
     */
    public getReelContainerHeight(): number {
        return 500;
    }
}

/**
 * 預設轉軸元件 (Cocos Creator 3.8.8)
 * 繼承自 RollReelsBase，實現基礎滾動邏輯與遮罩設定。
 */
@ccclass('DefaultRollReels')
export class DefaultRollReels extends RollReelsBase<DefaultSymbolContainer, DefaultRollReelsSetting> {
    
    /**
     * 覆寫 UI 初始化，在基礎結構之上加入遮罩邏輯
     */
    protected override _initUI(): void {
        super._initUI();
        this._applyReelMask();
    }

    /**
     * 在轉輪根節點套用矩形遮罩 (Mask) 以裁切顯示區域
     */
    private _applyReelMask(): void {
        if (!this._reelRootNode) return;

        const mask = this._reelRootNode.getComponent(Mask) || this._reelRootNode.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        
        const transform = this._reelRootNode.getComponent(UITransform);
        if (transform) {
            const width = this._setting?.getReelContainerWidth() || 500;
            const height = this._setting?.getReelContainerHeight() || 500;
            transform.setContentSize(width, height);
            transform.setAnchorPoint(0, 0);
        }
    }

    /**
     * 實作圖騰容器創建工廠
     * @returns 預設圖騰容器組件實例
     */
    protected override createSymbolContainer(): DefaultSymbolContainer {
        const node = new Node('SymbolContainer');
        return node.addComponent(DefaultSymbolContainer);
    }

    /**
     * 初始化轉輪，可傳入自定義設定檔
     * @param setting 滾動設定實例
     */
    public override init(setting: DefaultRollReelsSetting = new DefaultRollReelsSetting()): void {
        super.init(setting);
    }
}
