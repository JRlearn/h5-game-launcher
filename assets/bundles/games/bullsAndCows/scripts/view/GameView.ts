import { Component, Node } from 'cc';
import { UIManager } from '../../../../../scripts/manager/ui/UIManager';
import { BaseUIController } from '../../../../../scripts/framework/ui/BaseUIController';
import { GuessNumPanel } from '../components/guessNumberPanel/GuessNumPanel';
import { MenuPanel } from '../components/menuPanel/MenuPanel';
import { CreateGamePanel } from '../components/createGamePanel/CreateGamePanel';
import { JoinGamePanel } from '../components/joinGamePanel/JoinGamePanel';
import { Toast } from '../components/toast/Toast';
import { SetupGuessPanel } from '../components/setupGuessPanel/SetupGuessPanel';
import { ResultPanel } from '../components/resultPanel/ResultPanel';
import { WaitingMask } from '../components/waitingMask/WaitingMask';
import { LaLaKeyboardPanel } from '../components/keyboard/LaLaKeyboardPanel';

/** 這個遊戲 Bundle 名稱（供 createComponent 使用） */
const BUNDLE_NAME = 'games/bullsAndCows';

/**
 * GameView - 純 View 層
 *
 * 職責：建立並持有所有 UI 組件。
 * 資源預載（loadPrefabsAsync）已移至 Main.ts 的 initAsync() 流程，
 * 確保在 init() 被呼叫前所有 Prefab 已存在快取中。
 */
export class GameView {
    protected root: Node;
    public menuPanel!: MenuPanel;
    public createGamePanel!: CreateGamePanel;
    public joinGamePanel!: JoinGamePanel;
    public guessNumberPanel!: GuessNumPanel;
    public keyboardPanel!: LaLaKeyboardPanel;
    public setupGuessPanel!: SetupGuessPanel;
    public resultPanel!: ResultPanel;
    public toast!: Toast;
    public waitingMask!: WaitingMask;

    constructor(root: Node) {
        this.root = root;
    }

    /** 初始化（同步，need Prefabs already in cache） */
    public init() {
        this.guessNumberPanel = this.createComponent('GuessNumPanel', GuessNumPanel);
        this.guessNumberPanel.init();
        this.addChild(this.guessNumberPanel);

        this.keyboardPanel = this.createComponent('LaLaKeyboardPanel', LaLaKeyboardPanel);
        this.keyboardPanel.init();
        this.addChild(this.keyboardPanel);

        this.menuPanel = this.createComponent('MenuPanel', MenuPanel);
        this.menuPanel.init();
        this.addChild(this.menuPanel);

        this.createGamePanel = this.createComponent('CreateGamePanel', CreateGamePanel);
        this.createGamePanel.init();
        this.addChild(this.createGamePanel);

        this.joinGamePanel = this.createComponent('JoinGamePanel', JoinGamePanel);
        this.joinGamePanel.init();
        this.addChild(this.joinGamePanel);

        this.setupGuessPanel = this.createComponent('SetupGuessPanel', SetupGuessPanel);
        this.setupGuessPanel.init();
        this.addChild(this.setupGuessPanel);

        this.resultPanel = this.createComponent('ResultPanel', ResultPanel);
        this.resultPanel.init();
        this.addChild(this.resultPanel);

        this.toast = this.createComponent('Toast', Toast);
        this.toast.init();
        this.toast.node.y = -140;
        this.addChild(this.toast);

        this.waitingMask = this.createComponent('WaitingMask', WaitingMask);
        this.waitingMask.init();
        this.addChild(this.waitingMask);
    }

    private createComponent<T extends BaseUIController>(
        prefabName: string,
        ComponentClass: new () => T,
    ): T {
        return UIManager.getInstance().createComponent(BUNDLE_NAME, prefabName, ComponentClass);
    }

    protected addChild(component: Component) {
        this.root.addChild(component.node);
    }
}
