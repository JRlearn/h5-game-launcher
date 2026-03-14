import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';
import { ClusterLogic } from '../model/ClusterLogic';
import { CascadeLogic } from '../model/CascadeLogic';
import { WinCalculator } from '../model/WinCalculator';
import { FeatureScanner } from '../model/FeatureScanner';
import { log } from 'cc';

export class GameController {
    constructor(
        private view: GameView,
        private model: GameModel,
    ) {}

    public init(): void {
        log('[SlotController] 初始化遊戲邏輯 (戰神賽特原型)');
        this._refreshTopUI();
    }

    public async startGame(): Promise<void> {
        log('[SlotController] 遊戲開始');
        this.view.onSpinClick = async () => {
            await this.spin();
        };
        this.view.onBuyFeatureClick = () => {
            this.buyFreeSpinFeature();
        };
    }

    private _refreshTopUI(): void {
        this.view.updateBalance(this.model.balance);
        this.view.updateWin(this.model.currentWin);
        this.view.updateFreeSpin(this.model.freeSpinCount);
    }

    /**
     * 玩家購買 Free Spin 特性
     */
    public buyFreeSpinFeature(): void {
        const cost = this.model.betAmount * 100;
        if (this.model.balance >= cost) {
            log(`[SlotController] 購買 Free Spin! 扣除 ${cost} 餘額`);
            this.model.balance -= cost;
            this.model.addFreeSpin(15);
            this.model.isFreeSpin = true;
            this._refreshTopUI();

            // 可以自動觸發一次轉動，或者等待玩家按 Spin 時進入 Free Spin 邏輯
            log(`[SlotController] 當前剩餘免費旋轉次數: ${this.model.freeSpinCount}`);
        } else {
            log(`[SlotController] 餘額不足 (${this.model.balance})，無法購買 Free Spin (${cost})`);
        }
    }

    public async spin(): Promise<void> {
        if (this.model.isSpinning) return;

        // 若在 Free Spin 模式，檢查是否還有次數
        if (this.model.isFreeSpin && this.model.freeSpinCount > 0) {
            this.model.freeSpinCount--;
            log(`[SlotController] Free Spin 啟動! 剩餘次數: ${this.model.freeSpinCount}`);
        } else {
            log(`[SlotController] 一般旋轉啟動!`);
            this.model.isFreeSpin = false;
            // 扣除下注額
            this.model.balance -= this.model.betAmount;
        }

        log('[SlotController] ================= 開始轉動 =================');
        this._refreshTopUI();

        this.model.isSpinning = true;

        // 1. 重置與生成新盤面
        this.model.resetResults();

        // 2. 同步初始畫面
        if (this.view.gridManager) {
            await this.view.gridManager.syncGridFromData(this.model.grid);
        }

        // 3. 開始連鎖消除檢查
        let loopCount = 0;
        let hasWin = true;
        let roundBaseWin = 0;
        const MAX_CASCADE_LOOP = 20;

        while (hasWin && loopCount < MAX_CASCADE_LOOP) {
            loopCount++;

            // 掃描盤面找出中獎 Cluster
            const clusters = ClusterLogic.findWinningClusters(this.model.grid, 8);

            if (clusters.length > 0) {
                // 結算本波基礎贏分
                const { totalWin, clusterWins } = WinCalculator.calculateWin(
                    clusters,
                    this.model.betAmount,
                );
                roundBaseWin += totalWin;

                log(
                    `[SlotController] --- 第 ${loopCount} 輪連鎖 --- 找到 ${clusters.length} 組中獎, 獲得基礎分 ${totalWin}`,
                );

                // 執行掉落與生成邏輯
                const cascadeResult = CascadeLogic.applyCascade(this.model.grid, clusters, () =>
                    this.model.getNextSymbolId(),
                );

                this.model.grid = cascadeResult.newGrid;

                // 模擬等待動畫，目前直接同步網格
                if (this.view.gridManager) {
                    await this.view.gridManager.syncGridFromData(this.model.grid);
                }
            } else {
                hasWin = false;
            }
        }

        // 4. 結算全域 Multiplier 與 Scatter
        const { totalMultiplier, scatterCount } = FeatureScanner.scanBoard(this.model.grid);
        this.model.currentMultiplier = totalMultiplier;

        log(
            `[SlotController] 盤面特殊符號掃描: Scatter=${scatterCount}, Multiplier倍率合=+${totalMultiplier}x`,
        );

        // 5. 最終贏分結算 = 基礎得分 x (有倍率則乘，無則 * 1)
        const finalMultiplier = this.model.currentMultiplier > 0 ? this.model.currentMultiplier : 1;
        this.model.currentWin = roundBaseWin * finalMultiplier;

        if (this.model.currentWin > 0) {
            this.model.balance += this.model.currentWin;
            log(
                `[SlotController] 本局贏分計算: ${roundBaseWin} x ${finalMultiplier} = ${this.model.currentWin}`,
            );
        }

        // 6. 檢查 Free Spin 觸發（4顆 SCATTER 觸發 15 次 Free Spins）
        if (scatterCount >= 4) {
            log(`[SlotController] 觸發 Free Spin! +15次`);
            this.model.addFreeSpin(15);
            this.model.isFreeSpin = true;
        }

        this.model.isSpinning = false;
        this._refreshTopUI();
        log(
            `[SlotController] ================= 轉動結束, 當前餘額: ${this.model.balance} =================`,
        );
    }

    public cleanup(): void {
        log('[SlotController] 清理資源');
    }
}
