import { _decorator, EditBox } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

@ccclass('MenuPanel')
export class MenuPanel extends BaseUIController {
    private onChangeTextCallback: (value: string) => void = () => {};
    private onClickCreateGameBtnCallback: () => void = () => {};
    private onClickJoinGameBtnCallback: () => void = () => {};
    private onClickSettingBtnCallback: () => void = () => {};

    /** 初始化 */
    public init() {
        super.init();

        this.getNode('MenuPanel/Options/EditBox')?.on(
            EditBox.EventType.TEXT_CHANGED,
            (data: EditBox) => this.onChangeTextCallback?.(data.string),
        );

        this.bindButtonEvent('MenuPanel/Options/CreateGameBtn', () => {
            this.onClickCreateGameBtnCallback?.();
        });
        this.bindButtonEvent('MenuPanel/Options/JoinGameBtn', () => {
            this.onClickJoinGameBtnCallback?.();
        });
        this.bindButtonEvent('MenuPanel/SettingBtn', () => {
            this.onClickSettingBtnCallback?.();
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
}
