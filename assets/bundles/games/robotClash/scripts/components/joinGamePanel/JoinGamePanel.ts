import { _decorator, EditBox, tween, Vec3 } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('JoinGamePanel')
export class JoinGamePanel extends BaseUIController {
    private isAnimPlaying: boolean = false;
    private onChangeTextCallback: (value: string) => void;
    private onClickCancelBtnCallback: () => void;
    private onClickConfirmBtnCallback: () => void;

    /** 初始化 */
    public init() {
        super.init();
        this.getNode('JoinGamePanel/Content/RoomID/EditBox').on(
            EditBox.EventType.TEXT_CHANGED,
            (data: EditBox) => {
                this.onChangeText(data.string);
            },
        );

        this.bindButtonEvent('JoinGamePanel/Content/ConfirmBtn', () => {
            this.onClickConfirmBtn();
        });
        this.bindButtonEvent('JoinGamePanel/Content/CancelBtn', () => {
            this.onClickCancelBtn();
        });
    }

    public setOnChangeTextCallbackCallback(callback: (value: string) => void) {
        this.onChangeTextCallback = callback;
    }

    public setOnClickConfirmBtnCallback(callback: () => void) {
        this.onClickConfirmBtnCallback = callback;
    }

    public setOnClickCancelBtnCallback(callback: () => void) {
        this.onClickCancelBtnCallback = callback;
    }

    /** 彈出效果 */
    public playShowAnim() {
        if (this.isAnimPlaying) return;
        this.isAnimPlaying = true;

        this.node.active = true;
        const contentNode = this.getNode('JoinGamePanel/Content');
        contentNode.setScale(new Vec3(0, 0, 0));
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

        const contentNode = this.getNode('JoinGamePanel/Content');
        tween(contentNode)
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                this.node.active = false;
                this.isAnimPlaying = false;
            })
            .start();
    }

    private onChangeText(value: string) {
        this.onChangeTextCallback?.(value);
    }

    private onClickConfirmBtn() {
        this.onClickConfirmBtnCallback?.();
    }

    private onClickCancelBtn() {
        this.onClickCancelBtnCallback?.();
    }
}
