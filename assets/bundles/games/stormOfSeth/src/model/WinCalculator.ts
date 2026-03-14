import { ClusterInfo } from './ClusterLogic';

export interface WinResult {
    totalWin: number;
    clusterWins: {
        cluster: ClusterInfo;
        winAmount: number;
    }[];
}

/**
 * WinCalculator - 贏分計算模組
 * 根據企劃設定的 Cluster Size -> Multiplier 賠率表來計算贏分
 */
export class WinCalculator {
    /**
     * 暫定的賠率表 (依據企劃規格)
     * type 0~4: 低價值符號 (Red, Blue, Green, Purple, Yellow Gem)
     * type 5~7: 高價值符號 (Eye of Horus, Golden Scarab, Seth Weapon)
     */
    private static getPaytableMultiplier(type: number, clusterSize: number): number {
        if (type >= 0 && type <= 4) {
            // Low Value Symbols
            if (clusterSize >= 12) return 25;
            if (clusterSize >= 10) return 10;
            if (clusterSize >= 8) return 5;
            return 0;
        } else if (type >= 5 && type <= 7) {
            // Premium Symbols
            if (clusterSize >= 12) return 100;
            if (clusterSize >= 10) return 50;
            if (clusterSize >= 8) return 20;
            return 0;
        }

        // 超出預期的 type 不給分 (例如 Scatter/Multiplier 不在此處算線分)
        return 0;
    }

    /**
     * 根據當前的下注額，計算本次消除的所有贏分
     * @param clusters 本次消除的 Cluster 列表
     * @param betAmount 當前下注額
     * @param boardMultiplier 目前盤面的累積全域倍數 (若沒有則為 1)
     * @returns 贏分運算結果
     */
    public static calculateWin(
        clusters: ClusterInfo[],
        betAmount: number,
        boardMultiplier: number = 1,
    ): WinResult {
        let totalWin = 0;
        const clusterWins = [];

        for (const cluster of clusters) {
            const size = cluster.symbols.length;
            const mult = this.getPaytableMultiplier(cluster.type, size);

            // 該叢集的基礎贏分 = 下注額 * 賠率倍數
            let clusterWinAmount = betAmount * mult;

            // 如果規格上 倍數乘積是套用在最後總分，此處先不乘 boardMultiplier
            // Demo 暫定各自贏分計算好後，最後結算才掛上全局的 multi?
            // 企劃第 6 點：「Final Win = Base Win × Multiplier」

            clusterWins.push({
                cluster,
                winAmount: clusterWinAmount,
            });

            totalWin += clusterWinAmount;
        }

        return {
            totalWin,
            clusterWins,
        };
    }
}
