/**
 * SlotModelBase - 共用 老虎機資料模型基底
 * 單一職責：控管基礎的餘額、下注、倍率、FreeSpin 狀態，子專案可擴充。
 */
export abstract class SlotModelBase {
    protected _isSpinning: boolean = false;
    protected _isFreeSpin: boolean = false;
    protected _isTurbo: boolean = false;
    protected _isLowPower: boolean = false;
    protected _freeSpinCount: number = 0;

    protected _balance: number = 10000;
    protected _betAmount: number = 10;
    protected _currentWin: number = 0;
    protected _currentMultiplier: number = 0;

    constructor() {
        this.resetResults();
    }

    public get isSpinning(): boolean { return this._isSpinning; }
    public set isSpinning(v: boolean) { this._isSpinning = v; }

    public get isFreeSpin(): boolean { return this._isFreeSpin; }
    public set isFreeSpin(v: boolean) { this._isFreeSpin = v; }

    public get isTurbo(): boolean { return this._isTurbo; }
    public set isTurbo(v: boolean) { this._isTurbo = v; }

    public get isLowPower(): boolean { return this._isLowPower; }
    public set isLowPower(v: boolean) { this._isLowPower = v; }

    public get freeSpinCount(): number { return this._freeSpinCount; }
    public set freeSpinCount(v: number) { this._freeSpinCount = Math.max(0, v); }

    public get balance(): number { return this._balance; }
    public set balance(v: number) { this._balance = Math.max(0, v); }

    public get betAmount(): number { return this._betAmount; }
    public set betAmount(v: number) { this._betAmount = Math.max(0, v); }

    public get currentWin(): number { return this._currentWin; }
    public set currentWin(v: number) { this._currentWin = Math.max(0, v); }

    public get currentMultiplier(): number { return this._currentMultiplier; }
    public set currentMultiplier(v: number) { this._currentMultiplier = Math.max(0, v); }

    public addFreeSpin(amount: number): void {
        this._freeSpinCount += amount;
    }

    /**
     * 重設結果，準備下一回合
     * @param isFreeSpinRound 是否保留 FS 倍數
     */
    public resetResults(isFreeSpinRound: boolean = false): void {
        this._currentWin = 0;
        this._isSpinning = false;
        if (!isFreeSpinRound) {
            this._currentMultiplier = 0;
        }
    }
}
