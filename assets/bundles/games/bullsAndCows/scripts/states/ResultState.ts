import { StateBase } from '../../../../../scripts/framework/stateMachine/StateBase';
import { GameController } from '../controller/GameController';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

export class ResultState extends StateBase<GameModel, GameView, GameController> {
    public override stateBegin(data: any): void {
        console.log('ResultState 開始', data);
        this.view.waitingMask.hide();
        console.log('this.model.getUid()', this.model.getUid());
        console.log(data.summary);
        this.view.toast.playFadeInAndOut(`遊戲結束`); // 顯示提示訊息
        const user = data.summary.find((u) => u.uid === this.model.getUid());
        console.log(user);
        if (user.winner) {
            this.view.resultPanel.showWin(); // 顯示結果面板
        } else {
            this.view.resultPanel.showLose(); // 顯示結果面板
        }
    }

    public override stateEnd(): void {
        this.view.waitingMask.hide();
        this.view.resultPanel.hide(); // 隱藏結果面板
        this.view.menuPanel.hide(); // 隱藏菜單面板
        this.view.joinGamePanel.hide(); // 隱藏加入遊戲面板
        this.view.createGamePanel.hide(); // 隱藏創建遊戲面板
        this.view.resultPanel.hide(); // 隱藏結果面板
        this.view.guessNumberPanel.hide(); // 隱藏猜數字面板
        this.view.keyboardPanel.hide(); // 隱藏鍵盤面板
        this.view.setupGuessPanel.hide(); // 隱藏設置猜數字面板
    }
}
