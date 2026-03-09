import { _decorator, Component, instantiate } from 'cc';
import { ResManager } from '../resource/ResManager';
import { BaseUIController } from '../../framework/ui/BaseUIController';
const { ccclass } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    private static instance: UIManager | null = null;
    private prefabCtrs: Map<new () => BaseUIController, string> = new Map(); // 儲存預製體類型與名稱的對應關係

    private constructor() {
        super();
    }

    /** UIManager 單例 */
    public static getInstance(): UIManager {
        if (!this.instance) {
            this.instance = new UIManager();
        }
        return this.instance;
    }

    public registerPrefabCtr<T extends BaseUIController>(
        ctrClass: { new (): T },
        prefabName: string,
    ) {
        this.prefabCtrs.set(ctrClass, prefabName); // 註冊預製體類型與名稱的對應關係
    }

    /**
     * 創建組件
     * @param bundleName 資源包名稱
     * @param componentClass 組件類型
     */
    public createComponent<T extends BaseUIController>(componentClass: { new (): T }): T {
        return this.createComponentFromBundle(
            ResManager.getInstance().getDefaultBundleName(),
            componentClass,
        ); // 使用預設資源包名稱創建組件
    }

    /**
     * 創建組件
     * @param bundleName 資源包名稱
     * @param componentClass 組件類型
     */
    public createComponentFromBundle<T extends BaseUIController>(
        bundleName: string,
        componentClass: { new (): T },
    ): T {
        let prefabName = this.prefabCtrs.get(componentClass);
        let prefab = ResManager.getInstance().getPrefabFromBundle(bundleName, prefabName); // 獲取預製體
        let ui = instantiate(prefab);
        return ui.addComponent(componentClass); // 獲取組件
    }
}
