import {
    _decorator,
    Camera,
    Canvas,
    Color,
    Component,
    Node,
    Widget,
    log,
    Size,
    Layers,
    Vec3,
    view,
} from 'cc';
import { SceneManager } from './framework/manager/ui/scene/SceneManager';
import { AppConfig } from './config/AppConfig';
import { NodeFactory } from './core/utils/NodeFactory';
import { OrientationManager, OrientationType } from './framework/manager/ui/OrientationManager';
import { OrientationTip } from './framework/manager/ui/OrientationTip';

const { ccclass } = _decorator;

/**
 * AppScene - 核心主畫面控制器
 * 負責單場景架構的基礎容器（Canvas, Roots）初始化。
 */
@ccclass('AppScene')
export class AppScene extends Component {
    private _canvasNode!: Node;
    private _orientationTip!: OrientationTip;

    /**
     * 載入時初始化基礎容器
     */
    public onLoad(): void {
        log('[AppScene] onLoad - 初始化基礎容器');
        // 1. 初始化螢幕方向管理器
        OrientationManager.getInstance().on(
            OrientationManager.Event.RESIZE,
            this._onScreenResize,
            this,
        );

        // 2. 建立基礎層級
        this._setupBaseHierarchy();

        // 3. 執行初始適配
        this._onScreenResize();
    }

    /**
     * 建立基礎容器層級
     */
    private _setupBaseHierarchy(): void {
        this._canvasNode = this._createCanvas();
        const uiRoot = this._createUIRoot();
        const gameRoot = this._createGameRoot();
        const lobbyRoot = this._createLobbyRoot();

        // 強制所有 UI 容器使用 UI_2D 層級，確保與相機對應
        this._canvasNode.layer =
            uiRoot.layer =
            gameRoot.layer =
            lobbyRoot.layer =
                Layers.Enum.UI_2D;

        const cameraNode = this._createCamera();

        this._canvasNode.addChild(cameraNode);
        this._canvasNode.addChild(uiRoot);
        this._canvasNode.addChild(gameRoot);
        this._canvasNode.addChild(lobbyRoot);

        // 4. 建立旋轉提示層 (放在 Canvas 內最上方)
        const tipNode = new Node('OrientationTip');
        tipNode.layer = Layers.Enum.UI_2D;
        this._canvasNode.addChild(tipNode);
        this._orientationTip = tipNode.addComponent(OrientationTip) as any;

        this.node.addChild(this._canvasNode);

        // 5. 初始化 SceneManager 的掛載點
        SceneManager.getInstance().init(gameRoot, lobbyRoot);
        log('[AppScene] ✅ 基礎層級建立完成 (Layer: UI_2D)');
    }

    /**
     * 當螢幕尺寸或方向改變時觸發
     */
    private _onScreenResize(): void {
        const mgr = OrientationManager.getInstance();

        // 交給 Canvas 組件與 Widget 自動處理佈局
        // 我們只需要更新旋轉提示
        if (this._orientationTip) {
            this._orientationTip.updateVisibility();
        }
    }

    /**
     * 建立 Canvas 根節點
     */
    private _createCanvas(): Node {
        const node = NodeFactory.createUINode('Canvas', {
            size: new Size(AppConfig.DESIGN_WIDTH, AppConfig.DESIGN_HEIGHT),
        });
        const canvas = node.addComponent(Canvas);
        canvas.alignCanvasWithScreen = true;

        // 使用引擎標準適配方案
        view.setDesignResolutionSize(AppConfig.DESIGN_WIDTH, AppConfig.DESIGN_HEIGHT, 4); // 4 is ResolutionPolicy.FIXED_WIDTH

        const widget = node.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = Widget.AlignMode.ALWAYS;

        return node;
    }

    /**
     * 建立 UI 根節點
     */
    private _createUIRoot(): Node {
        const node = NodeFactory.createUINode('UIRoot');
        this._addFullScreenWidget(node);
        return node;
    }

    /**
     * 建立遊戲根節點
     */
    private _createGameRoot(): Node {
        const node = NodeFactory.createUINode('GameRoot');
        this._addFullScreenWidget(node);
        return node;
    }

    /**
     * 建立大廳根節點
     */
    private _createLobbyRoot(): Node {
        const node = NodeFactory.createUINode('LobbyRoot');
        this._addFullScreenWidget(node);
        return node;
    }

    private _addFullScreenWidget(node: Node): void {
        const widget = node.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = Widget.AlignMode.ALWAYS;
    }

    /**
     * 建立主攝影機 (2D 最佳化配置)
     */
    private _createCamera(): Node {
        const node = new Node('Main Camera');
        const camera = node.addComponent(Camera);

        // 設定為正交投影
        camera.projection = Camera.ProjectionType.ORTHO;
        camera.visibility = Layers.Enum.DEFAULT;

        // 設定正交相機高度
        camera.orthoHeight = AppConfig.DESIGN_HEIGHT / 2;
        log(
            `[AppScene] Camera Initialized - orthoHeight: ${camera.orthoHeight}, visibility: ${camera.visibility}`,
        );

        camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
        const c = AppConfig.CAMERA_CLEAR_COLOR;
        camera.clearColor = new Color(c.r, c.g, c.b, c.a);

        node.setPosition(0, 0, AppConfig.CAMERA_Z);

        return node;
    }
}
