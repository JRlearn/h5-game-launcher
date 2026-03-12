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

@ccclass('UIManager')
export class UIManager extends Component {
    private static instance: UIManager | null = null;
    private uiCache: Map<string, BaseUIController> = new Map();
    private layerNodes: Map<UILayer, Node> = new Map();

    public static getInstance(): UIManager {
        if (!this.instance) {
            this.instance = new UIManager();
        }
        return this.instance;
    }

    public createComponent<T extends BaseUIController>(
        bundleName: string = ResManager.getInstance().getDefaultBundleName(),
        prefabName: string,
        componentClass: { new (): T },
    ): T {
        return this.createComponentFromBundle(bundleName, prefabName, componentClass);
    }

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

    public createComponentOnly<T extends BaseUIController>(
        nodeName: string,
        componentClass: { new (): T },
    ): T {
        let node = new Node(nodeName);
        return node.addComponent(componentClass);
    }

    public init(canvasRoot: Node) {
        this.layerNodes.clear();
        Object.values(UILayer).forEach((layerName) => {
            let layerNode = new Node(layerName);
            canvasRoot.addChild(layerNode);
            this.layerNodes.set(layerName as UILayer, layerNode);
        });
    }

    public showUI<T extends BaseUIController>(
        bundleName: string,
        prefabName: string,
        componentClass: { new (): T },
        layer: UILayer = UILayer.View,
    ): T {
        let cacheKey = `${bundleName}_${prefabName}`;
        let uiController = this.uiCache.get(cacheKey) as T;

        if (!uiController) {
            uiController = this.createComponentFromBundle(bundleName, prefabName, componentClass);
            this.uiCache.set(cacheKey, uiController);
        }

        let parentNode = this.layerNodes.get(layer);
        if (parentNode) {
            uiController.node.setParent(parentNode);
        } else {
            warn(`[UI] UIManager: UI Layer ${layer} not initialized! Attaching to director scene.`);
            director.getScene()?.addChild(uiController.node);
        }

        uiController.node.active = true;
        return uiController;
    }

    public closeUI(bundleName: string, prefabName: string) {
        let cacheKey = `${bundleName}_${prefabName}`;
        let uiController = this.uiCache.get(cacheKey);

        if (uiController) {
            uiController.node.active = false;
        }
    }

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
