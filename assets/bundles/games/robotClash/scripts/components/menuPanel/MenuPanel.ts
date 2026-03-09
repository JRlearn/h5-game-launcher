import { _decorator, EditBox } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('MenuPanel')
export class MenuPanel extends BaseUIController {
    private onChangeTextCallback: (value: string) => void;
    private onClickCreateGameBtnCallback: () => void;
    private onClickJoinGameBtnCallback: () => void;
    private onClickSettingBtnCallback: () => void;

    /** 初始化 */
    public init() {
        super.init();
        console.log(this.views);

        this.getNode('MenuPanel/Options/EditBox').on(
            EditBox.EventType.TEXT_CHANGED,
            (data: EditBox) => {
                this.onChangeText(data.string);
            },
        );

        this.bindButtonEvent('MenuPanel/Options/CreateGameBtn', () => {
            this.onClickCreateGameBtn();
        });

        this.bindButtonEvent('MenuPanel/Options/JoinGameBtn', () => {
            this.onClickJoinGameBtn();
        });

        this.bindButtonEvent('MenuPanel/SettingBtn', () => {
            this.onClickSettingBtn();
        });
    }

    public setOnChangeTextCallback(callback: (value: string) => void) {
        this.onChangeTextCallback = callback;
    }

    public setOnClickCreateGameBtnCallback(callback: () => void) {
        this.onClickCreateGameBtnCallback = callback;
    }

    public setOnClickJoinGameBtnCallback(callback: () => void) {
        this.onClickJoinGameBtnCallback = callback;
    }

    public setOnClickSettingBtnCallback(callback: () => void) {
        this.onClickSettingBtnCallback = callback;
    }

    private onClickJoinGameBtn() {
        this.onClickJoinGameBtnCallback?.();
    }

    private onChangeText(value: string) {
        this.onChangeTextCallback?.(value);
    }

    private onClickCreateGameBtn() {
        this.onClickCreateGameBtnCallback?.();
    }

    private onClickSettingBtn() {
        this.onClickSettingBtnCallback?.();
    }
}
