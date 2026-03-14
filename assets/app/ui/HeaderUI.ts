import { _decorator, Node, Color, Widget, Label, Button, EventHandler, log } from 'cc';
import { UIComponentBase } from '../../core/game/base/ui/UIComponentBase';
import { NodeFactory } from '../../core/utils/NodeFactory';
import { OrientationType } from '../../core/systems/screen/OrientationManager';
import { GameManager } from '../../core/game/GameManager';
import { EventBus } from '../../core/systems/event/EventBus';
import { EventName } from '../../core/systems/event/EventName';

const { ccclass } = _decorator;

/**
 * HeaderUI - 全域頁首組件
 * 負責顯示使用者資訊、餘額，以及提供全域退出按鈕。
 */
@ccclass('HeaderUI')
export class HeaderUI extends UIComponentBase {
    private _userLabel!: Label;
    private _balanceLabel!: Label;

    protected createUI(): void {
        const nodeHeight = 80;
        
        // 1. 根節點配置 (置頂)
        const widget = this.getOrAddComponent(this.node, Widget);
        widget.isAlignTop = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = widget.left = widget.right = 0;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        this.getUITransform().setContentSize(1920, nodeHeight);

        // 2. 建立背景 (Glassmorphism 效果)
        const { node: bg } = NodeFactory.createSpriteNode('Background', new Color(15, 20, 35, 210));
        this.node.addChild(bg);
        const bgWidget = bg.addComponent(Widget);
        bgWidget.isAlignTop = bgWidget.isAlignLeft = bgWidget.isAlignRight = bgWidget.isAlignBottom = true;
        bgWidget.top = bgWidget.left = bgWidget.right = bgWidget.bottom = 0;
        
        // 分割線 (底部細線)
        const borderNode = NodeFactory.createSpriteNode('BottomBorder', new Color(0, 210, 255, 100)).node;
        this.node.addChild(borderNode);
        const borderWidget = borderNode.addComponent(Widget);
        borderWidget.isAlignLeft = borderWidget.isAlignRight = borderWidget.isAlignBottom = true;
        borderWidget.left = borderWidget.right = borderWidget.bottom = 0;
        this.getUITransform(borderNode).setContentSize(1920, 2);

        // 3. 使用者 ID (左側 - 青藍色配色)
        const userNode = NodeFactory.createUINode('UserGroup');
        this.node.addChild(userNode);
        const userWidget = userNode.addComponent(Widget);
        userWidget.isAlignLeft = true;
        userWidget.left = 50;
        userWidget.isAlignVerticalCenter = true;

        const { label: userLabel } = NodeFactory.createLabelNode('UserID', 'ID: Guest', 24);
        userLabel.color = new Color(0, 210, 255); // Vibrant Cyan
        userNode.addChild(userLabel.node);
        this._userLabel = userLabel;

        // 4. 餘額顯示 (中間 - 炫美金色與發光感)
        const balanceNode = NodeFactory.createUINode('BalanceGroup');
        this.node.addChild(balanceNode);
        const balWidget = balanceNode.addComponent(Widget);
        balWidget.isAlignHorizontalCenter = true;
        balWidget.isAlignVerticalCenter = true;

        const { label: balLabel } = NodeFactory.createLabelNode('Balance', '$ 0.00', 36);
        balLabel.color = new Color(255, 215, 0); // Gold
        balLabel.isBold = true;
        balLabel.isItalic = true; // 增加動感
        balanceNode.addChild(balLabel.node);
        this._balanceLabel = balLabel;

        // 5. 退出按鈕 (右側 - 圓角風格與鮮豔配色)
        const exitNode = NodeFactory.createUINode('ExitButton');
        this.node.addChild(exitNode);
        this.getUITransform(exitNode).setContentSize(140, 46);
        const exitWidget = exitNode.addComponent(Widget);
        exitWidget.isAlignRight = true;
        exitWidget.right = 40;
        exitWidget.isAlignVerticalCenter = true;

        const { node: btnBg } = NodeFactory.createSpriteNode('BtnBg', new Color(220, 40, 60));
        exitNode.addChild(btnBg);
        this.getUITransform(btnBg).setContentSize(140, 46);
        // FIXME: 圓角通常需要 SpriteFrame，暫時先用尺寸與配色強化視覺感

        const { label: btnLabel } = NodeFactory.createLabelNode('BtnLabel', 'LOBBY', 22);
        btnLabel.node.parent = exitNode;
        btnLabel.isBold = true;

        const button = exitNode.addComponent(Button);
        const eventHandler = new EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = 'HeaderUI';
        eventHandler.handler = 'onExitClick';
        button.clickEvents.push(eventHandler);
        button.transition = Button.Transition.SCALE;
        button.zoomScale = 0.95;

        // 監聽餘額變更
        EventBus.on(EventName.USER_BALANCE_CHANGED, this._onBalanceChanged, this);
        
        // 初始同步
        this._refreshInfo();
    }

    private _onBalanceChanged(balance: number): void {
        this._balanceLabel.string = `$ ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    private _refreshInfo(): void {
        const info = GameManager.getInstance().userInfo;
        this._userLabel.string = `ID: ${info.userId}`;
        this._onBalanceChanged(info.balance);
    }

    /**
     * 按鈕回呼
     */
    public onExitClick(): void {
        log('[HeaderUI] 使用者點擊退出');
        GameManager.getInstance().exitCurrentGame();
    }

    protected override onOrientationChange(orientation: OrientationType): void {
        // Widget 會自動處理適配
    }

    protected onDestroy(): void {
        EventBus.off(EventName.USER_BALANCE_CHANGED, this._onBalanceChanged, this);
    }
}
