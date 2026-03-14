import {
    _decorator,
    Component,
    Node,
    Sprite,
    UIOpacity,
    tween,
    Tween,
    UITransform,
    v3,
    Label,
} from 'cc';

const { ccclass, property } = _decorator;

/**
 * LoadingOverlay - 遊戲內 Loading 遮罩控制器
 *
 * 功能：
 * 1. 進入場景/大廳前立即顯示（遮住空白畫面）
 * 2. 模糊背景圖（使用 CSS filter via DOM 或低解析度佔位圖）
 * 3. 當資源載入完成後，播放淡出動畫移除自身
 *
 * 使用方式（由 SceneManager 呼叫）：
 *   LoadingOverlay.getInstance().show('進入遊戲中...');
 *   // ...資源載入完成...
 *   LoadingOverlay.getInstance().hide();
 */
@ccclass('LoadingOverlay')
export class LoadingOverlay extends Component {
    private static instance: LoadingOverlay | null = null;

    @property({ type: Node, tooltip: '模糊背景節點 (帶有 Sprite 元件)' })
    public blurBg: Node = null!;

    @property({ type: Node, tooltip: '清晰背景節點 (加載完畢後顯示)' })
    public sharpBg: Node = null!;

    @property({ type: Node, tooltip: '旋轉 Spinner 節點' })
    public spinner: Node = null!;

    @property({ type: Label, tooltip: '載入提示文字 Label' })
    public hintLabel: Label = null!;

    @property({ type: Sprite, tooltip: '進度條填充 Sprite' })
    public progressFill: Sprite = null!;

    private opacity!: UIOpacity;
    private spinnerTween: Tween<Node> | null = null;
    private isVisible: boolean = false;

    protected onLoad(): void {
        LoadingOverlay.instance = this;
        this.opacity = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
        this.node.active = false;
    }

    public static getInstance(): LoadingOverlay | null {
        return LoadingOverlay.instance;
    }

    /**
     * 顯示 Loading 遮罩
     * - 立即顯示模糊佔位背景
     * - 播放 Spinner & 提示文字
     * @param hint 載入提示文字
     */
    public show(hint: string = '載入中...'): void {
        if (this.isVisible) return;
        this.isVisible = true;

        this.node.active = true;
        this.opacity.opacity = 255;

        // 模糊圖先顯示 → 清晰圖先隱藏
        if (this.blurBg) this.blurBg.active = true;
        if (this.sharpBg) this.sharpBg.active = false;

        if (this.hintLabel) this.hintLabel.string = hint;

        this.startSpinner();
    }

    /**
     * 切換到清晰背景圖（資源已載入完成時呼叫）
     * 播放模糊→清晰的 cross-fade 效果
     * @param finalHint 切換後顯示的文字
     */
    public revealSharp(finalHint: string = '即將進入...'): Promise<void> {
        return new Promise((resolve) => {
            if (!this.sharpBg || !this.blurBg) {
                resolve();
                return;
            }

            if (this.hintLabel) this.hintLabel.string = finalHint;

            // 清晰圖從透明淡入
            this.sharpBg.active = true;
            const sharpOpacity =
                this.sharpBg.getComponent(UIOpacity) ?? this.sharpBg.addComponent(UIOpacity);
            sharpOpacity.opacity = 0;

            tween(sharpOpacity)
                .to(0.35, { opacity: 255 }, { easing: 'quadOut' })
                .call(() => {
                    if (this.blurBg) this.blurBg.active = false;
                    resolve();
                })
                .start();
        });
    }

    /**
     * 隱藏 Loading 遮罩（播放淡出動畫）
     * @param delay 隱藏前的停留時間（秒），讓玩家看到清晰圖
     */
    public hide(delay: number = 0.3): Promise<void> {
        return new Promise((resolve) => {
            if (!this.isVisible) {
                resolve();
                return;
            }

            this.stopSpinner();

            tween(this.opacity)
                .delay(delay)
                .to(0.4, { opacity: 0 }, { easing: 'quadIn' })
                .call(() => {
                    this.node.active = false;
                    this.isVisible = false;
                    resolve();
                })
                .start();
        });
    }

    /**
     * 更新進度條（0~1）
     */
    public setProgress(value: number): void {
        if (!this.progressFill) return;
        const uiTf = this.progressFill.node.getComponent(UITransform);
        if (uiTf) {
            const fullWidth = uiTf.contentSize.width;
            tween(this.progressFill.node)
                .to(0.15, { scale: v3(Math.max(0, Math.min(1, value)), 1, 1) })
                .start();
        }
    }

    private startSpinner(): void {
        if (!this.spinner) return;
        this.spinnerTween = tween(this.spinner)
            .repeatForever(tween().by(0.8, { angle: -360 }))
            .start();
    }

    private stopSpinner(): void {
        if (this.spinnerTween) {
            this.spinnerTween.stop();
            this.spinnerTween = null;
        }
    }

    protected onDestroy(): void {
        if (LoadingOverlay.instance === this) {
            LoadingOverlay.instance = null;
        }
        this.stopSpinner();
    }
}
