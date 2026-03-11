import {
    _decorator,
    Component,
    Label,
    Button,
    Sprite,
    EditBox,
    Toggle,
    ScrollView,
    Node,
} from 'cc';

export class BaseUIController extends Component {
    /** 自動收集到的 UI 元件節點，key 為完整路徑 */
    protected views: Record<string, Node> = {};

    /**
     * 初始化
     */
    public init() {
        this.node.active = false; // 隱藏節點
        this.collectViews(this.node);
        console.log(this.name, this.views);
    }

    /**
     * 顯示
     */
    public show() {
        this.node.active = true;
    }

    /**
     * 隱藏
     */
    public hide() {
        this.node.active = false;
    }

    /**
     * 遞迴收集所有節點，並以完整路徑作為 key 儲存
     * @param node 當前節點
     * @param path 當前路徑（遞迴用）
     */
    protected collectViews(node: Node, path: string = '') {
        const currentPath = path ? `${path}/${node.name}` : node.name;

        this.views[currentPath] = node; // 存入 views

        // 遞迴收集子節點
        for (const child of node.children) {
            this.collectViews(child, currentPath);
        }
    }

    /**
     * 綁定按鈕事件
     * @param path 按鈕路徑
     * @param callback 回調函數
     */
    protected bindButtonEvent(path: string, callback: () => void) {
        const node = this.getNode(path);
        node?.on(Button.EventType.CLICK, callback);
    }

    /** 快速取得 Node */
    protected getNode(path: string): Node | undefined {
        return this.views[path];
    }

    /** 快速取得 Label */
    protected getLabel(path: string): Label | undefined {
        return this.getNode(path)?.getComponent(Label) || undefined;
    }

    /** 快速取得 Button */
    protected getButton(path: string): Button | undefined {
        return this.getNode(path)?.getComponent(Button) || undefined;
    }

    /** 快速取得 Sprite */
    protected getSprite(path: string): Sprite | undefined {
        return this.getNode(path)?.getComponent(Sprite) || undefined;
    }

    /** 快速取得 EditBox */
    protected getEditBox(path: string): EditBox | undefined {
        return this.getNode(path)?.getComponent(EditBox) || undefined;
    }

    /** 快速取得 Toggle */
    protected getToggle(path: string): Toggle | undefined {
        return this.getNode(path)?.getComponent(Toggle) || undefined;
    }

    /** 快速取得 ScrollView */
    protected getScrollView(path: string): ScrollView | undefined {
        return this.getNode(path)?.getComponent(ScrollView) || undefined;
    }
}
