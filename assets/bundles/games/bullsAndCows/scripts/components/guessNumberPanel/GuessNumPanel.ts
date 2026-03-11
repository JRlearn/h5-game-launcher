import { _decorator, Label, Node } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
import { HistoryScrollView } from './HistoryScrollView';
import { UIManager } from 'db://assets/scripts/manager/ui/UIManager';
import { Toast } from '../toast/Toast';

const { ccclass } = _decorator;

type HistoryItemData = {
    guess: string; // 玩家猜的數字
    result: string; // 回饋 (例如 1A2B)
};

@ccclass('GuessNumPanel')
export class GuessNumPanel extends BaseUIController {
    private toast!: Toast;
    private historyScrollView: HistoryScrollView | null = null;
    private numLabels: Label[] = [];
    private frames: Node[] = [];
    private onClickNumBtnCallback: (index: number) => void = () => {};
    private onClickLeaveBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();

        for (let index = 0; index < 4; index++) {
            this.bindButtonEvent(`GuessNumPanel/GuessNumberNode/Item${index}`, () => {
                this.onClickNumBtnCallback?.(index);
            });

            const label = this.getLabel(`GuessNumPanel/GuessNumberNode/Item${index}/Num`);
            if (label) this.numLabels.push(label);

            const frame = this.getNode(`GuessNumPanel/GuessNumberNode/Item${index}/Frame`);
            if (frame) this.frames.push(frame);
        }

        this.bindButtonEvent('GuessNumPanel/BtnsNode/LeaveBtn', () => {
            this.onClickLeaveBtnCallback?.();
        });

        this.historyScrollView = this.createHistoryScrollView();
        this.toast = this.createToast();
        this.node.addChild(this.toast.node);
    }

    public updateScrollViewData(data: HistoryItemData[]) {
        this.historyScrollView?.updateUI(data);
    }

    public addScrollViewItem(data: HistoryItemData) {
        this.historyScrollView?.addItem(data);
    }

    public clearScrollerView() {
        this.historyScrollView?.clearAll();
    }

    /**
     * 設定數字按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickNumBtnCallback(callback: (index: number) => void) {
        this.onClickNumBtnCallback = callback;
    }

    /**
     * 設定離開按鈕的回調函數
     */
    public setOnClickLeaveBtnCallback(callback: () => void) {
        this.onClickLeaveBtnCallback = callback;
    }

    /**
     * 設定猜的號碼
     * @param nums 猜的號碼陣列
     */
    public setGuessNumbers(nums: string[]) {
        this.numLabels.forEach((_, index) => this.setGuessNumberByIndex(index, nums[index] ?? ''));
    }

    /**
     * 設定猜的指定索引欄位的值
     * @param index 位置索引
     * @param value 值
     */
    public setGuessNumberByIndex(index: number, value: string) {
        this.numLabels[index].string = value;
    }

    /**
     * 設定按鈕的選中狀態 (選中的顯示 Frame，其餘隱藏)
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
     * 選中狀態的顯示與隱藏
     * @param index 按鈕索引值
     * @param isVisible 是否可見
     */
    public setFrameVisible(index: number, isVisible: boolean) {
        this.frames[index].active = isVisible;
    }

    /**
     * 清空猜的號碼
     */
    public clearGuessNumber() {
        this.numLabels.forEach((label) => (label.string = ''));
    }

    public showToast(text: string) {
        this.toast.show();
        this.toast.playFadeInAndOut(text);
    }

    private createHistoryScrollView(): HistoryScrollView | null {
        const scrollView = this.getScrollView('GuessNumPanel/HistoryScrollView');
        return scrollView ? new HistoryScrollView(scrollView) : null;
    }

    private createToast(): Toast {
        const component = UIManager.getInstance().createComponent('bullsAndCows', 'Toast', Toast);
        component.init();
        component.node.y = 550;
        return component;
    }
}
