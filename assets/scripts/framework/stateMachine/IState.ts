export interface IState {
    /**
     * 狀態開始時觸發
     * @param {any} data - 帶入狀態機的資料
     */
    stateBegin(data: any): void;

    /** 狀態結束時觸發 */
    stateEnd(): void;
}
