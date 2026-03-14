import { Component, Node, UITransform } from 'cc';
import { UIManager } from '../../../../../app/ui/UIManager';
import { BaseUIController } from '../controller/BaseUIController';
/**
 * ViewBase - View 基底類別
 *
 * 提供所有 View 共用的基礎能力：
 * - 持有根節點（root）
 * - 透過 UIManager 動態建立 UI 元件（createComponent）
 * - 將元件節點掛載到根節點（addChild）
 *
 * 每個子遊戲／大廳的 View 繼承此類別，
 * 只需實作 `init()` 定義自身的面板建立順序。
 */
export abstract class ViewBase {
    /** 遊戲 UI 的根節點（由 Main.ts 注入） */
    protected readonly root: Node;

    /**
     * @param root 根節點（Main Component 的 this.node）
     */
    constructor(root: Node) {
        this.root = root;
    }

    /**
     * 初始化視圖 — 子類別必須實作
     * 建立並加入所有 UI 面板
     */
    public abstract init(): void;

    /**
     * 從 Bundle 快取取出 Prefab、實體化並動態掛載 Script
     *
     * 前置條件：對應的 Prefab 必須已透過 ResManager.loadPrefabAsync 存入快取。
     * @param bundleName 來源 Bundle。
     * @param prefabName Prefab 檔名（不含副檔名），例如 'MenuPanel'
     * @param ComponentClass 要掛載的 BaseUIController 子類別建構子
     */
    protected createComponent<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        ComponentClass: new () => T,
    ): T {
        return UIManager.getInstance().createComponent(bundleName, prefabName, ComponentClass);
    }

    /**
     * Code-only 模式建立 UI 元件（不使用 Prefab）
     * @param nodeName 節點名稱
     * @param ComponentClass 要掛載的 BaseUIController 子類別建構子
     */
    protected createComponentOnly<T extends BaseUIController>(
        nodeName: string,
        ComponentClass: new () => T,
    ): T {
        return UIManager.getInstance().createComponentOnly(nodeName, ComponentClass);
    }

    /**
     * 將 UI 元件的節點或直接將節點加入根節點
     * @param target BaseUIController 子類別實例 或 Node
     */
    protected addChild(target: Component | Node): void {
        const node = target instanceof Node ? target : target.node;
        this.root.addChild(node);
    }

    /**
     * 獲取或添加組件
     */
    protected getOrAddComponent<T extends Component>(node: Node, type: { new (): T }): T {
        return node.getComponent(type) || node.addComponent(type);
    }

    /**
     * 獲取節點的 UITransform
     * @param node 目標節點
     * @returns UITransform 組件
     */
    protected getUITransform(node: Node = this.root): UITransform {
        return node.getComponent(UITransform) || node.addComponent(UITransform);
    }
}
