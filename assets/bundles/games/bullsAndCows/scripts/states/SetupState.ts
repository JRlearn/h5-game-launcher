import { StateBase } from '../../../../../scripts/framework/stateMachine/StateBase';
import { GameController } from '../controller/GameController';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

export class SetupState extends StateBase<GameModel, GameView, GameController> {
    public override stateBegin(data: any): void {
        console.log('SetupState 開始', data);
        this.model.reset();
        this.view.guessNumberPanel.clearScrollerView();
        this.view.guessNumberPanel.setGuessNumbers(this.model.getInputNumbers());
        this.view.guessNumberPanel.setFrameSelected(this.model.inputIndex);

        this.view.setupGuessPanel.setGuessNumbers(this.model.getSetupGuessNums());
        this.view.setupGuessPanel.setFrameSelected(this.model.setupNumIndex);
        this.view.setupGuessPanel.show(); // 顯示設置猜數字面板
        this.view.toast.playFadeInAndOut(`遊戲開始`); // 顯示提示訊息
    }

    public override stateEnd(): void {
        this.view.waitingMask.hide();
        this.view.setupGuessPanel.hide(); // 顯示設置猜數字面板
    }
}
