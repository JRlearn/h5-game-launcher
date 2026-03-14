import { _decorator, Component, Label, error } from 'cc';
import { EventBus } from '../../../../systems/event/EventBus';
import { EventName } from '../../../../systems/event/EventName';
import { LanguageManager } from '../../../../systems/language/LanguageManager';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('LocalizedLabel')
@requireComponent(Label)
export class LocalizedLabel extends Component {
    @property({ tooltip: '多語系翻譯的 Key 值' })
    public i18nKey: string = '';

    private label: Label | null = null;

    onLoad() {
        this.label = this.getComponent(Label);
        if (!this.label) {
            error('LocalizedLabel 需要掛載在含有 Label 組件的節點上');
            return;
        }

        // 註冊語言切換事件
        EventBus.on(EventName.LANGUAGE_CHANGED, this.updateLabel, this);
    }

    start() {
        // 初始化時強制更新一次
        this.updateLabel();
    }

    onDestroy() {
        // 銷毀時取消註冊事件
        EventBus.off(EventName.LANGUAGE_CHANGED, this.updateLabel, this);
    }

    /**
     * 更新文字內容
     */
    public updateLabel() {
        if (!this.label || !this.i18nKey) return;

        let translatedText = LanguageManager.getInstance().t(this.i18nKey);
        this.label.string = translatedText;
    }
}
