import {
    _decorator,
    Component,
    ProgressBar,
    Size,
    Sprite,
    Color,
    Vec2,
    Node,
    Label,
    UITransform,
} from 'cc';
import { EventBus } from '../../../core/event/EventBus';
import { EventName } from '../../../core/event/EventName';
import { NodeFactory } from '../../../core/utils/NodeFactory';

const { ccclass } = _decorator;

/**
 * ProgressUIController - 負責加載畫面的 UI 表現與進度條平滑更新
 */
@ccclass('ProgressUIController')
export class ProgressUIController extends Component {
    private _progressBar: ProgressBar | null = null;
    private _hintLabel: Label | null = null;
    private _targetProgress: number = 0;
    private _currentDisplayProgress: number = 0;
    private readonly _SMOOTH_FACTOR: number = 0.15; // 平滑係數

    protected onLoad(): void {
        this._initUI();
    }

    protected onEnable(): void {
        EventBus.on(EventName.LAUNCHER_PROGRESS, this._onProgressUpdate, this);
    }

    protected onDisable(): void {
        EventBus.off(EventName.LAUNCHER_PROGRESS, this._onProgressUpdate, this);
    }

    protected update(dt: number): void {
        if (!this._progressBar) return;

        // 平滑插值更新 (Lerp)
        if (Math.abs(this._targetProgress - this._currentDisplayProgress) > 0.001) {
            this._currentDisplayProgress +=
                (this._targetProgress - this._currentDisplayProgress) * this._SMOOTH_FACTOR;
            this._progressBar.progress = this._currentDisplayProgress;
        } else {
            this._progressBar.progress = this._targetProgress;
            this._currentDisplayProgress = this._targetProgress;
        }
    }

    /**
     * 初始化加載 UI
     */
    private _initUI(): void {
        const barSize = new Size(400, 20);

        // 1. 根節點
        const node = NodeFactory.createUINode('ProgressUI', { size: new Size(barSize.width, 100) });
        node.setPosition(0, -250);
        this.node.addChild(node);

        // 2. 背景
        const bgNode = NodeFactory.createUINode('Background', { size: barSize });
        const bgSprite = bgNode.addComponent(Sprite);
        bgSprite.type = Sprite.Type.SLICED;
        bgSprite.color = new Color(50, 50, 50, 200);
        node.addChild(bgNode);

        // 3. 填充條
        const barNode = NodeFactory.createUINode('Bar', {
            size: barSize,
            anchor: new Vec2(0, 0.5),
        });
        barNode.setPosition(-barSize.width / 2, 0);
        const barSprite = barNode.addComponent(Sprite);
        barSprite.type = Sprite.Type.FILLED;
        barSprite.fillType = Sprite.FillType.HORIZONTAL;
        barSprite.color = new Color(100, 255, 100, 255);
        node.addChild(barNode);

        // 4. 進度條組件
        const pb = node.addComponent(ProgressBar);
        pb.progress = 0;
        pb.barSprite = barSprite;
        this._progressBar = pb;

        // 5. 提示文字
        const labelNode = new Node('HintLabel');
        labelNode.setPosition(0, 40);
        const labelTrans = labelNode.addComponent(UITransform);
        labelTrans.setContentSize(400, 40);
        const label = labelNode.addComponent(Label);
        label.string = '初始化中...';
        label.fontSize = 20;
        label.lineHeight = 40;
        label.color = Color.WHITE;
        node.addChild(labelNode);
        this._hintLabel = label;
    }

    /**
     * 更新目標進度與描述
     */
    private _onProgressUpdate(data: { progress: number; stepDescription?: string }): void {
        this._targetProgress = data.progress;
        if (data.stepDescription && this._hintLabel) {
            this._hintLabel.string = data.stepDescription;
        }
    }
}
