import { _decorator, Label, Node } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('SetupGuessPanel')
export class SetupGuessPanel extends BaseUIController {
    private numLabels: Label[] = [];
    private frames: Node[] = [];
    private onClickGuessNumBtnCallback: (index: number) => void = () => {};
    private onClickKeyboardNumBtnCallback: (index: number) => void = () => {};
    private onClickClearBtnCallback: () => void = () => {};
    private onClickConfirmBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();

        for (let index = 0; index < 4; index++) {
            this.bindButtonEvent(`SetupGuessPanel/GuessNumberNode/Item${index}`, () => {
                this.onClickGuessNumBtnCallback?.(index);
            });

            const label = this.getLabel(`SetupGuessPanel/GuessNumberNode/Item${index}/Num`);
            if (label) this.numLabels.push(label);

            const frame = this.getNode(`SetupGuessPanel/GuessNumberNode/Item${index}/Frame`);
            if (frame) this.frames.push(frame);
        }

        for (let i = 0; i <= 9; i++) {
            this.bindButtonEvent(`SetupGuessPanel/KeyboardPanel/KeysNode/KeyBtn${i}`, () => {
                this.onClickKeyboardNumBtnCallback?.(i);
            });
        }

        this.bindButtonEvent('SetupGuessPanel/KeyboardPanel/KeysNode/KeyBtnClear', () => {
            this.onClickClearBtnCallback?.();
        });
        this.bindButtonEvent('SetupGuessPanel/KeyboardPanel/KeysNode/KeyBtnConfirm', () => {
            this.onClickConfirmBtnCallback?.();
        });
    }

    /**
     * 設定數字格子按鈕的回調函數
     * @param callback 傳入按鈕的索引值
     */
    public setOnClickGuessNumBtnCallback(callback: (index: number) => void) {
        this.onClickGuessNumBtnCallback = callback;
    }

    /**
     * 設定鍵盤按鈕的回調函數
     * @param callback 傳入按鈕的索引值
     */
    public setOnClickKeyboardNumBtnCallback(callback: (index: number) => void) {
        this.onClickKeyboardNumBtnCallback = callback;
    }

    /** 設定清除按鈕的回調函數 */
    public setOnClearBtnCallback(callback: () => void) {
        this.onClickClearBtnCallback = callback;
    }

    /** 設定確認按鈕的回調函數 */
    public setOnClickConfirmBtnCallback(callback: () => void) {
        this.onClickConfirmBtnCallback = callback;
    }

    /**
     * 設定猜的號碼（全部欄位）
     * @param nums 猜的號碼陣列
     */
    public setGuessNumbers(nums: string[]) {
        this.numLabels.forEach((_, index) => this.setGuessNumberByIndex(index, nums[index] ?? ''));
    }

    /**
     * 設定指定索引欄位的值
     * @param index 位置索引
     * @param value 值
     */
    public setGuessNumberByIndex(index: number, value: string) {
        this.numLabels[index].string = value;
    }

    /**
     * 設定按鈕的選中狀態（選中顯示 Frame，其餘隱藏）
     * @param index 按鈕索引值
     */
    public setFrameSelected(index: number) {
        this.frames.forEach((frame, i) => (frame.active = i === index));
    }

    /**
     * 設定所有 Frame 的顯示狀態
     * @param isVisible 是否可見
     */
    public setAllFrameVisible(isVisible: boolean) {
        this.frames.forEach((frame) => (frame.active = isVisible));
    }

    /**
     * 指定索引 Frame 的顯示與隱藏
     * @param index 按鈕索引值
     * @param isVisible 是否可見
     */
    public setFrameVisible(index: number, isVisible: boolean) {
        this.frames[index].active = isVisible;
    }

    /** 清空所有猜的號碼 */
    public clearGuessNumber() {
        this.numLabels.forEach((label) => (label.string = ''));
    }
}
