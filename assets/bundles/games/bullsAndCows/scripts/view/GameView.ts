import { Node } from 'cc';
import { ViewBase } from '../../../../../scripts/framework/mvc/view/ViewBase';
import { GuessNumPanel } from '../components/guessNumberPanel/GuessNumPanel';
import { MenuPanel } from '../components/menuPanel/MenuPanel';
import { CreateGamePanel } from '../components/createGamePanel/CreateGamePanel';
import { JoinGamePanel } from '../components/joinGamePanel/JoinGamePanel';
import { Toast } from '../components/toast/Toast';
import { SetupGuessPanel } from '../components/setupGuessPanel/SetupGuessPanel';
import { ResultPanel } from '../components/resultPanel/ResultPanel';
import { WaitingMask } from '../components/waitingMask/WaitingMask';
import { LaLaKeyboardPanel } from '../components/keyboard/LaLaKeyboardPanel';

/**
 * GameView - bullsAndCows 遊戲視圖層
 *
 * 繼承 ViewBase，只負責：
 * 1. 宣告此遊戲所有 UI Panel 的屬性
 * 2. 在 init() 中按順序建立各 Panel（由 Main.ts 在 preload 後呼叫）
 *
 * 通用能力（createComponent / addChild / root / bundleName）
 * 已由 ViewBase 提供。
 */
export class GameView extends ViewBase {
    public menuPanel!: MenuPanel;
    public createGamePanel!: CreateGamePanel;
    public joinGamePanel!: JoinGamePanel;
    public guessNumberPanel!: GuessNumPanel;
    public keyboardPanel!: LaLaKeyboardPanel;
    public setupGuessPanel!: SetupGuessPanel;
    public resultPanel!: ResultPanel;
    public toast!: Toast;
    public waitingMask!: WaitingMask;
    private bundleName = 'games/bullsAndCows';

    public override init(): void {
        this.guessNumberPanel = this.createComponent(
            this.bundleName,
            'GuessNumPanel',
            GuessNumPanel,
        );
        this.guessNumberPanel.init();
        this.addChild(this.guessNumberPanel);

        this.keyboardPanel = this.createComponent(
            this.bundleName,
            'LaLaKeyboardPanel',
            LaLaKeyboardPanel,
        );
        this.keyboardPanel.init();
        this.addChild(this.keyboardPanel);

        this.menuPanel = this.createComponent(this.bundleName, 'MenuPanel', MenuPanel);
        this.menuPanel.init();
        this.addChild(this.menuPanel);

        this.createGamePanel = this.createComponent(
            this.bundleName,
            'CreateGamePanel',
            CreateGamePanel,
        );
        this.createGamePanel.init();
        this.addChild(this.createGamePanel);

        this.joinGamePanel = this.createComponent(this.bundleName, 'JoinGamePanel', JoinGamePanel);
        this.joinGamePanel.init();
        this.addChild(this.joinGamePanel);

        this.setupGuessPanel = this.createComponent(
            this.bundleName,
            'SetupGuessPanel',
            SetupGuessPanel,
        );
        this.setupGuessPanel.init();
        this.addChild(this.setupGuessPanel);

        this.resultPanel = this.createComponent(this.bundleName, 'ResultPanel', ResultPanel);
        this.resultPanel.init();
        this.addChild(this.resultPanel);

        this.toast = this.createComponent(this.bundleName, 'Toast', Toast);
        this.toast.init();
        this.toast.node.y = -140;
        this.addChild(this.toast);

        this.waitingMask = this.createComponent(this.bundleName, 'WaitingMask', WaitingMask);
        this.waitingMask.init();
        this.addChild(this.waitingMask);
    }
}
