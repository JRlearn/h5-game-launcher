import { _decorator } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('KeyboardPanel')
export class KeyboardPanel extends BaseUIController {
    private onClickNumBtnCallback: (index: number) => void = () => {};
    private onClickClearBtnCallback: () => void = () => {};
    private onClickConfirmBtnCallback: () => void = () => {};
    private onClickCloseBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();
        for (let i = 0; i <= 9; i++) {
            this.bindButtonEvent(`KeyboardPanel/KeysNode/KeyBtn${i}`, () => {
                this.onClickNumBtnCallback?.(i);
            });
        }

        this.bindButtonEvent('KeyboardPanel/KeysNode/KeyBtnClear', () => {
            this.onClickClearBtnCallback?.();
        });
        this.bindButtonEvent('KeyboardPanel/KeysNode/KeyBtnConfirm', () => {
            this.onClickConfirmBtnCallback?.();
        });
        this.bindButtonEvent('KeyboardPanel/CloseBtn', () => {
            this.onClickCloseBtnCallback?.();
        });
    }

    /**
     * 設定數字按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickNumBtnCallback(callback: (index: number) => void) {
        this.onClickNumBtnCallback = callback;
    }

    /**
     * 設定清除按鈕的回調函數
     */
    public setOnClearBtnCallback(callback: () => void) {
        this.onClickClearBtnCallback = callback;
    }

    /**
     * 設定確認按鈕的回調函數
     */
    public setOnClickConfirmBtnCallback(callback: () => void) {
        this.onClickConfirmBtnCallback = callback;
    }

    /**
     * 設定關閉按鈕的回調函數
     */
    public setOnClickCloseBtnCallback(callback: () => void) {
        this.onClickCloseBtnCallback = callback;
    }
}
