import { StateBase } from '../../../../../core/game/base/stateMachine/StateBase';
import { GameController } from '../controller/GameController';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';

export class IdelState extends StateBase<GameModel, GameView, GameController> {
    public override stateBegin(data: any): void {
        console.log('IdleState 開始', data);
    }

    public override stateEnd(): void {}
}
