import { _decorator, Label, Node } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('SetupGuessPanel')
export class SetupGuessPanel extends BaseUIController {
    private numLabels: Label[] = [];
    private frames: Node[] = [];
    private onClickGuessNumBtnCallback: (index: number) => void;
    private onClickKeyboardNumBtnCallback: (index: number) => void;
    private onClickClearBtnCallback: () => void;
    private onClickConfirmBtnCallback: () => void;

    /** 初始化 */
    public init() {
        super.init();
        for (let index = 0; index < 4; index++) {
            this.bindButtonEvent(`SetupGuessPanel/GuessNumberNode/Item${index}`, () => {
                this.onClickGuessNumBtn(index);
            });

            const label = this.getLabel(`SetupGuessPanel/GuessNumberNode/Item${index}/Num`);
            this.numLabels.push(label);

            const frame = this.getNode(`SetupGuessPanel/GuessNumberNode/Item${index}/Frame`);
            this.frames.push(frame);
        }

        for (let i = 0; i <= 9; i++) {
            this.bindButtonEvent(`SetupGuessPanel/KeyboardPanel/KeysNode/KeyBtn${i}`, () => {
                this.onClickKeyboardNumBtn(i);
            });
        }

        this.bindButtonEvent('SetupGuessPanel/KeyboardPanel/KeysNode/KeyBtnClear', () => {
            this.onClickClearBtn();
        });

        this.bindButtonEvent('SetupGuessPanel/KeyboardPanel/KeysNode/KeyBtnConfirm', () => {
            this.onClickConfirmBtn();
        });
    }

    /**
     * 設定按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickGuessNumBtnCallback(callback: (index: number) => void) {
        this.onClickGuessNumBtnCallback = callback;
    }

    /**
     * 設定鍵盤按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickKeyboardNumBtnCallback(callback: (index: number) => void) {
        this.onClickKeyboardNumBtnCallback = callback;
    }

    /**
     * 設定清除按鈕的回調函數
     * @param callback 回調函數，無參數
     */
    public setOnClearBtnCallback(callback: () => void) {
        this.onClickClearBtnCallback = callback;
    }

    /**
     * 設定確認按鈕的回調函數
     * @param callback 回調函數，無參數
     */
    public setOnClickConfirmBtnCallback(callback: () => void) {
        this.onClickConfirmBtnCallback = callback;
    }

    /**
     * 設定猜的號碼
     * @param nums 猜的號碼
     */
    public setGuessNumbers(nums: string[]) {
        for (let index = 0; index < this.numLabels.length; index++) {
            const value = nums[index] || '';
            this.setGuessNumberByIndex(index, value);
        }
    }

    /**
     * 設定猜的指定索引欄位的值
     * @param index 位置索引
     * @param value 值
     */
    public setGuessNumberByIndex(index: number, value: string) {
        const label = this.numLabels[index];
        label.string = value;
    }

    /**
     * 設定按鈕的顯示狀態(選中開frame或未選中則關閉frame)
     * @param index 按鈕索引值
     */
    public setFrameSelected(index: number) {
        for (let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            frame.active = i == index;
        }
    }

    /**
     * 設定所有Frame的顯示
     * @param isVisible 是否可見
     */
    public setAllFrameVisible(isVisible: boolean) {
        for (let i = 0; i < this.frames.length; i++) {
            this.setFrameVisible(i, isVisible);
        }
    }

    /**
     * 選中狀態的顯示與隱藏
     * @param index 按鈕索引值
     * @param isVisible 是否可見
     */
    public setFrameVisible(index: number, isVisible: boolean) {
        const frame = this.frames[index];
        frame.active = isVisible;
    }

    /**
     * 清空猜的號碼
     */
    public clearGuessNumber() {
        for (let index = 0; index < this.numLabels.length; index++) {
            const label = this.numLabels[index];
            label.string = '';
        }
    }

    /**
     * 按鈕點擊事件
     * @param index 按鈕索引值
     */
    private onClickGuessNumBtn(index: number) {
        this.onClickGuessNumBtnCallback?.(index);
    }

    /**
     * 數字按鈕點擊事件
     * @param index 按鈕索引值
     */
    private onClickKeyboardNumBtn(index: number) {
        this.onClickKeyboardNumBtnCallback?.(index);
    }

    /**
     * 清除按鈕點擊事件
     */
    private onClickClearBtn() {
        this.onClickClearBtnCallback?.();
    }

    /**
     * 確認按鈕點擊事件
     */
    private onClickConfirmBtn() {
        this.onClickConfirmBtnCallback?.();
    }
}
