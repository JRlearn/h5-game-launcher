import { _decorator, Component, instantiate, Node, director, log, warn, Layers } from 'cc';
import { ResManager } from '../resource/ResManager';
import { BaseUIController } from '../../../core/base/mvc/controller/BaseUIController';

const { ccclass } = _decorator;

export enum UILayer {
    Background = 'BackgroundLayer',
    View = 'ViewLayer',
    Popup = 'PopupLayer',
    Loading = 'LoadingLayer',
    Toast = 'ToastLayer',
}

/**
 * UIManager - 用戶介面管理器
 * 負責 UI 層級管理、實例化、緩存與顯示流程。
 */
@ccclass('UIManager')
export class UIManager extends Component {
    /** UIManager 單例實例 */
    private static _instance: UIManager | null = null;
    /** UI 實例緩存映射表 */
    private _uiCache: Map<string, BaseUIController> = new Map();
    /** 層級根節點映射表 */
    private _layerNodes: Map<UILayer, Node> = new Map();

    /**
     * 獲取 UIManager 單例
     * @returns UIManager 實例
     */
    public static getInstance(): UIManager {
        if (!this._instance) {
            UIManager._instance = new UIManager();
        }
        return UIManager._instance!;
    }

    /**
     * 建立 UI 組件實例（優先從預設 Bundle 獲取預製體）
     * @template T 控制器型別
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱
     * @param componentClass 組件控制類別
     * @returns 已掛載組件的實例
     */
    public createComponent<T extends BaseUIController>(
        bundleName: string = ResManager.getInstance().getDefaultBundleName(),
        prefabName: string,
        componentClass: { new (): T },
    ): T {
        return this.createComponentFromBundle(bundleName, prefabName, componentClass);
    }

    /**
     * 從指定資源包建立 UI 組件實例
     * @template T 控制器型別
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱
     * @param componentClass 組件控制類別
     * @returns 已掛載組件的實例
     */
    public createComponentFromBundle<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
    ): T {
        let prefab = ResManager.getInstance().getPrefabFromBundle(bundleName, prefabName);
        if (!prefab) {
            warn(`[UI] UIManager: 找不到預製體 ${prefabName}，將以 Code-only 模式建立。`);
            return this.createComponentOnly(prefabName, componentClass);
        }
        let ui = instantiate(prefab);
        return ui.addComponent(componentClass);
    }

    /**
     * 僅建立純代碼控管的 UI 節點
     * @template T 控制器型別
     * @param nodeName 節點名稱
     * @param componentClass 組件控制類別
     * @returns 已掛載組件的實例
     */
    public createComponentOnly<T extends BaseUIController>(
        nodeName: string,
        componentClass: { new (): T },
    ): T {
        let node = new Node(nodeName);
        return node.addComponent(componentClass);
    }

    /**
     * 初始化 UIManager 與 UI 層級節點
     * @param canvasRoot UI 的根容器節點（通常為 Canvas）
     */
    public init(canvasRoot: Node): void {
        this._layerNodes.clear();
        Object.values(UILayer).forEach((layerName) => {
            let layerNode = new Node(layerName);
            canvasRoot.addChild(layerNode);
            this._layerNodes.set(layerName as UILayer, layerNode);
        });
    }

    /**
     * 顯示指定的 UI 介面
     * @template T 控制器型別
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱
     * @param componentClass 組件控制類別
     * @param layer 顯示層級
     * @returns UI 控制器實例
     */
    public showUI<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
        layer: UILayer = UILayer.View,
    ): T {
        let cacheKey = `${bundleName}_${prefabName}`;
        let uiController = this._uiCache.get(cacheKey) as T | undefined;

        if (!uiController) {
            uiController = this.createComponentFromBundle(bundleName, prefabName, componentClass);
            this._uiCache.set(cacheKey, uiController);
        }

        let parentNode = this._layerNodes.get(layer);
        if (parentNode) {
            uiController.node.setParent(parentNode);
        } else {
            warn(`[UI] UIManager: UI Layer ${layer} not initialized! Attaching to director scene.`);
            director.getScene()?.addChild(uiController.node);
        }

        uiController.node.active = true;
        return uiController;
    }

    /**
     * 隱藏指定的 UI 介面
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱
     */
    public closeUI(bundleName: string, prefabName: string): void {
        let cacheKey = `${bundleName}_${prefabName}`;
        let uiController = this._uiCache.get(cacheKey);

        if (uiController) {
            uiController.node.active = false;
        }
    }

    /**
     * 非同步加載資源並顯示 UI
     * @template T 控制器型別
     * @param bundleName 資源包名稱
     * @param prefabName 預製體名稱
     * @param componentClass 組件控制類別
     * @param layer 顯示層級
     * @returns Promise<UI 控制器實例>
     */
    public async showUIAsync<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
        layer: UILayer = UILayer.View,
    ): Promise<T> {
        await ResManager.getInstance().loadBundleAsync(bundleName);
        return this.showUI(bundleName, prefabName, componentClass, layer);
    }
}
