import { _decorator, Component, Sprite, SpriteFrame, error } from 'cc';
import { EventManager } from '../../manager/core/EventManager';
import { LanguageManager, LANGUAGE_CHANGED_EVENT } from '../../manager/i18n/LanguageManager';
import { LanguageType } from '../../utils/i18n/LanguageType';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('LocalizedSpriteItem')
class LocalizedSpriteItem {
    @property({ type: String, tooltip: '語系代碼 (例如 zh-TW)' })
    language: string = LanguageType.EN_US;

    @property({ type: SpriteFrame, tooltip: '對應語系的圖片' })
    spriteFrame: SpriteFrame | null = null;
}

@ccclass('LocalizedSprite')
@requireComponent(Sprite)
export class LocalizedSprite extends Component {
    @property({ type: [LocalizedSpriteItem], tooltip: '各語系對應的圖片設定' })
    public spriteFrames: LocalizedSpriteItem[] = [];

    private sprite: Sprite | null = null;

    onLoad() {
        this.sprite = this.getComponent(Sprite);
        if (!this.sprite) {
            error('LocalizedSprite 需要掛載在含有 Sprite 組件的節點上');
            return;
        }

        // 註冊語言切換事件
        EventManager.getInstance().on(LANGUAGE_CHANGED_EVENT, this.updateSprite, this);
    }

    start() {
        // 初始化時強制更新一次
        this.updateSprite();
    }

    onDestroy() {
        EventManager.getInstance().off(LANGUAGE_CHANGED_EVENT, this.updateSprite, this);
    }

    /**
     * 更新圖片內容
     */
    public updateSprite() {
        if (!this.sprite) return;

        let currentLang = LanguageManager.getInstance().getLanguage();
        let targetItem = this.spriteFrames.find((item) => item.language === currentLang);

        if (targetItem && targetItem.spriteFrame) {
            this.sprite.spriteFrame = targetItem.spriteFrame;
        }
    }
}
