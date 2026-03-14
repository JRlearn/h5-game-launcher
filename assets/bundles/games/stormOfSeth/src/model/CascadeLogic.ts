import { SymbolData } from './SymbolData';
import { ClusterInfo } from './ClusterLogic';

export interface DropInfo {
    symbol: SymbolData;
    fromRow: number;
    toRow: number;
}

export interface CascadeResult {
    /** 這一波被消除的符號 ID 集合 */
    removedIds: number[];
    /** 畫面中原本存在的符號往下掉落的資訊 (colIndex -> DropInfo[]) */
    dropInfos: Map<number, DropInfo[]>;
    /** 從上方新生成的符號資訊 (colIndex -> DropInfo[]) */
    newSymbols: Map<number, DropInfo[]>;
    /** 完成掉落與補齊後的新網格資料 */
    newGrid: SymbolData[][];
}

/**
 * CascadeLogic - 消除掉落系統邏輯
 * 處理 Cluster 消除後的陣列變化、重力掉落，以及新符號的生成。
 */
export class CascadeLogic {
    /**
     * 執行一次完整的消除與掉落運算
     * @param currentGrid 目前的網格 (二維陣列 [col][row], row 越大代表越下方)
     * @param clusters 準備被消除的 Cluster
     * @param idGenerator 取得下一個唯一 Symbol ID 的函數
     * @returns 運算結果 CascadeResult，包含各種動畫所需的座標轉移資訊
     */
    public static applyCascade(
        currentGrid: SymbolData[][],
        clusters: ClusterInfo[],
        idGenerator: () => number,
    ): CascadeResult {
        const cols = currentGrid.length;
        if (cols === 0) throw new Error('Grid is empty');
        const rows = currentGrid[0].length;

        const removedIds = new Set<number>();
        clusters.forEach((c) => c.symbols.forEach((s) => removedIds.add(s.id)));

        // 複製一份 grid 用以操作
        const newGrid: SymbolData[][] = Array.from({ length: cols }, () =>
            Array(rows).fill(null as any),
        );
        const dropInfos = new Map<number, DropInfo[]>();
        const newSymbols = new Map<number, DropInfo[]>();

        for (let col = 0; col < cols; col++) {
            dropInfos.set(col, []);
            newSymbols.set(col, []);

            // 從底部 (row = rows -1) 往上掃描可保留的符號，將其壓實到底部
            let writeRow = rows - 1;
            for (let readRow = rows - 1; readRow >= 0; readRow--) {
                const sym = currentGrid[col][readRow];
                if (!removedIds.has(sym.id)) {
                    newGrid[col][writeRow] = sym;

                    // 如果有發生位移，記錄掉落資訊
                    if (writeRow !== readRow) {
                        dropInfos.get(col)!.push({
                            symbol: sym,
                            fromRow: readRow,
                            toRow: writeRow,
                        });
                    }
                    writeRow--;
                }
            }

            // 剩下的空位 (writeRow >= 0) 需要生成新符號填充
            // 從最底部空位往上填，也就是 writeRow -> 0
            // 從畫面外掉進來，假設 fromRow = 0 - (生成的數量) 以供動畫使用
            let newObjCount = 1;
            for (let emptyRow = writeRow; emptyRow >= 0; emptyRow--) {
                const rand = Math.random();
                let type = Math.floor(Math.random() * 8); // 預設普通
                let multiplier = 0;

                if (rand < 0.05) {
                    type = 8; // Scatter (5% chance)
                } else if (rand < 0.1) {
                    type = 9; // Multiplier (5% chance)
                    // 隨機選一個倍數
                    const mults = [2, 3, 5, 10, 20];
                    multiplier = mults[Math.floor(Math.random() * mults.length)];
                }

                const newSym: SymbolData = {
                    id: idGenerator(),
                    type,
                    multiplier: multiplier > 0 ? multiplier : undefined,
                };
                newGrid[col][emptyRow] = newSym;

                newSymbols.get(col)!.push({
                    symbol: newSym,
                    fromRow: -newObjCount, // 表示在畫面之上
                    toRow: emptyRow,
                });
                newObjCount++;
            }
        }

        return {
            removedIds: Array.from(removedIds),
            dropInfos,
            newSymbols,
            newGrid,
        };
    }
}
