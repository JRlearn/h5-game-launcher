import { StateBase } from '../../../../../scripts/framework/stateMachine/StateBase';
import { GameController } from '../controller/GameController';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

export class GuessState extends StateBase<GameModel, GameView, GameController> {
    public override stateBegin(data: any): void {
        console.log('GuessState 開始', data);
        this.view.keyboardPanel.playFadeIn();
        this.view.guessNumberPanel.show();
        this.view.guessNumberPanel.setFrameSelected(this.model.inputIndex); // 設定選中狀態
        this.view.guessNumberPanel.setGuessNumbers(this.model.getInputNumbers());
        this.view.toast.playFadeInAndOut(`點選上方數字框`); // 顯示提示訊息
    }

    public override stateEnd(): void {
        console.log('GuessState 結束'); // 狀態結束時觸發
        this.view.guessNumberPanel.hide(); // 隱藏猜數字面板
        this.view.keyboardPanel.clearAnim();
        this.view.keyboardPanel.hide(); // 隱藏鍵盤面板
    }
}
