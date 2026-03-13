import { _decorator, Vec3, tween, Tween, Node } from 'cc';
import { SymbolContainerBase } from '../symbol/SymbolContainerBase';
import { IReelsSetting, ReelsBase } from './ReelsBase';

const { ccclass } = _decorator;

/**
 * 滾動類型轉輪設定檔介面
 */
export interface IRollReelsSetting extends IReelsSetting {
    /**
     * 獲取輪帶單次循環的距離
     * @param reelIndex 軸索引
     * @returns 距離數值
     */
    getReelCycleDistance(reelIndex: number): number;
}

/**
 * 滾動類型轉軸元件基底 (Cocos Creator 3.8.8)
 * 擴充基礎轉輪，加入循環滾動、多圈滾動與定位停止邏輯。
 * @template TSymbolContainer 圖騰容器類別
 * @template TSetting 滾動設定類別
 */
@ccclass('RollReelsBase')
export abstract class RollReelsBase<
    TSymbolContainer extends SymbolContainerBase = SymbolContainerBase,
    TSetting extends IRollReelsSetting = IRollReelsSetting
> extends ReelsBase<TSymbolContainer, TSetting> {

    /**
     * 開啟轉輪的無限循環轉動
     * @param reelIndex 軸索引
     * @param speed 轉動速度
     * @param onStart 開始轉動回調
     * @param onLoop 每次循環圖騰重置時的回調
     * @returns Tween 實例
     */
    public playStartLoopReel(
        reelIndex: number,
        speed: number = 30,
        onStart?: () => void,
        onLoop?: (symbolIndex: number) => void
    ): Tween<Node> {
        let isStarted = false;
        return tween(this.node)
            .repeatForever(
                tween()
                    .call(() => {
                        if (!isStarted) {
                            isStarted = true;
                            this.resetReelSymbolContainersToOriPos(reelIndex);
                            onStart?.();
                        }
                        this._rollReelSymbolContainers(reelIndex, speed, true, onLoop);
                    })
            )
            .start();
    }

    /**
     * 播放固定圈數的滾動動畫 (透過 tween 驅動距離)
     * @param reelIndex 軸索引
     * @param duration 持續時間
     * @param cycleTimes 滾動圈數
     * @param onStart 動畫開始回調
     * @param onComplete 動畫結束回調
     * @returns Tween 實例
     */
    public playReelCycle(
        reelIndex: number,
        duration: number = 0.2,
        cycleTimes: number = 1,
        onStart?: () => void,
        onComplete?: () => void
    ): Tween<object> {
        const distancePerCycle = this._setting.getReelCycleDistance(reelIndex);
        const targetDistance = distancePerCycle * cycleTimes;
        
        let lastDist = 0;
        const obj = { dist: 0 };
        
        return tween(obj)
            .to(duration, { dist: targetDistance }, {
                onUpdate: () => {
                    const delta = obj.dist - lastDist;
                    lastDist = obj.dist;
                    this._rollReelSymbolContainers(reelIndex, delta, true);
                }
            })
            .call(() => {
                onStart?.(); 
            })
            .call(() => {
                onComplete?.();
            })
            .start();
    }

    /**
     * 播放定位滾動至最終靜止位置
     * @param reelIndex 軸索引
     * @param duration 持續時間
     * @param onStart 動畫開始回調
     * @param onComplete 動畫結束回調
     * @returns Tween 實例
     */
    public playReelToEndPos(
        reelIndex: number,
        duration: number = 0.2,
        onStart?: () => void,
        onComplete?: () => void
    ): Tween<object> {
        const targetDistance = this._getDistanceFromCurLastSymbolYToEndY(reelIndex);
        let lastDist = 0;
        const obj = { dist: 0 };

        return tween(obj)
            .to(duration, { dist: targetDistance }, {
                onUpdate: () => {
                    const delta = obj.dist - lastDist;
                    lastDist = obj.dist;
                    this._rollReelSymbolContainers(reelIndex, delta, true);
                }
            })
            .call(() => {
                this.resetReelSymbolContainersToOriPos(reelIndex);
                onComplete?.();
            })
            .start();
    }

    /**
     * 計算當前最後一個圖騰 Y 座標與目標終點 Y 座標之間的絕對距離
     * @param reelIndex 軸索引
     * @returns 距離數值
     */
    protected _getDistanceFromCurLastSymbolYToEndY(reelIndex: number): number {
        const symbols = this._getSymbolContainersByReelIndex(reelIndex);
        const lastIdx = symbols.length - 1;
        const lastSymbol = symbols[lastIdx];
        const endY = this._setting.getReelSymbolContainerOriPos(reelIndex, lastIdx).y;
        return Math.abs(endY - lastSymbol.y);
    }

    /**
     * 執行轉軸內圖騰容器的位移計算與回捲邏輯
     * @param reelIndex 軸索引
     * @param distance 本次位移距離
     * @param autoLoop 是否啟用自動循環回捲
     * @param onLoop 圖騰回捲時的回調
     */
    protected _rollReelSymbolContainers(
        reelIndex: number,
        distance: number,
        autoLoop = true,
        onLoop?: (symbolIndex: number) => void
    ): void {
        const symbols = this._getSymbolContainersByReelIndex(reelIndex);
        const distancePerCycle = this._setting.getReelCycleDistance(reelIndex);
        const startY = this._setting.getReelSymbolContainerOriPos(reelIndex, 0).y;
        const loopY = startY + distancePerCycle;

        symbols.forEach((symbol, index) => {
            symbol.y += distance;
            if (autoLoop && symbol.y > loopY) {
                const overDistance = symbol.y - loopY;
                symbol.y = startY + overDistance;
                onLoop?.(index);
            }
        });
    }
}
