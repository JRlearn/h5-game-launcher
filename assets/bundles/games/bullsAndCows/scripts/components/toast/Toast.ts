import { _decorator, tween, UIOpacity } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';

const { ccclass } = _decorator;

const FADE_DURATION = 0.3;

@ccclass('Toast')
export class Toast extends BaseUIController {
    private opacity!: UIOpacity;
    private isPlaying: boolean = false;

    /** 初始化 */
    public init() {
        super.init();
        this.opacity = this.node.getComponent(UIOpacity)!;
    }

    /** 播放淡入動畫 */
    public playFadeIn(text: string) {
        if (this.isPlaying) return;
        this.isPlaying = true;

        this.setOpacity(0);
        this.setText(text);
        this.node.active = true;

        tween(this.opacity)
            .to(FADE_DURATION, { opacity: 255 }, { easing: 'quadOut' })
            .call(() => {
                this.isPlaying = false;
            })
            .start();
    }

    /** 播放淡出動畫 */
    public playFadeOut() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        tween(this.opacity)
            .to(FADE_DURATION, { opacity: 0 }, { easing: 'quadOut' })
            .call(() => {
                this.node.active = false;
                this.isPlaying = false;
            })
            .start();
    }

    /**
     * 播放淡入後淡出動畫
     * @param text 顯示文字
     * @param duration 停留秒數（預設 0.5s）
     */
    public playFadeInAndOut(text: string, duration: number = 0.5) {
        if (this.isPlaying) return;
        this.isPlaying = true;

        this.setOpacity(0);
        this.setText(text);
        this.node.active = true;

        tween(this.opacity)
            .to(FADE_DURATION, { opacity: 255 }, { easing: 'quadOut' })
            .delay(duration)
            .to(FADE_DURATION, { opacity: 0 }, { easing: 'quadOut' })
            .call(() => {
                this.node.active = false;
                this.isPlaying = false;
            })
            .start();
    }

    /** 設置文本 */
    public setText(text: string) {
        const label = this.getLabel('Toast/Label');
        if (label) {
            label.string = text;
        }
    }

    /** 設置透明度 */
    public setOpacity(opacity: number) {
        this.opacity.opacity = opacity;
    }
}
