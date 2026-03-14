import { Color, Layout, Widget, Button } from 'cc';
import { ViewBase } from '../../../../../core/game/base/mvc/view/ViewBase';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { GridManager } from '../components/grid/GridManager';

/**
 * SlotView - 消除類 Slot 視圖層
 */
export class GameView extends ViewBase {
    public onSpinClick: () => void = () => {};
    public onBuyFeatureClick: () => void = () => {};

    private _gridManager: GridManager | null = null;

    // UI Labels
    private _balanceLabel: any = null;
    private _winLabel: any = null;
    private _freeSpinLabel: any = null;

    public override init(): void {
        const rootTrans = this.getUITransform();
        rootTrans.setContentSize(720, 1280);

        // 1. 背景
        const { node: bg } = NodeFactory.createSpriteNode('Background', new Color(20, 20, 30, 255));
        this.root.addChild(bg);
        const bgWidget = bg.addComponent(Widget);
        bgWidget.isAlignLeft =
            bgWidget.isAlignRight =
            bgWidget.isAlignTop =
            bgWidget.isAlignBottom =
                true;
        bgWidget.left = bgWidget.right = bgWidget.top = bgWidget.bottom = 0;
        bgWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        // 2. 主容器 (垂直佈局)
        const layout = this.getOrAddComponent(this.root, Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.spacingY = 20;
        layout.paddingTop = 60;

        // 3. 頂部資訊區 (Balance, Win, FS)
        const { node: topPanel } = NodeFactory.createSpriteNode(
            'TopPanel',
            new Color(0, 0, 0, 150),
        );
        this.getUITransform(topPanel).setContentSize(680, 100);
        this.root.addChild(topPanel);

        const topLayout = topPanel.addComponent(Layout);
        topLayout.type = Layout.Type.HORIZONTAL;
        topLayout.spacingX = 30;
        topLayout.resizeMode = Layout.ResizeMode.CONTAINER;

        const { label: balanceLbl } = NodeFactory.createLabelNode(
            'BalanceText',
            'Balance: 10000',
            30,
        );
        this._balanceLabel = balanceLbl;
        topPanel.addChild(balanceLbl.node);

        const { label: winLbl } = NodeFactory.createLabelNode('WinText', 'Win: 0', 30);
        this._winLabel = winLbl;
        topPanel.addChild(winLbl.node);

        const { label: fsLbl } = NodeFactory.createLabelNode('FSText', 'FS: 0', 30);
        this._freeSpinLabel = fsLbl;
        topPanel.addChild(fsLbl.node);

        // 4. 輪盤區域 (Grid Area)
        const { node: gridArea } = NodeFactory.createSpriteNode(
            'GridArea',
            new Color(0, 0, 0, 100),
        );
        this.getUITransform(gridArea).setContentSize(650, 550);
        this.root.addChild(gridArea);

        const { component: gridManager } = NodeFactory.createNodeWithComponent(
            'GridManager_Node',
            GridManager,
            {
                parent: gridArea,
            },
        );
        this._gridManager = gridManager as GridManager;

        // 5. 控制面板區域 (Buttons)
        const { node: controlPanel } = NodeFactory.createSpriteNode(
            'ControlPanel',
            new Color(40, 40, 60, 255),
        );
        this.getUITransform(controlPanel).setContentSize(680, 150);
        this.root.addChild(controlPanel);

        const controlLayout = controlPanel.addComponent(Layout);
        controlLayout.type = Layout.Type.HORIZONTAL;
        controlLayout.spacingX = 50;

        // Spin Button
        const { node: spinBtnNode } = NodeFactory.createSpriteNode(
            'SpinBtn',
            new Color(50, 180, 50),
        );
        this.getUITransform(spinBtnNode).setContentSize(200, 80);
        controlPanel.addChild(spinBtnNode);
        const { label: spinText } = NodeFactory.createLabelNode('Label', 'SPIN', 36);
        spinBtnNode.addChild(spinText.node);
        const spinBtn = spinBtnNode.addComponent(Button);
        spinBtn.node.on(Button.EventType.CLICK, () => this.onSpinClick(), this);

        // Buy Feature Button
        const { node: buyBtnNode } = NodeFactory.createSpriteNode(
            'BuyBtn',
            new Color(180, 50, 180),
        );
        this.getUITransform(buyBtnNode).setContentSize(200, 80);
        controlPanel.addChild(buyBtnNode);
        const { label: buyText } = NodeFactory.createLabelNode('Label', 'BUY FS', 36);
        buyBtnNode.addChild(buyText.node);
        const buyBtn = buyBtnNode.addComponent(Button);
        buyBtn.node.on(Button.EventType.CLICK, () => this.onBuyFeatureClick(), this);
    }

    /**
     * 更新盤面畫面
     * @returns Promise<void>
     */
    public async spinAllReels(): Promise<void> {
        // 因這版是 Cluster，由 Controller 直接呼叫 gridManager.syncGridFromData 傳遞資料
        // 此處保持空實作或回傳 Promise.resolve()
        return Promise.resolve();
    }

    public get gridManager(): GridManager | null {
        return this._gridManager;
    }

    /** UI 更新方法 */
    public updateBalance(val: number): void {
        if (this._balanceLabel) this._balanceLabel.string = `Balance: ${val}`;
    }

    public updateWin(val: number): void {
        if (this._winLabel) this._winLabel.string = `Win: ${val}`;
    }

    public updateFreeSpin(val: number): void {
        if (this._freeSpinLabel) this._freeSpinLabel.string = `FS: ${val}`;
    }
}
