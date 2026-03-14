import { SlotModelBase } from './SlotModelBase';
import { ViewBase } from '../../../../../core/game/base/mvc/view/ViewBase';
import { SlotStateMachine, SlotState } from '../stateMachine/SlotStateMachine';
import { log } from 'cc';

/**
 * SlotControllerBase - 共用老虎機控制器基底
 * 負責管控基礎流程與狀態機
 */
export abstract class SlotControllerBase<V extends ViewBase, M extends SlotModelBase> {
    protected _fsm: SlotStateMachine;
    protected _isAutoSpin: boolean = false;

    constructor(
        protected view: V,
        protected model: M,
    ) {
        this._fsm = new SlotStateMachine((state) => this.onStateChanged(state));
    }

    public init(): void {
        log('[SlotControllerBase] 初始化遊戲邏輯');
        this.refreshTopUI();
    }

    /**
     * 子類可覆寫此方法，監聽各個狀態變化
     */
    protected onStateChanged(state: SlotState): void {
        // override by child
    }

    /**
     * 子類必須實作，更新上方/共通UI的資訊
     */
    protected abstract refreshTopUI(): void;

    /**
     * 主要執行啟動遊戲邏輯 (進入遊戲主循環)
     */
    public abstract startGame(): Promise<void>;

    /**
     * 執行一次滾動
     */
    public abstract spin(): Promise<void>;

    public cleanup(): void {
        log('[SlotControllerBase] 清理資源');
    }
}
