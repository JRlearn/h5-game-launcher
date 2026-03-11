import { _decorator } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('ResultPanel')
export class ResultPanel extends BaseUIController {
    private onClickLeaveBtnCallback: () => void = () => {};
    private onClickAgainBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();
        this.bindButtonEvent('ResultPanel/BtnsNode/LeaveBtn', () => {
            this.onClickLeaveBtnCallback?.();
        });
        this.bindButtonEvent('ResultPanel/BtnsNode/AgainBtn', () => {
            this.onClickAgainBtnCallback?.();
        });
    }

    public setonClickLeaveBtnCallback(callback: () => void) {
        this.onClickLeaveBtnCallback = callback;
    }

    public setonClickAgainBtnCallback(callback: () => void) {
        this.onClickAgainBtnCallback = callback;
    }

    /** 顯示勝利結果面板 */
    public showWin() {
        this.show();
        const winNode = this.getNode('ResultPanel/WinPanel');
        if (winNode) {
            winNode.active = true;
        }
        const loseNode = this.getNode('ResultPanel/LosePanel');
        if (loseNode) {
            loseNode.active = false;
        }
    }

    /** 顯示失敗結果面板 */
    public showLose() {
        this.show();
        const winNode = this.getNode('ResultPanel/WinPanel');
        if (winNode) {
            winNode.active = false;
        }
        const loseNode = this.getNode('ResultPanel/LosePanel');
        if (loseNode) {
            loseNode.active = true;
        }
    }
}
