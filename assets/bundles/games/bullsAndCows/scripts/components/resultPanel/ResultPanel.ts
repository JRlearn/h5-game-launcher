import { _decorator } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('ResultPanel')
export class ResultPanel extends BaseUIController {
    private onClickLeaveBtnCallback: () => void;
    private onClickAgainBtnCallback: () => void;

    /** 初始化 */
    public init() {
        super.init();
        this.bindButtonEvent('ResultPanel/BtnsNode/LeaveBtn', () => {
            this.onClickLeaveBtn();
        });

        this.bindButtonEvent('ResultPanel/BtnsNode/AgainBtn', () => {
            this.onClickAgainBtn();
        });
    }

    public setonClickLeaveBtnCallback(callback: () => void) {
        this.onClickLeaveBtnCallback = callback;
    }

    public setonClickAgainBtnCallback(callback: () => void) {
        this.onClickAgainBtnCallback = callback;
    }

    /** 顯示結果面板 */
    public showWin() {
        this.show();
        const winNode = this.getNode('ResultPanel/WinPanel');
        const loseNode = this.getNode('ResultPanel/LosePanel');
        winNode.active = true;
        loseNode.active = false;
    }

    public showLose() {
        this.show();
        const winNode = this.getNode('ResultPanel/WinPanel');
        const loseNode = this.getNode('ResultPanel/LosePanel');
        winNode.active = false;
        loseNode.active = true;
    }

    private onClickLeaveBtn() {
        this.onClickLeaveBtnCallback?.();
    }

    private onClickAgainBtn() {
        this.onClickAgainBtnCallback?.();
    }
}
