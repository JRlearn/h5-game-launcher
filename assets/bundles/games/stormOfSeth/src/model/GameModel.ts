import { SlotModelBase } from '../../../../common/src/slot/mvc/SlotModelBase';
import { SymbolData } from './SymbolData';

/**
 * GameModel - 老虎機資料模型 (戰神賽特 - Cluster Cascade)
 * 繼承自 SlotModelBase，並加入 6x5 網格結構、專案特有邏輯。
 */
export class GameModel extends SlotModelBase {
    /** 網格總行數 (Columns) */
    public readonly COLUMN_COUNT = 6;
    /** 網格總列數 (Rows) */
    public readonly ROW_COUNT = 5;

    /** 網格資料陣列 [column][row] */
    private _grid: SymbolData[][] = [];

    /** 全域累加用的唯一 ID */
    private _symbolIdCounter: number = 0;

    constructor() {
        super();
    }

    public get grid(): SymbolData[][] {
        return this._grid;
    }
    public set grid(v: SymbolData[][]) {
        this._grid = v;
    }

    /**
     * 產生存活期間唯一的圖騰ID
     */
    public getNextSymbolId(): number {
        return ++this._symbolIdCounter;
    }

    /**
     * 覆寫重設方法，加入 Grid 特有的清空
     */
    public override resetResults(isFreeSpinRound: boolean = false): void {
        super.resetResults(isFreeSpinRound);
        this._grid = [];
    }
}
