import { _decorator } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('WaitingMask')
export class WaitingMask extends BaseUIController {
    /** 設置文本 */
    public setText(text: string) {
        const label = this.getLabel('WaitingMask/Notice/Label');
        if (label) {
            label.string = text;
        }
    }
}
