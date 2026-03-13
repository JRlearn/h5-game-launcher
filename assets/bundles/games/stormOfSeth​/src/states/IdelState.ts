import { StateBase } from 'db://assets/scripts/core/base/stateMachine/StateBase';
import { SlotController } from '../controller/SlotController';
import { SlotModel } from '../model/SlotModel';
import { SlotView } from '../view/SlotView';

export class IdelState extends StateBase<SlotModel, SlotView, SlotController> {
    public override stateBegin(data: any): void {
        console.log('IdleState 開始', data);
    }

    public override stateEnd(): void {}
}
