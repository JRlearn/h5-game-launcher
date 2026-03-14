import { log } from 'cc';

/**
 * Slot 狀態定義
 */
export enum SlotState {
    IDLE = 'IDLE',
    SPINNING = 'SPINNING',
    CASCADING = 'CASCADING',
    SETTLING = 'SETTLING',
    FREE_SPIN_INTRO = 'FREE_SPIN_INTRO',
    FREE_SPIN_OUTRO = 'FREE_SPIN_OUTRO'
}

/**
 * 抽出的共用 SlotStateMachine
 */
export class SlotStateMachine {
    private _currentState: SlotState = SlotState.IDLE;
    private _onStateChange: (state: SlotState) => void = () => {};

    constructor(onStateChange?: (state: SlotState) => void) {
        if (onStateChange) this._onStateChange = onStateChange;
    }

    public get currentState(): SlotState {
        return this._currentState;
    }

    public transitionTo(newState: SlotState): void {
        if (this._currentState === newState) return;
        
        log(`[SlotStateMachine] Transition: ${this._currentState} -> ${newState}`);
        this._currentState = newState;
        this._onStateChange(newState);
    }

    public canSpin(): boolean {
        return this._currentState === SlotState.IDLE;
    }

    public isBusy(): boolean {
        return this._currentState !== SlotState.IDLE;
    }
}
