import { _decorator, Node, Label, Button, Prefab, Color, instantiate } from 'cc';
import { BaseUIController } from '../../../../../scripts/framework/ui/BaseUIController';
import { GameCategory, ICategoryTab } from '../../model/LobbyModel';

const { ccclass, property } = _decorator;

/**
 * CategoryTabBar - 類別頁籤列表
 *
 * 繼承 BaseUIController，可透過 UIManager.createComponent 動態建立。
 *
 * 使用方式：
 *   bar.onCategoryChange = (category) => { ... };   // Controller 注入
 *   bar.setup(tabs);                                 // Controller 傳入資料
 */
@ccclass('CategoryTabBar')
export class CategoryTabBar extends BaseUIController {
    @property({ type: Prefab, tooltip: '單個頁籤按鈕的 Prefab 模板' })
    public tabButtonPrefab: Prefab = null!;

    @property({ type: Node, tooltip: '按鈕容器節點（建議帶 Horizontal Layout 元件）' })
    public container: Node = null!;

    /** 由 Controller 直接賦值 */
    public onCategoryChange: (category: GameCategory) => void = () => {};

    private tabs: ICategoryTab[] = [];
    private buttonNodes: Node[] = [];
    private currentIndex: number = 0;

    private readonly ACTIVE_COLOR = new Color(255, 255, 255, 255);
    private readonly INACTIVE_COLOR = new Color(160, 160, 180, 160);

    /**
     * 覆寫 BaseUIController.init()
     * CategoryTabBar 是常駐可見面板，不需預設 hidden。
     */
    public override init(): void {
        this.collectViews(this.node);
    }

    /**
     * 從資料動態建立類別頁籤（Controller 呼叫）
     * @param tabs 頁籤定義列表
     */
    public setup(tabs: ICategoryTab[]): void {
        if (!this.tabButtonPrefab || !this.container) {
            console.error('CategoryTabBar: 請在 Editor 綁定 tabButtonPrefab 與 container');
            return;
        }

        this.tabs = tabs;
        this.clearButtons();

        tabs.forEach((tab, index) => {
            const btnNode = instantiate(this.tabButtonPrefab);
            btnNode.name = `Tab_${tab.id}`;
            this.container.addChild(btnNode);
            this.buttonNodes.push(btnNode);

            const label = btnNode.getComponentInChildren(Label);
            if (label) label.string = tab.label;

            const btn = btnNode.getComponent(Button) ?? btnNode.getComponentInChildren(Button);
            if (btn) {
                btn.node.on(Button.EventType.CLICK, () => this.selectTab(index), this);
            } else {
                btnNode.on(Node.EventType.TOUCH_END, () => this.selectTab(index), this);
            }
        });

        this.selectTab(0);
    }

    public selectTab(index: number): void {
        if (index < 0 || index >= this.tabs.length) return;
        this.currentIndex = index;
        this.updateVisuals();
        this.onCategoryChange(this.tabs[index].id);
    }

    private updateVisuals(): void {
        this.buttonNodes.forEach((node, index) => {
            const label = node.getComponentInChildren(Label);
            if (label) {
                label.color = index === this.currentIndex ? this.ACTIVE_COLOR : this.INACTIVE_COLOR;
            }
        });
    }

    private clearButtons(): void {
        this.buttonNodes.forEach((node) => node.destroy());
        this.buttonNodes = [];
    }

    protected onDestroy(): void {
        this.clearButtons();
    }
}
