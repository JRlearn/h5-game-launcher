/**
 * 狀態機實作介面
 * @interface
 * @memberof Common.StateMachine
 */
export interface IState {
    /**
     * 狀態開始
     * @param {any} data - 資料
     */
    stateBegin(data: any): void;

    /** 狀態結束 */
    stateEnd(): void;
}

/**
 * 狀態機，'SE'為狀態的enum
 * @class StateMachine
 * @memberof Common.StateMachine
 */
export class StateMachine<SE> {
    private stateMap: Map<SE, IState> = new Map<SE, IState>();
    private curGameState: SE;
    private curGameStateBase: IState | undefined;

    /**
     * 設置狀態
     * @param {SE} state - 狀態enum
     * @param {Common.StateMachine.IState} stateBase - 狀態物件
     */
    public setupState(state: SE, stateBase: IState): void {
        this.stateMap.set(state, stateBase);
    }

    /**
     * 取得當前狀態
     * @returns {SE} 當前狀態
     */
    public getCurGameState(): SE {
        return this.curGameState;
    }

    /**
     * 更換狀態，由實作面定義指定資料
     * @param {SE} toState - 目標狀態
     * @param {TData} data - 資料
     */
    public changeState<TData = any>(toState: SE, data?: TData): void {
        let toStateBase = this.getStateBase(toState);
        if (toStateBase == undefined) {
            console.warn('狀態:' + toState, '對應狀態物件為空值');
            return;
        }

        //舊狀態結束
        this.curGameStateBase?.stateEnd();
        //更換為新狀態
        this.curGameState = toState;
        this.curGameStateBase = toStateBase;

        //新狀態開始
        this.curGameStateBase?.stateBegin(data);
    }

    /**
     * 取得當前狀態物件
     * @param {SE} state - 狀態
     * @returns {Common.StateMachine.IState} 狀態物件
     */
    protected getStateBase(state: SE): IState | undefined {
        return this.stateMap.get(state);
    }
}
