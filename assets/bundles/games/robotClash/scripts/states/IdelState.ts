import { StateBase } from '../../../../../scripts/framework/stateMachine/StateBase';
import { GameController } from '../controller/GameController';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

export class IdelState extends StateBase<GameModel, GameView, GameController> {
    public override stateBegin(data: any): void {
        console.log('IdleState 開始', data);
        this.model.reset();
        this.view.waitingMask.hide();
        this.view.menuPanel.hide(); // 隱藏菜單面板
        this.view.joinGamePanel.hide(); // 隱藏加入遊戲面板
        this.view.createGamePanel.hide(); // 隱藏創建遊戲面板
        this.view.resultPanel.hide(); // 隱藏結果面板
        this.view.guessNumberPanel.hide(); // 隱藏猜數字面板
        this.view.keyboardPanel.hide(); // 隱藏鍵盤面板
        this.view.setupGuessPanel.hide(); // 隱藏設置猜數字面板
        this.view.menuPanel.show(); // 顯示菜單面板
    }

    public override stateEnd(): void {
        console.log('IdleState 結束');
        this.view.menuPanel.hide(); // 隱藏菜單面板
        this.view.joinGamePanel.hide(); // 隱藏加入遊戲面板
        this.view.createGamePanel.hide(); // 隱藏創建遊戲面板
    }
}
