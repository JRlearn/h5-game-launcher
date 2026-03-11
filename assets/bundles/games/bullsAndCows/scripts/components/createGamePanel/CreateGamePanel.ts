import { _decorator, tween, Vec3 } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('CreateGamePanel')
export class CreateGamePanel extends BaseUIController {
    private isAnimPlaying: boolean = false;
    private onClickCancelBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();
        this.bindButtonEvent('CreateGamePanel/Content/CancelBtn', () => {
            this.onClickCancelBtnCallback?.();
        });
    }

    public setOnClickCancelBtnCallback(callback: () => void) {
        this.onClickCancelBtnCallback = callback;
    }

    /** 彈出效果 */
    public playShowAnim() {
        if (this.isAnimPlaying) return;
        this.isAnimPlaying = true;

        this.node.active = true;
        const contentNode = this.getNode('CreateGamePanel/Content');
        contentNode?.setScale(new Vec3(0, 0, 0));
        tween(contentNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                this.isAnimPlaying = false;
            })
            .start();
    }

    /** 收回效果 */
    public playCloseAnim() {
        if (this.isAnimPlaying) return;
        this.isAnimPlaying = true;

        const contentNode = this.getNode('CreateGamePanel/Content');
        tween(contentNode)
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                this.node.active = false;
                this.isAnimPlaying = false;
            })
            .start();
    }

    public setRoomID(value: string) {
        const label = this.getLabel('CreateGamePanel/Content/RoomID/Label');
        if (label) {
            label.string = value;
        }
    }
}
