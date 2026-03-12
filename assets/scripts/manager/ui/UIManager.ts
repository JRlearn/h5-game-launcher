import { _decorator, Component, instantiate, Node, Canvas, director } from 'cc';
import { ResManager } from '../resource/ResManager';
import { BaseUIController } from '../../framework/ui/BaseUIController';
import { LogManager } from '../core/LogManager';
const { ccclass } = _decorator;

export enum UILayer {
    Background = 'BackgroundLayer',
    View = 'ViewLayer',
    Popup = 'PopupLayer',
    Loading = 'LoadingLayer',
    Toast = 'ToastLayer',
}

@ccclass('UIManager')
export class UIManager extends Component {
    private static instance: UIManager | null = null;
    private uiCache: Map<string, BaseUIController> = new Map(); // 快取已建立的 UI 實例
    private layerNodes: Map<UILayer, Node> = new Map(); // 儲存各層級的父節點

    /** UIManager 單例 */
    public static getInstance(): UIManager {
        if (!this.instance) {
            this.instance = new UIManager();
        }
        return this.instance;
    }

    /**
     * 創建組件 (使用預設 Bundle)
     * @param prefabName 預製體名稱或路徑 (ex: 'GuessNumPanel')
     * @param componentClass 對應的腳本組件型別
     */
    public createComponent<T extends BaseUIController>(
        bundleName: string = ResManager.getInstance().getDefaultBundleName(),
        prefabName: string,
        componentClass: { new (): T },
    ): T {
        return this.createComponentFromBundle(bundleName, prefabName, componentClass);
    }

    /**
     * 從指定 Bundle 創建組件
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱或路徑
     * @param componentClass 對應的腳本組件型別
     */
    public createComponentFromBundle<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
    ): T {
        let prefab = ResManager.getInstance().getPrefabFromBundle(bundleName, prefabName);
        if (!prefab) {
            // 如果找不到 Prefab，回退到 Code-only 模式建立空節點
            LogManager.getInstance().warn(
                'UI',
                `UIManager: 找不到預製體 ${prefabName}，將以 Code-only 模式建立。`,
            );
            return this.createComponentOnly(prefabName, componentClass);
        }
        let ui = instantiate(prefab);
        return ui.addComponent(componentClass); // 動態掛載組件
    }

    /**
     * Code-only 模式建立組件（不使用 Prefab）
     * @param nodeName 節點名稱
     * @param componentClass 對應的腳本組件型別
     */
    public createComponentOnly<T extends BaseUIController>(
        nodeName: string,
        componentClass: { new (): T },
    ): T {
        let node = new Node(nodeName);
        return node.addComponent(componentClass);
    }

    /**
     * 初始化 UI 層級節點 (應在場景初始化時呼叫)
     * @param canvasRoot Canvas 根節點
     */
    public init(canvasRoot: Node) {
        this.layerNodes.clear();
        Object.values(UILayer).forEach((layerName) => {
            let layerNode = new Node(layerName);
            canvasRoot.addChild(layerNode);
            // 讓層級自動撐滿全螢幕等設定可以依需求加在這裡
            this.layerNodes.set(layerName as UILayer, layerNode);
        });
    }

    /**
     * 顯示 UI (帶快取與層級管理)
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱或路徑
     * @param componentClass UI Controller 類別
     * @param layer 顯示層級
     */
    public showUI<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
        layer: UILayer = UILayer.View,
    ): T {
        let cacheKey = `${bundleName}_${prefabName}`;
        let uiController = this.uiCache.get(cacheKey) as T;

        if (!uiController) {
            // 如果快取中沒有，則新建
            uiController = this.createComponentFromBundle(bundleName, prefabName, componentClass);
            this.uiCache.set(cacheKey, uiController);
        }

        let parentNode = this.layerNodes.get(layer);
        if (parentNode) {
            uiController.node.setParent(parentNode);
        } else {
            console.warn(
                `UIManager: UI Layer ${layer} not initialized! Attaching to director scene.`,
            );
            director.getScene()?.addChild(uiController.node);
        }

        uiController.node.active = true;
        return uiController;
    }

    /**
     * 關閉並隱藏 UI
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱或路徑
     */
    public closeUI(bundleName: string, prefabName: string) {
        let cacheKey = `${bundleName}_${prefabName}`;
        let uiController = this.uiCache.get(cacheKey);

        if (uiController) {
            uiController.node.active = false;
        }
    }

    /**
     * 異步顯示 UI (自動處理資源包載入與創建)
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱或路徑
     * @param componentClass UI Controller 類別
     * @param layer 顯示層級
     */
    public async showUIAsync<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
        layer: UILayer = UILayer.View,
    ): Promise<T> {
        // 1. 確保 Bundle 已載入
        await ResManager.getInstance().loadBundleAsync(bundleName);

        // 2. 呼叫同步的 showUI (內含快取邏輯)
        return this.showUI(bundleName, prefabName, componentClass, layer);
    }
}
