import { SymbolData } from './SymbolData';

export interface ScanResult {
    /** 這一局被加總的 Multiplier 值 */
    totalMultiplier: number;
    /** 抓取到所有的 Scatter 數量 */
    scatterCount: number;
}

/**
 * FeatureScanner - 負責掃描全盤面的特殊符號 (Scatter = 8, Multiplier = 9)
 * - Multiplier 不需連線，盤面上有就生效
 * - Scatter 不需連線，出現 4 個即觸發 Free Spin
 */
export class FeatureScanner {
    public static scanBoard(grid: SymbolData[][]): ScanResult {
        let totalMultiplier = 0;
        let scatterCount = 0;

        for (let col = 0; col < grid.length; col++) {
            for (let row = 0; row < grid[col].length; row++) {
                const sym = grid[col][row];
                if (sym.type === 8) {
                    scatterCount++;
                } else if (sym.type === 9) {
                    // 若有帶自訂倍率值，否則預設 2x
                    const mult = sym.multiplier || 2;
                    totalMultiplier += mult;
                }
            }
        }

        return {
            totalMultiplier,
            scatterCount,
        };
    }
}
