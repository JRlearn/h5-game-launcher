/**
 * 狀態機基礎介面
 */
export interface IState {
    /**
     * 狀態開始回調
     * @param data 傳遞給狀態的資料
     */
    stateBegin(data?: any): void;

    /**
     * 狀態結束回調
     */
    stateEnd(): void;
}

/**
 * 通用狀態機類別
 * @template SE 狀態列舉型別
 */
export class StateMachine<SE> {
    /** 狀態映射表 */
    private _stateMap: Map<SE, IState> = new Map<SE, IState>();
    /** 當前狀態列舉值 */
    private _curGameState!: SE;
    /** 當前狀態實例 */
    private _curGameStateBase: IState | undefined;

    /**
     * 設置狀態與對應的處理物件
     * @param state 狀態列舉
     * @param stateBase 實現 IState 的物件
     */
    public setupState(state: SE, stateBase: IState): void {
        this._stateMap.set(state, stateBase);
    }

    /**
     * 獲取當前狀態列舉值
     * @returns 當前狀態
     */
    public getCurGameState(): SE {
        return this._curGameState;
    }

    /**
     * 切換至目標狀態
     * @template TData 資料型別
     * @param toState 目標狀態
     * @param data 傳遞資料
     */
    public changeState<TData>(toState: SE, data?: TData): void {
        let toStateBase = this.getStateBase(toState);
        if (toStateBase == undefined) {
            console.warn(`[StateMachine] 狀態: ${toState} 對應狀態物件為空值`);
            return;
        }

        // 舊狀態結束
        this._curGameStateBase?.stateEnd();

        // 更換為新狀態
        this._curGameState = toState;
        this._curGameStateBase = toStateBase;

        // 新狀態開始
        this._curGameStateBase?.stateBegin(data);
    }

    /**
     * 獲取特定狀態的處理物件
     * @param state 狀態列舉
     * @returns 狀態實例或 undefined
     */
    protected getStateBase(state: SE): IState | undefined {
        return this._stateMap.get(state);
    }
}
