import { SlotControllerBase } from '../../../../common/src/slot/mvc/SlotControllerBase';
import { SlotState } from '../../../../common/src/slot/stateMachine/SlotStateMachine';
import { SoundManager } from '../../../../../core/systems/audio/SoundManager';
import { GameModel } from '../model/GameModel';
import { GameView } from '../view/GameView';
import { SlotServerMock } from '../service/SlotServerMock';
import { log } from 'cc';
import { GameManager } from '../../../../../core/game/GameManager';
import { GameConfig } from '../config/GameConfig';

/**
 * GameController - 遊戲控制器 (Iteration 21+ Refactor)
 * 繼承自 SlotControllerBase，單一職責處理 戰神賽特 流程控制。
 */
export class GameController extends SlotControllerBase<GameView, GameModel> {
    protected override onStateChanged(state: SlotState): void {
        // 可以在這裡處理全域的狀態變化邏輯，如鎖定按鈕等
    }

    protected refreshTopUI(): void {
        this.view.updateBalance(this.model.balance);
        this.view.updateWin(this.model.currentWin);
        this.view.updateFreeSpin(this.model.freeSpinCount);
        this.view.updateMultiplier(this.model.currentMultiplier);

        // 同步至全域外殼 Bridge (Phase 3)
        GameManager.getInstance().updateBalance(this.model.balance);
    }

    public async startGame(): Promise<void> {
        log('[GameController] 遊戲開始');

        // 初始化餘額 (從全域 Bridge 獲取)
        this.model.balance = GameManager.getInstance().userInfo.balance;

        const initialGrid = SlotServerMock.getInstance().generateInitialGrid(
            this.model.COLUMN_COUNT,
            this.model.ROW_COUNT,
        );
        this.model.grid = initialGrid;

        this.view.onSpinClick = async () => {
            await this.spin();
        };
        this.view.onBuyFeatureClick = () => {
            this.buyFreeSpinFeature();
        };
        this.view.onAutoSpinToggle = (isOn: boolean) => {
            this._isAutoSpin = isOn;
            if (isOn && !this.model.isSpinning) this.spin();
        };
        this.view.onTurboToggle = (isOn: boolean) => {
            this.model.isTurbo = isOn;
            if (this.view.gridManager) this.view.gridManager.isTurbo = isOn;
        };
        this.view.onLowPowerToggle = (isOn: boolean) => {
            this.model.isLowPower = isOn;
            if (this.view.gridManager) this.view.gridManager.isLowPower = isOn;
        };
        this.view.onBetChange = (bet: number) => {
            log(`[GameController] 下注金額變更為: ${bet}`);
            this.model.betAmount = bet;
            this.refreshTopUI();
        };
    }

    public buyFreeSpinFeature(): void {
        const cost = this.model.betAmount * 100;
        if (this.model.balance >= cost) {
            this.model.balance -= cost;
            this.model.addFreeSpin(15);
            this.model.isFreeSpin = true;
            this.refreshTopUI();
        }
    }

    public async spin(): Promise<void> {
        if (!this._fsm.canSpin()) return;

        // 1. 旋轉前置處理 (扣錢/FS檢查)
        if (this.model.isFreeSpin && this.model.freeSpinCount > 0) {
            this.model.freeSpinCount--;
            this.view.setNightMode(true);
        } else {
            if (this.model.isFreeSpin) this.view.setNightMode(false);
            this.model.isFreeSpin = false;
            this.model.balance -= this.model.betAmount;
        }

        this._fsm.transitionTo(SlotState.SPINNING);
        this.model.resetResults(this.model.isFreeSpin);
        this.refreshTopUI();

        // SoundManager.getInstance().playSFX(GameConfig.getResBundleName(), 'audio/spin_start');

        // 2. 向 "Server" 請求結果
        const result = SlotServerMock.getInstance().requestSpin(
            this.model.COLUMN_COUNT,
            this.model.ROW_COUNT,
            this.model.betAmount,
        );

        // 同步初始畫面
        this.model.grid = result.initialGrid;
        if (this.view.gridManager) {
            await this.view.gridManager.syncGridFromData(this.model.grid);
        }

        // 3. 按照 Server 給出的 Cascade 序列執行視覺動畫
        this._fsm.transitionTo(SlotState.CASCADING);
        for (let i = 0; i < result.cascades.length; i++) {
            const cascade = result.cascades[i];

            if (this.view.gridManager) {
                // (A) 檢查並收集這一步的所有倍數
                const multipliersOnBoard: any[] = [];
                cascade.grid.forEach((col) =>
                    col.forEach((s) => {
                        if (s.type === 9) multipliersOnBoard.push(s);
                    }),
                );

                const collectPromises = multipliersOnBoard.map(async (m) => {
                    const worldPos = this.view.gridManager!.getSymbolWorldPosition(m.id);
                    await this.view.playMultiplierCollectAnimation(
                        worldPos,
                        m.multiplier || 2,
                        this.model.isTurbo,
                    );
                });

                // (B) 執行消除動畫
                await this.view.gridManager.eliminateSymbols(cascade.clusters);
                /* SoundManager.getInstance().playSFX(
                    GameConfig.getResBundleName(),
                    'audio/win_small',
                ); */

                // 等待倍數收集動畫完成 (若有)
                if (cascade.clusters.length > 0) {
                    await Promise.all(collectPromises);
                }

                // (C) 執行補滿掉落動畫
                const nextGrid =
                    i + 1 < result.cascades.length
                        ? result.cascades[i + 1].grid
                        : result.initialGrid;

                await this.view.gridManager.refillGrid(nextGrid);
            }
        }

        // 最終視覺更新
        this._fsm.transitionTo(SlotState.SETTLING);
        this.model.currentMultiplier = result.totalMultiplier;
        this.model.currentWin = result.finalTotalWin;
        this.view.updateMultiplier(result.totalMultiplier);

        if (this.model.currentWin > 0) {
            this.model.balance += this.model.currentWin;
            this.view.updateHistory(this.model.currentWin);

            if (this.model.currentWin >= this.model.betAmount * 20) {
                this.view.shakeScreen(1.0, 30);
                this.view.playWinFountainEffect();
                await new Promise<void>((res) => this.view.showBigWin(this.model.currentWin, res));
            }
        }

        if (result.scatterCount >= 4) {
            this._fsm.transitionTo(SlotState.FREE_SPIN_INTRO);
            this.model.addFreeSpin(15);
            this.model.isFreeSpin = true;
            // SoundManager.getInstance().playSFX(GameConfig.getResBundleName(), 'audio/fs_trigger');
            await new Promise<void>((res) => this.view.showFreeSpinIntro(res));
        }

        this._fsm.transitionTo(SlotState.IDLE);
        this.refreshTopUI();

        if (this._isAutoSpin) {
            await new Promise((r) => setTimeout(r, 1200));
            if (this._isAutoSpin) this.spin();
        }
    }
}
