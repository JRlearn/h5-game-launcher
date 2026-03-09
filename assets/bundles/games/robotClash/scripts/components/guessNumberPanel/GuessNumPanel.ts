import { _decorator, Label, Node } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
import { HistoryScrollView } from './HistoryScrollView';
import { UIManager } from '../../../../../../scripts/manager/ui/UIManager';
import { Toast } from '../toast/Toast';
const { ccclass } = _decorator;
type HistoryItemData = {
    guess: string; // 玩家猜的數字
    result: string; // 回饋 (例如 1A2B)
};
@ccclass('GuessNumPanel')
export class GuessNumPanel extends BaseUIController {
    private toast: Toast;
    private historyScrollView: HistoryScrollView;
    private numLabels: Label[] = [];
    private frames: Node[] = [];
    private onClickNumBtnCallback: (index: number) => void;
    private onClickLeaveBtnCallback: () => void; // 點擊離開按鈕的回調函數

    /** 初始化 */
    public init() {
        super.init();
        for (let index = 0; index < 4; index++) {
            this.bindButtonEvent(`GuessNumPanel/GuessNumberNode/Item${index}`, () => {
                this.onClickNumBtn(index);
            });

            const label = this.getLabel(`GuessNumPanel/GuessNumberNode/Item${index}/Num`);
            this.numLabels.push(label);

            const frame = this.getNode(`GuessNumPanel/GuessNumberNode/Item${index}/Frame`);
            this.frames.push(frame);
        }

        this.bindButtonEvent('GuessNumPanel/BtnsNode/LeaveBtn', () => {
            this.onClickLeaveBtn(); // 點擊離開按鈕的回調函數
        });

        this.historyScrollView = this.createHistoryScrollView();
        this.toast = this.createToast();
        this.node.addChild(this.toast.node);
    }

    public updateScrollViewData(data: HistoryItemData[]) {
        this.historyScrollView.updateUI(data); // 更新歷史數據
    }

    public addScrollViewItem(data: HistoryItemData) {
        this.historyScrollView.addItem(data); // 更新歷史數據
    }

    public clearScrollerView() {
        this.historyScrollView.clearAll();
    }

    /**
     * 設定按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickNumBtnCallback(callback: (index: number) => void) {
        this.onClickNumBtnCallback = callback;
    }

    /**
     * 設定離開按鈕的回調函數
     * @param callback 回調函數，傳入按鈕的索引值
     */
    public setOnClickLeaveBtnCallback(callback: () => void) {
        this.onClickLeaveBtnCallback = callback;
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

    public showTost(text: string) {
        this.toast.show();
        this.toast.playFadeInAndOut(text);
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
    private onClickNumBtn(index: number) {
        this.onClickNumBtnCallback?.(index);
    }

    private onClickLeaveBtn() {
        this.onClickLeaveBtnCallback?.();
    }

    private createHistoryScrollView() {
        const scrollView = this.getScrollView('GuessNumPanel/HistoryScrollView');
        const historyScrollView = new HistoryScrollView(scrollView);
        return historyScrollView;
    }

    private createToast() {
        const component = UIManager.getInstance().createComponent(Toast);
        component.init();
        component.node.y = 550;
        return component;
    }
}
