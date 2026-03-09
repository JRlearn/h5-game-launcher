import { _decorator, tween, UIOpacity } from 'cc';
import { BaseUIController } from '../../../../../../scripts/framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('Toast')
export class Toast extends BaseUIController {
    private opacity: UIOpacity;
    private isPlaying: boolean = false; // 標記動畫是否正在播放

    /** 初始化 */
    public init() {
        super.init();
        this.opacity = this.node.getComponent(UIOpacity);
    }

    /** 播放淡入動畫 */
    public playFadeIn(text: string) {
        if (this.isPlaying) return; // 如果動畫正在播放，直接返回
        this.isPlaying = true; // 標記動畫正在播放

        this.setOpacity(0);
        this.setText(text);
        this.node.active = true;

        tween(this.opacity)
            .to(0.3, { opacity: 255 }, { easing: 'quadOut' })
            .call(() => {
                this.isPlaying = false; // 動畫結束後重置標記
            })
            .start();
    }

    /** 播放淡出動畫 */
    public playFadeOut() {
        if (this.isPlaying) return; // 如果動畫正在播放，直接返回
        this.isPlaying = true; // 標記動畫正在播放

        tween(this.opacity)
            .to(0.3, { opacity: 0 }, { easing: 'quadOut' })
            .call(() => {
                this.node.active = false;
                this.isPlaying = false; // 動畫結束後重置標記
            })
            .start();
    }

    /** 播放淡入後淡出動畫 */
    public playFadeInAndOut(text: string, duration: number = 0.5) {
        if (this.isPlaying) return; // 如果動畫正在播放，直接返回
        this.isPlaying = true; // 標記動畫正在播放

        this.setOpacity(0);
        this.setText(text);
        this.node.active = true;

        tween(this.opacity)
            .to(0.3, { opacity: 255 }, { easing: 'quadOut' })
            .call(() => {
                // 停留一段時間後執行淡出
                tween(this.opacity)
                    .delay(duration)
                    .to(0.3, { opacity: 0 }, { easing: 'quadOut' })
                    .call(() => {
                        this.node.active = false;
                        this.isPlaying = false; // 動畫結束後重置標記
                    })
                    .start();
            })
            .start();
    }

    /** 設置文本 */
    public setText(text: string) {
        const label = this.getLabel('Toast/Label');
        label.string = text;
    }

    /** 設置透明度 */
    public setOpacity(opacity: number) {
        this.opacity.opacity = opacity;
    }
}
