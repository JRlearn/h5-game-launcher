import { SymbolData } from './SymbolData';

/**
 * GameModel - 老虎機資料模型 (戰神賽特 - Cluster Cascade)
 * 負責管理 6x5 網格結構、餘額、下注、倍率、Free Spin 狀態。
 */
export class GameModel {
    /** 網格總行數 (Columns) */
    public readonly COLUMN_COUNT = 6;
    /** 網格總列數 (Rows) */
    public readonly ROW_COUNT = 5;

    /** 是否正處於轉動狀態 */
    private _isSpinning: boolean = false;
    /** 是否正在 Free Spin 模式中 */
    private _isFreeSpin: boolean = false;
    /** 剩餘的 Free Spin 次數 */
    private _freeSpinCount: number = 0;

    /** 使用者當前餘額 */
    private _balance: number = 10000;
    /** 單次旋轉的下注金額 */
    private _betAmount: number = 10;
    /** 當局累積的贏分 */
    private _currentWin: number = 0;
    /** 累積的盤面翻倍倍率 (Multiplier) */
    private _currentMultiplier: number = 0;

    /** 網格資料陣列 [column][row] (0,0 在左上角或底下均可，根據實作決定) */
    private _grid: SymbolData[][] = [];

    /** 全域累加用的唯一 ID，確保每個產生出的符號都有唯一識別 */
    private _symbolIdCounter: number = 0;

    /**
     * 建構函數，初始化基礎資料
     */
    constructor() {
        this.resetResults();
    }

    public get isSpinning(): boolean {
        return this._isSpinning;
    }
    public set isSpinning(value: boolean) {
        this._isSpinning = value;
    }

    public get isFreeSpin(): boolean {
        return this._isFreeSpin;
    }
    public set isFreeSpin(value: boolean) {
        this._isFreeSpin = value;
    }

    public get freeSpinCount(): number {
        return this._freeSpinCount;
    }
    public set freeSpinCount(value: boolean | number) {
        if (typeof value === 'boolean') {
            // to ignore TS warnings backwards compatibility if needed
            this._freeSpinCount = value ? 1 : 0;
        } else {
            this._freeSpinCount = value;
        }
    }
    public addFreeSpin(amount: number) {
        this._freeSpinCount += amount;
    }

    public get balance(): number {
        return this._balance;
    }
    public set balance(value: number) {
        this._balance = value;
    }

    public get betAmount(): number {
        return this._betAmount;
    }
    public set betAmount(value: number) {
        this._betAmount = value;
    }

    public get currentWin(): number {
        return this._currentWin;
    }
    public set currentWin(value: number) {
        this._currentWin = value;
    }

    public get currentMultiplier(): number {
        return this._currentMultiplier;
    }
    public set currentMultiplier(value: number) {
        this._currentMultiplier = value;
    }

    /**
     * 獲取當前網格資料陣列
     * @returns 網格二維陣列 (SymbolData)
     */
    public get grid(): SymbolData[][] {
        return this._grid;
    }

    /**
     * 更新網格的二維狀態 (例如掉落後)
     * @param grid 新的網格二維陣列
     */
    public set grid(grid: SymbolData[][]) {
        this._grid = grid;
    }

    /**
     * 獲取下一個唯一的 Symbol ID
     */
    public getNextSymbolId(): number {
        return ++this._symbolIdCounter;
    }

    /**
     * 初始化/重置網格至空白或滿盤隨機的初始狀態
     */
    public resetResults(): void {
        this._grid = [];
        this._currentWin = 0;
        this._currentMultiplier = 0;

        for (let col = 0; col < this.COLUMN_COUNT; col++) {
            const columnData: SymbolData[] = [];
            for (let row = 0; row < this.ROW_COUNT; row++) {
                const rand = Math.random();
                let type = Math.floor(Math.random() * 8); // 預設普通
                let multiplier = 0;

                if (rand < 0.05) {
                    type = 8;
                } else if (rand < 0.1) {
                    type = 9;
                    const mults = [2, 3, 5, 10, 20];
                    multiplier = mults[Math.floor(Math.random() * mults.length)];
                }

                columnData.push({
                    id: this.getNextSymbolId(),
                    type,
                    multiplier: multiplier > 0 ? multiplier : undefined,
                });
            }
            this._grid.push(columnData);
        }
    }
}
