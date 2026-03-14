export interface SymbolData {
    /** 唯一識別碼，確保每個掉落圖騰在生命週期中可被追蹤 */
    id: number;
    /** 符號類型，例如 0~4為低價值寶石，5~7為高價值符號，8為 Scatter，9為 Multiplier 等 */
    type: number;
    /** 若為 倍數符號 (Multiplier)，其帶有的倍率值 */
    multiplier?: number;
}
