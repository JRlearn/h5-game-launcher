import { _decorator, ScrollView, Prefab, Node, instantiate, Label, director, Director } from 'cc';
import { ResManager } from '../../../../../../scripts/manager/resource/ResManager';

export class HistoryScrollView {
    private scrollView: ScrollView = null;

    private historyItemPrefab: Prefab = null;

    private items: Node[] = [];

    constructor(scrollView: ScrollView) {
        this.scrollView = scrollView;
        this.historyItemPrefab = ResManager.getInstance().getPrefab('HistoryItem'); // 獲取預製體
    }

    public updateUI(data: { guess: string; result: string }[]) {
        this.clearAll(); // 清空之前的項目
        data.forEach((item) => {
            this.addItem(item); // 添加新的項目
        });
        this.scheduleScrollToBottom();
    }

    public addItem(data: { guess: string; result: string }) {
        const itemNode = instantiate(this.historyItemPrefab);
        const index = this.items.length; // 獲取當前項目的索引
        itemNode.getChildByPath('RoundLabel').getComponent(Label).string = `#${index + 1}`;
        itemNode.getChildByPath('GuessLabel').getComponent(Label).string = data.guess;
        itemNode.getChildByPath('ResultLabel').getComponent(Label).string = data.result;

        this.scrollView.content.addChild(itemNode);
        this.items.push(itemNode);
        this.scheduleScrollToBottom();
    }

    public clearAll() {
        this.items.forEach((item) => item.destroy());
        this.items.length = 0;
    }

    private scheduleScrollToBottom() {
        director.once(Director.EVENT_AFTER_DRAW, () => {
            this.scrollToBottom();
        });
    }

    private scrollToBottom() {
        this.scrollView.scrollToBottom(0.2);
    }
}
