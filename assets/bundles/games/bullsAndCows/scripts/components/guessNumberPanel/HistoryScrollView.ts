import { ScrollView, Prefab, Node, instantiate, Label, director, Director } from 'cc';
import { ResManager } from 'db://assets/scripts/manager/resource/ResManager';

type HistoryItemData = { guess: string; result: string };

export class HistoryScrollView {
    private scrollView: ScrollView;
    private historyItemPrefab: Prefab | null;
    private items: Node[] = [];

    constructor(scrollView: ScrollView) {
        this.scrollView = scrollView;
        this.historyItemPrefab = ResManager.getInstance().getPrefab('HistoryItem');
    }

    public updateUI(data: HistoryItemData[]): void {
        this.clearAll();
        data.forEach((item) => this.addItem(item));
        this.scheduleScrollToBottom();
    }

    public addItem(data: HistoryItemData): void {
        if (!this.historyItemPrefab) return;

        const itemNode = instantiate(this.historyItemPrefab);
        const index = this.items.length;

        itemNode.getChildByPath('RoundLabel')?.getComponent(Label)?.string != null &&
            (itemNode.getChildByPath('RoundLabel')!.getComponent(Label)!.string = `#${index + 1}`);
        itemNode.getChildByPath('GuessLabel')?.getComponent(Label) &&
            (itemNode.getChildByPath('GuessLabel')!.getComponent(Label)!.string = data.guess);
        itemNode.getChildByPath('ResultLabel')?.getComponent(Label) &&
            (itemNode.getChildByPath('ResultLabel')!.getComponent(Label)!.string = data.result);

        this.scrollView.content?.addChild(itemNode);
        this.items.push(itemNode);
        this.scheduleScrollToBottom();
    }

    public clearAll(): void {
        this.items.forEach((item) => item.destroy());
        this.items.length = 0;
    }

    private scheduleScrollToBottom(): void {
        director.once(Director.EVENT_AFTER_DRAW, () => this.scrollView.scrollToBottom(0.2));
    }
}
