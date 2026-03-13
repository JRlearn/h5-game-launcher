import { _decorator, Node, tween, Tween, Vec3 } from 'cc';
import { ReelsBase, IReelsSetting } from './ReelsBase';
import { SymbolContainerBase } from '../symbol/SymbolContainerBase';

const { ccclass } = _decorator;

/**
 * 掉落類型輪軸設定檔介面
 */
export interface IDropReelsSetting extends IReelsSetting {
    /**
     * 獲取輪帶重置位置距離 (垂直方向)
     * @param reelIndex 軸索引
     * @returns 距離數值
     */
    getReelRepeatGap(reelIndex: number): number;
}

/**
 * 掉落類型輪軸基底元件 (Cocos Creator 3.8.8)
 * 負責處理圖騰從上方掉落、定位以及落地反彈的動畫邏輯。
 * @template TSymbolContainer 圖騰容器類別
 * @template TSetting 掉落設定類別
 */
@ccclass('DropReelsBase')
export abstract class DropReelsBase<
    TSymbolContainer extends SymbolContainerBase = SymbolContainerBase,
    TSetting extends IDropReelsSetting = IDropReelsSetting
> extends ReelsBase<TSymbolContainer, TSetting> {

    /**
     * 執行單個圖騰容器的 Y 軸移動動畫
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @param fromY 起始 Y 座標
     * @param toY 目標 Y 座標
     * @param duration 持續時間
     * @param onStart 動畫開始回調
     * @param onComplete 動畫結束回調
     * @returns Tween 實例
     */
    public moveSymbolContainer(
        reelIndex: number,
        symbolIndex: number,
        fromY: number,
        toY: number,
        duration: number = 1,
        onStart?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void,
        onComplete?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void
    ): Tween<Node> {
        const symbol = this._getReelSymbolContainer(reelIndex, symbolIndex);
        if (!symbol) return tween(new Node()).to(0, {});

        const pos = symbol.node.position.clone();
        pos.y = fromY;
        symbol.node.setPosition(pos);

        return tween(symbol.node)
            .call(() => onStart?.(reelIndex, symbolIndex, symbol))
            .to(duration, { position: new Vec3(pos.x, toY, pos.z) })
            .call(() => onComplete?.(reelIndex, symbolIndex, symbol))
            .start();
    }

    /**
     * 播放整軸圖騰掉落的開始動畫
     * @param reelIndex 軸索引
     * @param duration 持續時間
     * @param onStart 單個圖騰開始掉落回調
     * @param onComplete 單個圖騰掉落完成回調
     * @returns Tween 陣列
     */
    public playStartDropReel(
        reelIndex: number,
        duration: number = 1,
        onStart?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void,
        onComplete?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void
    ): Tween<Node>[] {
        const symbols = this._getSymbolContainersByReelIndex(reelIndex);
        return symbols.map((_, symIdx) => this.playStartDropSymbol(reelIndex, symIdx, duration, onStart, onComplete));
    }

    /**
     * 執行單一圖騰自上方掉落至畫面的動畫
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @param duration 持續時間
     * @param onStart 動畫開始回調
     * @param onComplete 動畫結束回調
     * @returns Tween 實例
     */
    public playStartDropSymbol(
        reelIndex: number,
        symbolIndex: number,
        duration: number = 1,
        onStart?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void,
        onComplete?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void
    ): Tween<Node> {
        const fromY = this._setting.getReelSymbolContainerOriPos(reelIndex, symbolIndex).y;
        const toY = fromY + this._setting.getReelRepeatGap(reelIndex);
        return this.moveSymbolContainer(reelIndex, symbolIndex, fromY, toY, duration, onStart, onComplete);
    }

    /**
     * 執行單一圖騰落地時的輕微反彈 (Bounce) 效果
     * @param reelIndex 軸索引
     * @param symbolIndex 圖騰索引
     * @param duration 反彈持續時間
     * @param distance 反彈位移距離
     * @param onStart 動畫開始回調
     * @param onComplete 動畫結束回調
     * @returns Tween 實例
     */
    public playDropEndBounceSymbol(
        reelIndex: number,
        symbolIndex: number,
        duration: number = 0.1,
        distance = 10,
        onStart?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void,
        onComplete?: (reelIndex: number, symbolIndex: number, symbol: TSymbolContainer) => void
    ): Tween<Node> {
        const symbol = this._getReelSymbolContainer(reelIndex, symbolIndex);
        if (!symbol) return tween(new Node()).to(0, {});

        const curPos = symbol.node.position.clone();
        const targetPos = new Vec3(curPos.x, curPos.y - distance, curPos.z);

        return tween(symbol.node)
            .call(() => onStart?.(reelIndex, symbolIndex, symbol))
            .to(duration, { position: targetPos }, { easing: 'quadOut' })
            .to(duration, { position: curPos }, { easing: 'quadIn' })
            .call(() => onComplete?.(reelIndex, symbolIndex, symbol))
            .start();
    }
}
