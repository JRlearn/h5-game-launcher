/**
 * SlotModel - 老虎機資料模型
 * 負責管理輪盤結構、餘額、下注與開獎結果矩陣。
 */
export class SlotModel {
    /** 輪盤總軸數 (Reel Count) */
    public readonly REEL_COUNT = 5;
    /** 每軸顯示的符號列數 (Row Count) */
    public readonly ROW_COUNT = 3;
    
    /** 是否正處於轉動狀態 */
    private _isSpinning: boolean = false;
    /** 使用者當前餘額 */
    private _balance: number = 10000;
    /** 單次旋轉的下注金額 */
    private _betAmount: number = 10;
    
    /** 輪盤開獎結果矩陣 (reelIndex, symbolIndex)，儲存符號 ID */
    private _reelResults: number[][] = [];

    /**
     * 建構函數，初始化隨機結果
     */
    constructor() {
        this.resetResults();
    }

    /**
     * 是否正在旋轉中
     * @returns 旋轉狀態
     */
    public get isSpinning(): boolean {
        return this._isSpinning;
    }

    /**
     * 設定旋轉狀態
     * @param value 狀態值
     */
    public set isSpinning(value: boolean) {
        this._isSpinning = value;
    }

    /**
     * 獲取當前餘額
     * @returns 餘額數值
     */
    public get balance(): number {
        return this._balance;
    }

    /**
     * 設定餘額
     * @param value 餘額數值
     */
    public set balance(value: number) {
        this._balance = value;
    }

    /**
     * 獲取當前下注額
     * @returns 下注金額
     */
    public get betAmount(): number {
        return this._betAmount;
    }

    /**
     * 設定下注額
     * @param value 下注金額
     */
    public set betAmount(value: number) {
        this._betAmount = value;
    }

    /**
     * 獲取當前輪盤結果矩陣
     * @returns 結果二維陣列
     */
    public get reelResults(): number[][] {
        return this._reelResults;
    }

    /**
     * 重置並隨機生成一套新的輪盤結果矩陣
     */
    public resetResults(): void {
        this._reelResults = [];
        for (let i = 0; i < this.REEL_COUNT; i++) {
            const reel = [];
            for (let j = 0; j < this.ROW_COUNT; j++) {
                reel.push(Math.floor(Math.random() * 8));
            }
            this._reelResults.push(reel);
        }
    }
}
