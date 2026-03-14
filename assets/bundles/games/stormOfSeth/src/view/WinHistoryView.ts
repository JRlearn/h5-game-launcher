import { _decorator, Node, Label, Color, UITransform, Layout, tween, Vec3 } from 'cc';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { UIComponentBase } from '../../../../../core/game/base/ui/UIComponentBase';
import { OrientationType } from '../../../../../core/systems/screen/OrientationManager';

const { ccclass, property } = _decorator;

/**
 * WinHistoryView - 獲勝歷史紀錄組件
 * (Iteration 24: Refactored to UIComponentBase)
 */
@ccclass('WinHistoryView')
export class WinHistoryView extends UIComponentBase {
    private _history: number[] = [];
    private _listNode: Node | null = null;
    private _isOpen: boolean = false;
    private _rootNode: Node | null = null;

    protected createUI(): void {
        this._buildUI();
    }

    protected onOrientationChange(orientation: OrientationType): void {
        // 根據方向調整顯示位置
    }

    private _buildUI(): void {
        this._rootNode = new Node('HistoryRoot');
        this.node.addChild(this._rootNode);
        const trans = this._rootNode.addComponent(UITransform);
        trans.setAnchorPoint(1, 0.5); // 右邊界對齊
        trans.setContentSize(200, 400);
        this._rootNode.setPosition(100, 0); // 初始隱藏

        const { node: bg } = NodeFactory.createSpriteNode('BG', new Color(0, 0, 0, 150));
        this._rootNode.addChild(bg);
        bg.getComponent(UITransform)!.setContentSize(200, 400);

        const { node: titleNode } = NodeFactory.createLabelNode('Title', 'HISTORY', 24);
        titleNode.setPosition(0, 170);
        this._rootNode.addChild(titleNode);

        this._listNode = new Node('List');
        this._rootNode.addChild(this._listNode);
        const listTrans = this._listNode.addComponent(UITransform);
        listTrans.setContentSize(180, 300);
        const layout = this._listNode.addComponent(Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.spacingY = 10;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;

        // Toggle Button
        const toggleBtnNode = new Node('ToggleBtn');
        this.node.addChild(toggleBtnNode);
        toggleBtnNode.setPosition(0, 0);
        const btnTrans = toggleBtnNode.addComponent(UITransform);
        btnTrans.setContentSize(40, 80);
        const { node: btnBg } = NodeFactory.createSpriteNode('BtnBg', new Color(50, 50, 50));
        toggleBtnNode.addChild(btnBg);
        btnBg.getComponent(UITransform)!.setContentSize(40, 80);

        const { node: btnText } = NodeFactory.createLabelNode('Text', '<', 20);
        toggleBtnNode.addChild(btnText);

        toggleBtnNode.on(Node.EventType.TOUCH_END, () => this.toggle());
    }

    public addRecord(amount: number): void {
        if (amount <= 0) return;
        this._history.unshift(amount);
        if (this._history.length > 5) this._history.pop();
        this._refreshList();
    }

    private _refreshList(): void {
        if (!this._listNode) return;
        this._listNode.removeAllChildren();
        this._history.forEach((amt, i) => {
            const { label } = NodeFactory.createLabelNode(`Item_${i}`, amt.toLocaleString(), 20);
            label.color = Color.YELLOW;
            this._listNode!.addChild(label.node);
        });
    }

    public toggle(): void {
        if (!this._rootNode) return;
        this._isOpen = !this._isOpen;
        const targetX = this._isOpen ? -100 : 100;
        tween(this._rootNode as Node)
            .to(0.3, { position: new Vec3(targetX, 0, 0) }, { easing: 'cubicOut' })
            .start();

        const btnLabel = this.node.getChildByName('ToggleBtn')?.getComponentInChildren(Label);
        if (btnLabel) btnLabel.string = this._isOpen ? '>' : '<';
    }
}
