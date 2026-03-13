import { _decorator, Camera, Canvas, Color, Component, Node, Widget, log, Size, Layers } from 'cc';
import { SceneManager } from './framework/manager/system/SceneManager';
import { AppConfig } from './config/AppConfig';
import { NodeFactory } from './core/utils/NodeFactory';
import { OrientationManager, OrientationType } from './framework/manager/ui/OrientationManager';
import { OrientationTip } from './framework/manager/ui/OrientationTip';
import { ScreenAdapter } from './framework/manager/system/ScreenAdapter';

const { ccclass } = _decorator;

/**
 * AppScene - 核心主畫面控制器
 * 負責單場景架構的基礎容器（Canvas, Roots）初始化。
 */
@ccclass('AppScene')
export class AppScene extends Component {
    private _canvasNode!: Node;
    private _uiRoot!: Node;
    private _gameRoot!: Node;
    private _lobbyRoot!: Node;
    private _camera!: Camera;
    private _orientationTip!: OrientationTip;
    private _screenAdapter!: ScreenAdapter;

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
        this._uiRoot = this._createUIRoot();
        this._gameRoot = this._createGameRoot();
        this._lobbyRoot = this._createLobbyRoot();

        // 使用 DEFAULT 層級，這是專案目前的標準
        const uiLayer = Layers.Enum.DEFAULT;
        this._canvasNode.layer =
            this._uiRoot.layer =
            this._gameRoot.layer =
            this._lobbyRoot.layer =
                uiLayer;

        const cameraNode = this._createCamera();

        this._canvasNode.addChild(cameraNode);
        this._canvasNode.addChild(this._uiRoot);
        this._canvasNode.addChild(this._gameRoot);
        this._canvasNode.addChild(this._lobbyRoot);

        // 建立旋轉提示層 (放在 Canvas 內最上方)
        // const tipNode = new Node('OrientationTip');
        // tipNode.layer = Layers.Enum.UI_2D;
        // this._canvasNode.addChild(tipNode);
        // this._orientationTip = tipNode.addComponent(OrientationTip) as any;

        this.node.addChild(this._canvasNode);

        // 初始化 SceneManager 的掛載點
        SceneManager.getInstance().init(this._gameRoot, this._lobbyRoot);

        // 初始化螢幕適配器
        this._screenAdapter = new ScreenAdapter(this._canvasNode);

        log('[AppScene] ✅ 基礎層級建立完成 (Layer: UI_2D)');
    }

    /**
     * 當螢幕尺寸或方向改變時觸發 (H5 適配核心)
     */
    private _onScreenResize(): void {
        // 1. 透過適配器更新解析度配置
        if (this._screenAdapter) {
            this._screenAdapter.update();
        }

        // 2. 更新相機視野 (orthoHeight)
        if (this._camera) {
            // 確保相機始終覆蓋設計高度
            this._camera.orthoHeight = AppConfig.DESIGN_HEIGHT / 2;
        }

        // 3. 更新旋轉提示
        if (this._orientationTip) {
            this._orientationTip.updateVisibility();
        }

        // 4. 對內容根節點進行動態縮放 (若需要 Fit 效果)
        const fitScale = this._screenAdapter ? this._screenAdapter.getAdaptiveScale() : 1;
        this._gameRoot.setScale(fitScale, fitScale, 1);
    }

    /**
     * 建立 Canvas 根節點
     */
    private _createCanvas(): Node {
        const node = NodeFactory.createUINode('Canvas', {
            size: new Size(AppConfig.DESIGN_WIDTH, AppConfig.DESIGN_HEIGHT),
        });
        const canvas = node.getComponent(Canvas) || node.addComponent(Canvas);
        canvas.alignCanvasWithScreen = true;

        // 初始化全螢幕 Widget
        const widget = node.getComponent(Widget) || node.addComponent(Widget);
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

    /**
     * 為節點添加全螢幕 Widget 組件
     * @param node 目標節點
     */
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
        this._camera = node.addComponent(Camera);

        // 設定為正交投影
        this._camera.projection = Camera.ProjectionType.ORTHO;

        // 設定正交相機高度
        this._camera.orthoHeight = AppConfig.DESIGN_HEIGHT / 2;

        log(
            `[AppScene] Camera Initialized - orthoHeight: ${this._camera.orthoHeight}, Visibility set to ALL (-1)`,
        );

        this._camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
        const c = AppConfig.CAMERA_CLEAR_COLOR;
        this._camera.clearColor = new Color(c.r, c.g, c.b, c.a);

        node.setPosition(0, 0, AppConfig.CAMERA_Z);

        return node;
    }
}
