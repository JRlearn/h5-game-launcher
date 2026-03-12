import { _decorator, view, EventTarget, log, Size } from 'cc';
import { AppConfig } from '../../../config/AppConfig';

/**
 * 螢幕方向列舉
 */
export enum OrientationType {
    /** 橫向 */
    LANDSCAPE = 'landscape',
    /** 縱向 */
    PORTRAIT = 'portrait'
}

/**
 * OrientationManager - 螢幕方向管理器 (動態適配增強版)
 * 
 * 參考「動態適配的基本概念」實作：
 * 1. 寬高比 (Aspect Ratio) 計算
 * 2. 方向 (Orientation) 門檻判斷 (預設 1.2)
 * 3. 縮放策略 (Fit/Fill) 比例計算
 */
export class OrientationManager {
    private static _instance: OrientationManager;
    private _eventTarget: EventTarget = new EventTarget();
    
    private _currentOrientation: OrientationType = OrientationType.PORTRAIT;
    private _currentAspectRatio: number = 1;
    private _currentScale: number = 1;
    
    /** 橫屏判定閾值 (寬/高)，小於此值則視為直屏 */
    public static readonly LANDSCAPE_THRESHOLD = 1.2;

    /** 事件名稱列舉 */
    public static readonly Event = {
        CHANGE: 'orientation-change',
        RESIZE: 'screen-resize'
    };

    private constructor() {
        this._init();
    }

    public static getInstance(): OrientationManager {
        if (!this._instance) {
            this._instance = new OrientationManager();
        }
        return this._instance;
    }

    private _init(): void {
        view.on('canvas-resize', this._checkOrientation, this);
        this._checkOrientation();
    }

    /**
     * 動態檢查螢幕尺寸與方向
     */
    private _checkOrientation(): void {
        const winSize = view.getVisibleSize();
        const width = winSize.width;
        const height = winSize.height;
        
        // 1. 計算寬高比 (Aspect Ratio)
        this._currentAspectRatio = width / height;

        // 2. 方向偵測 (使用閾值 1.2)
        // 若寬高比 >= 1.2 則視為橫屏，否則為直屏 (包含稍微偏高的螢幕)
        const newOrientation = this._currentAspectRatio >= OrientationManager.LANDSCAPE_THRESHOLD 
            ? OrientationType.LANDSCAPE 
            : OrientationType.PORTRAIT;

        // 3. 計算縮放比例 (Scale Strategy: Fit)
        // 基於 AppConfig 的設計分辨率計算
        const designWidth = AppConfig.DESIGN_WIDTH;
        const designHeight = AppConfig.DESIGN_HEIGHT;
        
        const scaleX = width / designWidth;
        const scaleY = height / designHeight;
        
        // 選擇等比縮放最小值 (Fit 策略)
        this._currentScale = Math.min(scaleX, scaleY);

        const isChanged = newOrientation !== this._currentOrientation;
        const oldOrientation = this._currentOrientation;

        if (isChanged) {
            this._currentOrientation = newOrientation;
            log(`[Orientation] 方向變更: ${oldOrientation} -> ${newOrientation} (AR: ${this._currentAspectRatio.toFixed(2)})`);
            this._eventTarget.emit(OrientationManager.Event.CHANGE, newOrientation, oldOrientation);
        }

        // 無論方向是否改變，都發送 Resize 事件供 UI 更新
        this._eventTarget.emit(OrientationManager.Event.RESIZE, {
            orientation: this._currentOrientation,
            aspectRatio: this._currentAspectRatio,
            scale: this._currentScale,
            winSize: winSize
        });
    }

    /** 當前寬高比 */
    public get aspectRatio(): number { return this._currentAspectRatio; }
    
    /** 當計算出的適配縮放比例 */
    public get scale(): number { return this._currentScale; }

    /** 取得當前方向 */
    public get orientation(): OrientationType { return this._currentOrientation; }

    /** 是否為橫向 */
    public get isLandscape(): boolean { return this._currentOrientation === OrientationType.LANDSCAPE; }

    /** 是否為縱向 */
    public get isPortrait(): boolean { return this._currentOrientation === OrientationType.PORTRAIT; }

    /** 是否需要顯示旋轉提示 (當寬高比不符合預期方向時) */
    public get shouldShowRotateTip(): boolean {
        // 假設專案主打直屏，若寬高比太大 (橫屏) 則提示
        // 這裡可以根據 AppConfig.DESIGN_WIDTH/HEIGHT 的傾向來決定
        const isDesignPortrait = AppConfig.DESIGN_HEIGHT > AppConfig.DESIGN_WIDTH;
        if (isDesignPortrait) {
            return this._currentAspectRatio > 1.0; // 直屏專案在橫屏下提示
        } else {
            return this._currentAspectRatio < OrientationManager.LANDSCAPE_THRESHOLD; // 橫屏專案在直屏下提示
        }
    }

    public on(type: string, callback: (...args: any[]) => void, target?: any): void {
        this._eventTarget.on(type, callback, target);
    }

    public off(type: string, callback?: (...args: any[]) => void, target?: any): void {
        this._eventTarget.off(type, callback, target);
    }
}
