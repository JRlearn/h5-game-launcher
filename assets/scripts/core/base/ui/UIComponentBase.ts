import { Component, Node, Layers, UITransform, _decorator } from 'cc';
import {
    OrientationManager,
    OrientationType,
} from '../../../framework/manager/ui/OrientationManager';

const { ccclass } = _decorator;

/**
 * UIComponentBase - Code-only 組件基類
 *
 * 解決以下痛點：
 * 1. 自動處理 UI_2D 圖層設定。
 * 2. 提供等冪的 UI 初始化邏輯 (initUI)，防止數據先行導致的空引用。
 * 3. 封裝常用的節點建立與組件獲取工具。
 * 4. 內建螢幕方向旋轉監聽。
 */
@ccclass('UIComponentBase')
export abstract class UIComponentBase extends Component {
    protected _isUIInitialized: boolean = false;

    protected onLoad(): void {
        this.initUI();
    }

    protected onEnable(): void {
        OrientationManager.getInstance().on(
            OrientationManager.Event.CHANGE,
            this._onInternalOrientationChange,
            this,
        );
    }

    protected onDisable(): void {
        OrientationManager.getInstance().off(
            OrientationManager.Event.CHANGE,
            this._onInternalOrientationChange,
            this,
        );
    }

    private _onInternalOrientationChange(orientation: OrientationType): void {
        // if (typeof this.onOrientationChange === 'function') {
        //     this.onOrientationChange(orientation);
        // }
    }

    /**
     * 當螢幕方向改變時觸發 (可由子類實作)
     */
    protected abstract onOrientationChange(orientation: OrientationType): void;

    /**
     * 初始化 UI 結構
     * 子類需實作 createUI 進行具體的節點建立
     */
    public initUI(): void {
        if (this._isUIInitialized) return;
        this._isUIInitialized = true;
        this.createUI();
    }

    /**
     * 由子類實作的具體 UI 建立邏輯
     */
    protected abstract createUI(): void;

    /**
     * 建立並添加子節點 (自動設定圖層為 UI_2D)
     * @param name 節點名稱
     * @param parent 父節點，預設為 this.node
     */
    protected createChild(name: string, parent: Node = this.node): Node {
        const node = new Node(name);
        node.addComponent(UITransform);
        parent.addChild(node);
        return node;
    }

    /**
     * 獲取或添加組件
     */
    protected getOrAddComponent<T extends Component>(node: Node, type: { new (): T }): T {
        return node.getComponent(type) || node.addComponent(type);
    }

    /**
     * 獲取 UITransform 確保存在
     */
    protected getUITransform(node: Node = this.node): UITransform {
        return this.getOrAddComponent(node, UITransform);
    }
}
