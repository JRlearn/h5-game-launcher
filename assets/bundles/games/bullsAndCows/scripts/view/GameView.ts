import { Component, Node } from 'cc';
import { UIManager } from '../../../../../scripts/manager/ui/UIManager';
import { GuessNumPanel } from '../components/guessNumberPanel/GuessNumPanel';
import { MenuPanel } from '../components/menuPanel/MenuPanel';
import { CreateGamePanel } from '../components/createGamePanel/CreateGamePanel';
import { JoinGamePanel } from '../components/joinGamePanel/JoinGamePanel';
import { Toast } from '../components/toast/Toast';
import { SetupGuessPanel } from '../components/setupGuessPanel/SetupGuessPanel';
import { ResultPanel } from '../components/resultPanel/ResultPanel';
import { WaitingMask } from '../components/waitingMask/WaitingMask';
import { LaLaKeyboardPanel } from '../components/keyboard/LaLaKeyboardPanel';
export class GameView {
    protected canvas: Node; // 根節點
    public menuPanel: MenuPanel; // 菜單面板組件
    public createGamePanel: CreateGamePanel; // 創建遊戲面板組件
    public joinGamePanel: JoinGamePanel; // 加入遊戲面板組件
    public guessNumberPanel: GuessNumPanel; // 猜數字面板組件
    public keyboardPanel: LaLaKeyboardPanel; // 鍵盤組件
    public setupGuessPanel: SetupGuessPanel; // 設定猜數字面板組件
    public resultPanel: ResultPanel; // 結算面板組件
    public toast: Toast; // 提示組件
    public waitingMask: WaitingMask; // 提示組件
    constructor(canvas: Node) {
        this.canvas = canvas;
    }

    /** 初始化 */
    public init() {
        this.registerPrefabCtr();
        // 創建猜數字面板組件
        this.guessNumberPanel = this.createGuessNumPanel();
        this.addChild(this.guessNumberPanel); // 將猜數字面板組件添加到根節點

        // 創建鍵盤組件
        this.keyboardPanel = this.createKeyboardPanel();
        this.addChild(this.keyboardPanel);

        this.menuPanel = this.createMenuPanelComponent();
        this.addChild(this.menuPanel); // 將菜單面板組件添加到根節點

        //創建創建遊戲面板
        this.createGamePanel = this.createCreateGamePanelComponent();
        this.addChild(this.createGamePanel); // 將菜單面板組件添加到根節點

        //創建加入遊戲面板
        this.joinGamePanel = this.createJoinGamePanelComponent();
        this.addChild(this.joinGamePanel); // 將菜單面板組件添加到根節點

        //創建設定猜數字面板
        this.setupGuessPanel = this.createSetupGuessPanelComponent();
        this.addChild(this.setupGuessPanel); // 將菜單面板組件添加到根節點

        //創建結算面板
        this.resultPanel = this.createResultPanelComponent();
        this.addChild(this.resultPanel); // 將菜單面板組件添加到根節點

        //創建Toast面板
        this.toast = this.createToastComponent();
        this.addChild(this.toast); // 將菜單面板組件添加到根節點

        this.waitingMask = this.cerateWaitiingMask();
        this.addChild(this.waitingMask);
    }

    private registerPrefabCtr() {
        UIManager.getInstance().registerPrefabCtr(GuessNumPanel, 'GuessNumPanel');
        UIManager.getInstance().registerPrefabCtr(LaLaKeyboardPanel, 'LaLaKeyboardPanel');
        UIManager.getInstance().registerPrefabCtr(MenuPanel, 'MenuPanel');
        UIManager.getInstance().registerPrefabCtr(CreateGamePanel, 'CreateGamePanel');
        UIManager.getInstance().registerPrefabCtr(JoinGamePanel, 'JoinGamePanel');
        UIManager.getInstance().registerPrefabCtr(Toast, 'Toast');
        UIManager.getInstance().registerPrefabCtr(SetupGuessPanel, 'SetupGuessPanel');
        UIManager.getInstance().registerPrefabCtr(ResultPanel, 'ResultPanel');
        UIManager.getInstance().registerPrefabCtr(WaitingMask, 'WaitingMask');
    }

    /** 創建猜數字面板組件 */
    private createGuessNumPanel() {
        const component = UIManager.getInstance().createComponent(GuessNumPanel);
        component.init();
        return component;
    }

    /** 創建鍵盤組件 */
    private createKeyboardPanel() {
        const component = UIManager.getInstance().createComponent(LaLaKeyboardPanel);
        component.init();
        return component;
    }

    /** 創建菜單面板組件 */
    private createMenuPanelComponent() {
        const component = UIManager.getInstance().createComponent(MenuPanel);
        component.init();
        return component;
    }

    private createCreateGamePanelComponent() {
        // 註冊預製體類型與名稱的對應關係
        const component = UIManager.getInstance().createComponent(CreateGamePanel);
        component.init();
        return component;
    }

    private createJoinGamePanelComponent() {
        // 註冊預製體類型與名稱的對應關係
        const component = UIManager.getInstance().createComponent(JoinGamePanel);
        component.init();
        return component;
    }

    private createToastComponent() {
        // 註冊預製體類型與名稱的對應關係
        const component = UIManager.getInstance().createComponent(Toast);
        component.init();
        component.node.y = -140; // 設置位置
        return component;
    }

    private createSetupGuessPanelComponent() {
        // 註冊預製體類型與名稱的對應關係
        const component = UIManager.getInstance().createComponent(SetupGuessPanel);
        component.init();
        return component;
    }

    private createResultPanelComponent() {
        // 註冊預製體類型與名稱的對應關係
        const component = UIManager.getInstance().createComponent(ResultPanel);
        component.init();
        return component;
    }

    private cerateWaitiingMask() {
        // 註冊預製體類型與名稱的對應關係
        const component = UIManager.getInstance().createComponent(WaitingMask);
        component.init();
        return component;
    }

    /**
     * 加組件到canvas
     * @param component 組件
     */
    protected addChild(component: Component) {
        this.canvas.addChild(component.node); // 將節點添加到根節點
    }
}
