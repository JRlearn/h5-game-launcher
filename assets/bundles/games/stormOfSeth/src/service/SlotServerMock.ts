import { SymbolData } from '../model/SymbolData';
import { ClusterLogic } from '../model/ClusterLogic';
import { WinCalculator } from '../model/WinCalculator';
import { CascadeLogic } from '../model/CascadeLogic';
import { FeatureScanner } from '../model/FeatureScanner';

/**
 * SlotServerMock - 模擬後端服務
 * 負責所有機率運算、RNG 生成、以及中獎判定。
 * 實現 Single Responsibility Principle (SRP)，將商業邏輯從 View/Model 抽離。
 */
export class SlotServerMock {
    private static _instance: SlotServerMock | null = null;
    public static getInstance(): SlotServerMock {
        if (!this._instance) this._instance = new SlotServerMock();
        return this._instance;
    }

    private _idCounter: number = 0;

    /**
     * 產生初始隨機盤面
     */
    public generateInitialGrid(cols: number, rows: number): SymbolData[][] {
        const grid: SymbolData[][] = [];
        for (let col = 0; col < cols; col++) {
            const columnData: SymbolData[] = [];
            for (let row = 0; row < rows; row++) {
                columnData.push(this._generateRandomSymbol());
            }
            grid.push(columnData);
        }
        return grid;
    }

    /**
     * 執行一次旋轉請求 (模擬完整後端回傳)
     */
    public requestSpin(cols: number, rows: number, betAmount: number): { 
        initialGrid: SymbolData[][],
        cascades: { grid: SymbolData[][], win: number, clusters: any[] }[],
        totalMultiplier: number,
        scatterCount: number,
        finalTotalWin: number
    } {
        let currentGrid = this.generateInitialGrid(cols, rows);
        const initialGrid = JSON.parse(JSON.stringify(currentGrid));
        const cascades: { grid: SymbolData[][], win: number, clusters: any[] }[] = [];
        
        let hasWin = true;
        let loopCount = 0;
        let baseWinSum = 0;

        while (hasWin && loopCount < 20) {
            loopCount++;
            const clusters = ClusterLogic.findWinningClusters(currentGrid, 8);
            if (clusters.length > 0) {
                const { totalWin } = WinCalculator.calculateWin(clusters, betAmount);
                baseWinSum += totalWin;
                
                // 紀錄當前盤面與中獎
                cascades.push({ 
                    grid: JSON.parse(JSON.stringify(currentGrid)), 
                    win: totalWin, 
                    clusters 
                });

                // 執行掉落 (模擬後端生成)
                const cascadeResult = CascadeLogic.applyCascade(currentGrid, clusters, () => ++this._idCounter);
                currentGrid = cascadeResult.newGrid;
            } else {
                hasWin = false;
            }
        }

        const { totalMultiplier, scatterCount } = FeatureScanner.scanBoard(currentGrid);
        const finalMultiplier = totalMultiplier > 0 ? totalMultiplier : 1;
        const finalTotalWin = baseWinSum * finalMultiplier;

        return {
            initialGrid,
            cascades,
            totalMultiplier,
            scatterCount,
            finalTotalWin
        };
    }

    /**
     * 根據給定盤面計算得分與倍率
     */
    public calculateResults(grid: SymbolData[][], betAmount: number): {
        totalWin: number,
        multiplierSum: number,
        scatterCount: number,
        winningClusters: any[]
    } {
        const clusters = ClusterLogic.findWinningClusters(grid, 8);
        const { totalWin } = WinCalculator.calculateWin(clusters, betAmount);
        
        // 掃描倍數與 Scatter (簡化，實際應由 FeatureScanner 處理或在此整合)
        let multiplierSum = 0;
        let scatterCount = 0;

        grid.forEach(col => col.forEach(symbol => {
            if (symbol.type === 8) scatterCount++;
            if (symbol.type === 9 && symbol.multiplier) multiplierSum += symbol.multiplier;
        }));

        return {
            totalWin,
            multiplierSum,
            scatterCount,
            winningClusters: clusters
        };
    }

    private _generateRandomSymbol(): SymbolData {
        const rand = Math.random();
        let type = Math.floor(Math.random() * 8); // 0-7 普通
        let multiplier = 0;

        if (rand < 0.05) {
            type = 8; // Scatter
        } else if (rand < 0.1) {
            type = 9; // Multiplier
            const mults = [2, 3, 5, 10, 20, 50, 100];
            multiplier = mults[Math.floor(Math.random() * mults.length)];
        }

        return {
            id: ++this._idCounter,
            type,
            multiplier: multiplier > 0 ? multiplier : undefined
        };
    }
}
