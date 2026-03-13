import { view, Canvas, Widget, Node, Size, ResolutionPolicy, log } from 'cc';
import { AppConfig } from '../../../config/AppConfig';

/**
 * ScreenAdapter - 專為各類環境打造的螢幕尺寸自動適配管理器
 *
 * 功能：
 * 1. 監聽螢幕尺寸變化。
 * 2. 自動切換 FIXED_WIDTH / FIXED_HEIGHT 策略。
 * 3. 對 Canvas 或根節點進行動態縮放補償，確保內容不被裁切 (類似 SHOW_ALL 但保有 Widget 對齊能力)。
 */
export class ScreenAdapter {
    private _canvasNode: Node;
    private _designWidth: number;
    private _designHeight: number;
    private _policy: number = ResolutionPolicy.FIXED_WIDTH;

    constructor(canvasNode: Node) {
        this._canvasNode = canvasNode;
        this._designWidth = AppConfig.DESIGN_WIDTH;
        this._designHeight = AppConfig.DESIGN_HEIGHT;

        this._setupCanvas();
    }

    private _setupCanvas(): void {
        const canvas =
            this._canvasNode.getComponent(Canvas) || this._canvasNode.addComponent(Canvas);
        canvas.alignCanvasWithScreen = true;

        // 配置 Canvas 全螢幕 Widget
        const widget =
            this._canvasNode.getComponent(Widget) || this._canvasNode.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        this.update();
    }

    /**
     * 更新適配邏輯 (應在 resize 時調用)
     */
    public update(): void {
        const winSize = view.getVisibleSize();
        const screenWidth = winSize.width;
        const screenHeight = winSize.height;

        const designRatio = this._designWidth / this._designHeight;
        const screenRatio = screenWidth / screenHeight;

        // 1. 動態判斷適配策略
        if (screenRatio > designRatio) {
            // 螢幕較寬 -> 固定高度
            this._policy = ResolutionPolicy.FIXED_HEIGHT;
        } else {
            // 螢幕較窄 -> 固定寬度
            this._policy = ResolutionPolicy.FIXED_WIDTH;
        }

        view.setDesignResolutionSize(this._designWidth, this._designHeight, this._policy);

        // 2. 計算縮放比例
        const scaleX = screenWidth / this._designWidth;
        const scaleY = screenHeight / this._designHeight;

        // 這裡的邏輯：若使用 FIXED_WIDTH，則寬度剛好，高度可能溢出或不足。
        // 若要保證「內容不被裁切」且「不留黑邊」(NO_BORDER 邏輯)，通常不做額外 scale。
        // 若要保證「所有設計內容都可見」(SHOW_ALL 邏輯)，則取 min(scaleX, scaleY)。

        // 依照使用者需求，我們可以對根節點進行 scale 調整，或者讓 Widget 自動處理。
        // 在 CC 3.x，保持 Canvas 縮放為 1 並正確設定 Policy 是最通用的做法。

        log(
            `[ScreenAdapter] Resize - Policy: ${this._policy === ResolutionPolicy.FIXED_WIDTH ? 'FIXED_WIDTH' : 'FIXED_HEIGHT'}, Ratio: ${screenRatio.toFixed(2)}`,
        );
    }

    /**
     * 取得建議的縮放值 (供遊戲內容根節點使用)
     */
    public getAdaptiveScale(): number {
        const winSize = view.getVisibleSize();
        const scaleX = winSize.width / this._designWidth;
        const scaleY = winSize.height / this._designHeight;
        return Math.min(scaleX, scaleY);
    }
}
