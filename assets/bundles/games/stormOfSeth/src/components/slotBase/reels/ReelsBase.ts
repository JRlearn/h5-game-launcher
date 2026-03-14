import { _decorator, Component, Node, Vec3, UITransform } from 'cc';
import { SymbolContainerBase } from '../symbol/SymbolContainerBase';

const { ccclass } = _decorator;

/**
 * 轉輪設定檔介面
 */
export interface IReelsSetting {
    /**
     * 獲取輪帶總數
     * @returns 輪帶數量
     */
    getReelCount(): number;

    /**
     * 獲取指定輪帶的圖騰總數
     * @param reelIndex 軸索引
     * @returns 圖騰數量
     */
    getReelSymbolCount(reelIndex: number): number;

    /**
     * 獲取圖騰容器在設計解析度下的初始位置
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @returns 位置向量 (Vec3)
     */
    getReelSymbolContainerOriPos(reelIndex: number, symbolIndex: number): Vec3;
}

/**
 * 轉軸元件基底 (Cocos Creator 3.8.8)
 * 負責管理老虎機轉軸的生成、顯示與基礎位移邏輯。
 * @template TSymbolContainer 圖騰容器類別
 * @template TSetting 轉輪設定類別
 */
@ccclass('ReelsBase')
export abstract class ReelsBase<
    TSymbolContainer extends SymbolContainerBase = SymbolContainerBase,
    TSetting extends IReelsSetting = IReelsSetting,
> extends Component {
    /** 基礎轉輪設定檔 */
    protected _setting!: TSetting;

    /** 軸上的圖騰容器映射表 (reelIndex -> containers) */
    protected _reelSymbolContainersMap: Map<number, TSymbolContainer[]> = new Map();

    /** 轉輪根節點 (所有軸的父容器) */
    protected _reelRootNode: Node | null = null;

    /**
     * 生命週期：加載完成
     */
    protected onLoad(): void {
        this._initUI();
    }

    /**
     * 初始化 UI 結構
     */
    protected _initUI(): void {
        this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        this._reelRootNode = this._createReelRoot();
        this.node.addChild(this._reelRootNode);
    }

    /**
     * 創建轉輪根節點
     * @returns 新建立的節點
     */
    protected _createReelRoot(): Node {
        const node = new Node('ReelRoot');
        node.addComponent(UITransform);
        return node;
    }

    /**
     * 抽象方法：創建圖騰容器組件實例
     * @returns 圖騰容器實例
     */
    protected abstract createSymbolContainer(): TSymbolContainer;

    /**
     * 初始化轉輪邏輯與資料
     * @param setting 轉輪配置設定
     */
    public init(setting: TSetting): void {
        this.clear();
        this._setting = setting;
        this._createSlotReels();
    }

    /**
     * 根據設定檔批量創建轉輪與圖騰容器
     */
    protected _createSlotReels(): void {
        if (!this._reelRootNode) return;

        const reelCount = this._setting.getReelCount();
        for (let reelIndex = 0; reelIndex < reelCount; reelIndex++) {
            const symbolCount = this._setting.getReelSymbolCount(reelIndex);
            const symbolList: TSymbolContainer[] = [];
            for (let symbolIndex = 0; symbolIndex < symbolCount; symbolIndex++) {
                const symbol = this.createSymbolContainer();
                this._reelRootNode.addChild(symbol.node);
                symbolList.push(symbol);
            }
            this._reelSymbolContainersMap.set(reelIndex, symbolList);
        }
        this.resetReelsSymbolContainersToOriPos();
    }

    /**
     * 設定全部轉軸的可見性
     * @param visible 是否可見
     */
    public setReelsVisible(visible: boolean): void {
        const reelIndices = this._getReelIndexList();
        reelIndices.forEach((idx) => this.setReelVisible(idx, visible));
    }

    /**
     * 設定單軸的可見性
     * @param reelIndex 軸索引
     * @param visible 是否可見
     */
    public setReelVisible(reelIndex: number, visible: boolean): void {
        const symbols = this._getSymbolContainersByReelIndex(reelIndex);
        symbols.forEach((s) => (s.node.active = visible));
    }

    /**
     * 將所有軸的圖騰位置重置為設定檔中的初始位置
     */
    public resetReelsSymbolContainersToOriPos(): void {
        const reelIndices = this._getReelIndexList();
        reelIndices.forEach((idx) => this.resetReelSymbolContainersToOriPos(idx));
    }

    /**
     * 將單軸的所有圖騰位置重置為初始位置
     * @param reelIndex 軸索引
     */
    public resetReelSymbolContainersToOriPos(reelIndex: number): void {
        const symbols = this._getSymbolContainersByReelIndex(reelIndex);
        symbols.forEach((_, symIdx) => this.resetSymbolContainerToOriPos(reelIndex, symIdx));
    }

    /**
     * 將指定位置的單個圖騰重置為初始位置
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     */
    public resetSymbolContainerToOriPos(reelIndex: number, symbolIndex: number): void {
        if (!this._setting) return;
        const oriPos = this._setting.getReelSymbolContainerOriPos(reelIndex, symbolIndex);
        this.setSymbolContainerPos(reelIndex, symbolIndex, oriPos);
    }

    /**
     * 設定特定圖騰的 3D 坐標位置
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @param pos 目標位置
     */
    public setSymbolContainerPos(reelIndex: number, symbolIndex: number, pos: Vec3): void {
        const symbol = this._getReelSymbolContainer(reelIndex, symbolIndex);
        if (symbol) {
            symbol.node.setPosition(pos);
        }
    }

    /**
     * 獲取所有已初始化的軸索引清單
     * @returns 索引陣列
     */
    protected _getReelIndexList(): number[] {
        return Array.from(this._reelSymbolContainersMap.keys());
    }

    /**
     * 獲取指定軸的所有圖騰容器
     * @param reelIndex 軸索引
     * @returns 容器陣列
     */
    protected _getSymbolContainersByReelIndex(reelIndex: number): TSymbolContainer[] {
        const symbols = this._reelSymbolContainersMap.get(reelIndex);
        if (!symbols) console.warn(`[ReelsBase] 軸索引 ${reelIndex} 不存在`);
        return symbols || [];
    }

    /**
     * 獲取指定位置的圖騰容器實例
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @returns 容器實例或 null
     */
    protected _getReelSymbolContainer(
        reelIndex: number,
        symbolIndex: number,
    ): TSymbolContainer | null {
        const symbols = this._getSymbolContainersByReelIndex(reelIndex);
        const symbol = symbols[symbolIndex];
        if (!symbol) console.warn(`[ReelsBase] 軸 ${reelIndex} 的圖騰索引 ${symbolIndex} 不存在`);
        return symbol || null;
    }

    /**
     * 清理轉輪資料與節點結構
     */
    protected clear(): void {
        this._reelSymbolContainersMap.clear();
        if (this._reelRootNode) {
            this._reelRootNode.removeAllChildren();
        }
    }
}
