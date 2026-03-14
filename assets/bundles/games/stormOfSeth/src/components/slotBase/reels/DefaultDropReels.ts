import { _decorator, Vec3, Node, Mask, UITransform } from 'cc';
import { DefaultSymbolContainer } from '../symbol/DefaultSymbolContainer';
import { DropReelsBase, IDropReelsSetting } from './DropReelsBase';

const { ccclass } = _decorator;

/**
 * 預設掉落類型基底設定檔 (Cocos Creator 3.8.8)
 */
export class DefaultDropReelsSetting implements IDropReelsSetting {
    /**
     * 獲取輪帶總軸數
     * @returns 軸數
     */
    public getReelCount(): number {
        return 5;
    }

    /**
     * 獲取指定軸上的圖騰數量
     * @param reelIndex 軸索引
     * @returns 圖騰數量
     */
    public getReelSymbolCount(reelIndex: number): number {
        return 5;
    }

    /**
     * 獲取圖騰容器在設計解析度下的初始位置
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @returns 位置向量 (Vec3)
     */
    public getReelSymbolContainerOriPos(reelIndex: number, symbolIndex: number): Vec3 {
        return new Vec3(reelIndex * 100, symbolIndex * 100, 0);
    }

    /**
     * 獲取輪帶重複週期或位移間距
     * @param reelIndex 軸索引
     * @returns 間距數值
     */
    public getReelRepeatGap(reelIndex: number): number {
        return 500;
    }

    /**
     * 獲取轉輪容器設計寬度
     * @returns 寬度
     */
    public getReelContainerWidth(): number {
        return 500;
    }

    /**
     * 獲取轉輪容器設計高度
     * @returns 高度
     */
    public getReelContainerHeight(): number {
        return 500;
    }
}

/**
 * 預設掉落類型輪軸元件 (Cocos Creator 3.8.8)
 * 繼承自 DropReelsBase，實現基礎掉落邏輯與遮罩設定。
 */
@ccclass('DefaultDropReels')
export class DefaultDropReels extends DropReelsBase<
    DefaultSymbolContainer,
    DefaultDropReelsSetting
> {
    /**
     * 覆寫 UI 初始化，加入矩形裁切功能
     */
    protected override _initUI(): void {
        super._initUI();
        this._applyReelMask();
    }

    /**
     * 針對轉輪容器節點設置 Mask
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
     * 創建特定的圖騰容器實例
     * @returns 圖騰容器組件
     */
    protected override createSymbolContainer(): DefaultSymbolContainer {
        const node = new Node('SymbolContainer');
        return node.addComponent(DefaultSymbolContainer);
    }

    /**
     * 初始化掉落轉輪邏輯
     * @param setting 掉落設定檔
     */
    public override init(setting: DefaultDropReelsSetting = new DefaultDropReelsSetting()): void {
        super.init(setting);
    }
}
