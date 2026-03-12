import { EventBus } from '../../../core/event/EventBus';
import { EventName } from '../../../core/event/EventName';

/**
 * ProgressManager - 進度管理器
 * 負責管理各項載入任務的權重與進度計算。
 * 支援分步驟權重管理與詳細的事件回報。
 */
export class ProgressManager {
    private static _instance: ProgressManager | null = null;

    private _weights: Map<string, number> = new Map();
    private _progresses: Map<string, number> = new Map();
    private _totalWeight: number = 0;
    private _lastStepDescription: string = '';
    private _currentStep: string = '';

    private constructor() {}

    public static getInstance(): ProgressManager {
        if (!this._instance) {
            this._instance = new ProgressManager();
        }
        return this._instance;
    }

    /**
     * 重置所有狀態
     */
    public reset(): void {
        this._weights.clear();
        this._progresses.clear();
        this._totalWeight = 0;
        this._lastStepDescription = '';
        this._currentStep = '';
    }

    /**
     * 初始化進度權重配置
     * @param weights 鍵值對，代表每個步驟標示及其權重 (例如: { CORE: 3, UI: 7 })
     */
    public init(weights: Record<string, number>): void {
        this.reset();
        for (const key in weights) {
            const weight = Math.max(0, weights[key]);
            this._weights.set(key, weight);
            this._progresses.set(key, 0);
            this._totalWeight += weight;
        }
    }

    /**
     * 更新特定步驟的進度與顯示描述
     * @param step 步驟標識 (必須在 init 時定義)
     * @param progress 該步驟的當前進度 (0~1)
     * @param description 選填，更新顯示給使用者的提示文字
     */
    public setStepProgress(step: string, progress: number, description?: string): void {
        if (!this._weights.has(step)) return;

        const p = Math.max(0, Math.min(1, progress));
        this._progresses.set(step, p);
        this._currentStep = step;

        if (description) {
            this._lastStepDescription = description;
        }

        this._emitUpdate();
    }

    /**
     * 取得當前平滑換算後的總進度 (0~1)
     */
    public getTotalProgress(): number {
        if (this._totalWeight === 0) return 1;

        let weightedSum = 0;
        this._progresses.forEach((p, key) => {
            const w = this._weights.get(key) || 0;
            weightedSum += p * w;
        });

        const total = weightedSum / this._totalWeight;
        return Math.min(1, total);
    }

    /**
     * 發送全域進度更新事件
     */
    private _emitUpdate(): void {
        const total = this.getTotalProgress();
        EventBus.emit(EventName.LAUNCHER_PROGRESS, {
            progress: total,
            stepDescription: this._lastStepDescription,
        });
    }
}
