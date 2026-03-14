import { SymbolData } from './SymbolData';

export interface ClusterInfo {
    /** 該 Cluster 的符號類型 */
    type: number;
    /** 組成該 Cluster 的所有符號資料 */
    symbols: SymbolData[];
}

/**
 * ClusterLogic - 消除類核心演算法 (Flood Fill)
 * 負責從 6x5 盤面中找出相鄰大於等於 8 顆的符號群組。
 */
export class ClusterLogic {
    /**
     * 掃描全盤面，找出所有中獎的 Cluster
     * @param grid 2D 陣列 [col][row]
     * @param minSize 最小連接判定數量，預設為 8
     * @returns 中獎群組清單
     */
    public static findWinningClusters(grid: SymbolData[][], minSize: number = 8): ClusterInfo[] {
        const cols = grid.length;
        if (cols === 0) return [];
        const rows = grid[0].length;
        if (rows === 0) return [];

        const visited: boolean[][] = Array.from({ length: cols }, () => Array(rows).fill(false));
        const clusters: ClusterInfo[] = [];

        /**
         * 遞迴向四面擴展相同 type 的符號
         */
        const floodFill = (col: number, row: number, targetType: number): SymbolData[] => {
            if (col < 0 || col >= cols || row < 0 || row >= rows) return [];
            if (visited[col][row]) return [];

            const symbol = grid[col][row];
            if (symbol.type !== targetType) return [];

            visited[col][row] = true;
            const group = [symbol];

            // 檢查 上 下 左 右
            group.push(...floodFill(col, row - 1, targetType));
            group.push(...floodFill(col, row + 1, targetType));
            group.push(...floodFill(col - 1, row, targetType));
            group.push(...floodFill(col + 1, row, targetType));

            return group;
        };

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (!visited[col][row]) {
                    const currentType = grid[col][row].type;

                    // 根據企劃，Scatter(8) 或是 Multiplier(9) 不需要 Cluster 連線
                    // 只有 0~7 符號參與消除判定
                    if (currentType < 8) {
                        const group = floodFill(col, row, currentType);
                        if (group.length >= minSize) {
                            clusters.push({
                                type: currentType,
                                symbols: group,
                            });
                        }
                    } else {
                        // 標記為已造訪避免重複檢查
                        visited[col][row] = true;
                    }
                }
            }
        }

        return clusters;
    }
}
