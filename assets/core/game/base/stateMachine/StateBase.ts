import { IState } from './IState';
/**
 * 狀態共用基底
 * @abstract
 * @class StateBase
 * @implements IState
 * @memberof Common.StateMachine
 */
export abstract class StateBase<M, V, C> implements IState {
    /** model */
    protected model: M;
    /** view */
    protected view: V;
    /** controller */
    protected controller: C;

    /**
     * 建構子
     * @param model - model
     * @param view - view
     * @param controller - controller
     */
    constructor(model: M, view: V, controller: C) {
        this.model = model;
        this.view = view;
        this.controller = controller;
    }

    /**
     * 狀態開始時觸發
     * @param {any} data - 帶入狀態機的資料
     */
    public abstract stateBegin(data: any): void;

    /** 狀態結束時觸發 */
    public abstract stateEnd(): void;
}
