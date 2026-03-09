import { _decorator } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('KeyboardPanel')
export class KeyboardPanel extends BaseUIController {
    /** 數字按鈕的回調函數 */
    private onClickNumBtnCallback: (index: number) => void;
    /** 清除按鈕的回調函數 */
    private onClickClearBtnCallback: () => void;
    /** 確認按鈕的回調函數 */
    private onClickConfirmBtnCallback: () => void;
    /** 關閉按鈕的回調函數 */
    private onClickCloseBtnCallback: () => void;

    /** 初始化 */
    public init() {
        super.init();
        for (let i = 0; i <= 9; i++) {
            this.bindButtonEvent(`KeyboardPanel/KeysNode/KeyBtn${i}`, () => {
                this.onClickNumBtn(i);
            });
        }

        this.bindButtonEvent('KeyboardPanel/KeysNode/KeyBtnClear', () => {
            this.onClickClearBtn();
        });

        this.bindButtonEvent('KeyboardPanel/KeysNode/KeyBtnConfirm', () => {
            this.onClickConfirmBtn();
        });

        this.bindButtonEvent('KeyboardPanel/CloseBtn', () => {
            this.onClickCloseBtn();
        });
    }

    /**
     * 設定按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickNumBtnCallback(callback: (index: number) => void) {
        this.onClickNumBtnCallback = callback;
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
     * 設定關閉按鈕的回調函數
     * @param callback 回調函數，無參數
     */
    public setOnClickCloseBtnCallback(callback: () => void) {
        this.onClickCloseBtnCallback = callback;
    }

    /**
     * 數字按鈕點擊事件
     * @param index 按鈕索引值
     */
    private onClickNumBtn(index: number) {
        this.onClickNumBtnCallback?.(index);
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

    /**
     * 關閉按鈕點擊事件
     */
    private onClickCloseBtn() {
        this.onClickCloseBtnCallback?.();
    }
}
