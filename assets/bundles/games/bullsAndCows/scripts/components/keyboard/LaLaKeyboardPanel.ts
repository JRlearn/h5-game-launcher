import { _decorator, Tween, tween, Vec3 } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

/** 鍵盤進出到畫面下方的 Y 位置 */
const KEYBOARD_HIDDEN_Y = -910;
const KEYBOARD_VISIBLE_Y = -100;

@ccclass('LaLaKeyboardPanel')
export class LaLaKeyboardPanel extends BaseUIController {
    private onClickNumBtnCallback: (index: number) => void = () => {};
    private onClickClearBtnCallback: () => void = () => {};
    private onClickConfirmBtnCallback: () => void = () => {};
    private onClickCloseBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();
        for (let i = 0; i <= 9; i++) {
            this.bindButtonEvent(`LaLaKeyboardPanel/KeysNode/KeyBtn${i}`, () => {
                this.onClickNumBtnCallback?.(i);
            });
        }

        this.bindButtonEvent('LaLaKeyboardPanel/KeysNode/KeyBtnClear', () => {
            this.onClickClearBtnCallback?.();
        });
        this.bindButtonEvent('LaLaKeyboardPanel/KeysNode/KeyBtnConfirm', () => {
            this.onClickConfirmBtnCallback?.();
        });
        this.bindButtonEvent('LaLaKeyboardPanel/CloseBtn', () => {
            this.onClickCloseBtnCallback?.();
        });

        this.node.y = KEYBOARD_VISIBLE_Y;
    }

    public playFadeIn() {
        this.show();
        this.node.setPosition(new Vec3(0, KEYBOARD_HIDDEN_Y, 0));
        tween(this.node)
            .to(0.3, { position: new Vec3(0, KEYBOARD_VISIBLE_Y, 0) }, { easing: 'quadOut' })
            .start();
    }

    public playFadeOut() {
        this.show();
        tween(this.node)
            .to(0.3, { position: new Vec3(0, KEYBOARD_HIDDEN_Y, 0) }, { easing: 'quadIn' })
            .call(() => this.hide())
            .start();
    }

    public clearAnim() {
        Tween.stopAllByTarget(this.node);
    }

    /**
     * 設定數字按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickNumBtnCallback(callback: (index: number) => void) {
        this.onClickNumBtnCallback = callback;
    }

    /** 設定清除按鈕的回調函數 */
    public setOnClearBtnCallback(callback: () => void) {
        this.onClickClearBtnCallback = callback;
    }

    /** 設定確認按鈕的回調函數 */
    public setOnClickConfirmBtnCallback(callback: () => void) {
        this.onClickConfirmBtnCallback = callback;
    }

    /** 設定關閉按鈕的回調函數 */
    public setOnClickCloseBtnCallback(callback: () => void) {
        this.onClickCloseBtnCallback = callback;
    }
}
