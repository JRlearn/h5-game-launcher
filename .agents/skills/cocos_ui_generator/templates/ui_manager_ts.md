# 全代碼生成 UI 腳本模板 (Cocos Creator 3.8.8)

```typescript
import { _decorator, Component, Node, Canvas, Widget, Camera, Color, Layers, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    protected onLoad(): void {
        this._buildUI();
    }

    /**
     * 主導方法：調度所有節點創建並組裝場景樹
     */
    private _buildUI(): void {
        const canvasNode = this._createCanvas();
        const cameraNode = this._createCamera();
        const gameRoot = this._createGameRoot();
        const lobbyRoot = this._createLobbyRoot();

        canvasNode.addChild(cameraNode);
        canvasNode.addChild(gameRoot);
        canvasNode.addChild(lobbyRoot);

        this.node.addChild(canvasNode);
    }

    /** Canvas 根節點 */
    private _createCanvas(): Node {
        const canvasNode = new Node('Canvas'); 
        canvasNode.layer = Layers.Enum.DEFAULT;

        const canvas = canvasNode.addComponent(Canvas);

        const widget = canvasNode.addComponent(Widget);
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
        widget.alignMode = Widget.AlignMode.ALWAYS;

        return canvasNode;
    }

    /** UI 專屬攝影機 */
    private _createCamera(): Node {
        const cameraNode = new Node('Camera'); 
        cameraNode.layer = Layers.Enum.DEFAULT;

        const camera = cameraNode.addComponent(Camera);
        camera.projection = Camera.ProjectionType.ORTHO;
        camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
        camera.clearColor = new Color(0, 0, 0, 255);
        camera.visibility = Layers.Enum.DEFAULT;

        cameraNode.setPosition(0, 0, 1000);
        return cameraNode;
    }

    /** GameRoot 節點 */
    private _createGameRoot(): Node {
        const node = new Node('GameRoot'); 
        node.layer = Layers.Enum.DEFAULT;
        const uiTransform = node.addComponent(UITransform);
        const widget = node.addComponent(Widget);
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;

        return node;
    }

    /** LobbyRoot 節點 */
    private _createLobbyRoot(): Node {
        const node = new Node('LobbyRoot'); 
        node.layer = Layers.Enum.DEFAULT;
        const uiTransform = node.addComponent(UITransform);

        return node;
    }
}
```
