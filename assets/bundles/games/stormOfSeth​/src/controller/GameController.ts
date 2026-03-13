import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';
import { log } from 'cc';

export class GameController {
    constructor(
        private view: GameView,
        private model: GameModel,
    ) {}

    public init(): void {
        log('[SlotController] 初始化遊戲邏輯');
    }

    public async startGame(): Promise<void> {
        log('[SlotController] 遊戲開始');
        this.view.onSpinClick = () => this.spin();
    }

    public async spin(): Promise<void> {
        if (this.model.isSpinning) return;

        log('[SlotController] 開始轉動');
        this.model.isSpinning = true;

        // 觸發視圖轉動
        await this.view.spinAllReels();

        this.model.isSpinning = false;
        this.model.resetResults();
        log('[SlotController] 轉動結束，結果:', this.model.reelResults);
    }

    public cleanup(): void {
        log('[SlotController] 清理資源');
    }
}
