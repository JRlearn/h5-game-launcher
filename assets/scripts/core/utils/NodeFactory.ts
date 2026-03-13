import {
    Node,
    Layers,
    UITransform,
    Size,
    Vec2,
    Component,
    Constructor,
    Label,
    Sprite,
    Color,
    ScrollView,
    Mask,
} from 'cc';

/**
 * NodeFactory - UI 管理與節點工廠
 *
 * 作為 UI 建立的「管理層」，統一處理：
 * 1. Layer 分配 (預設 DEFAULT，配合專案目前設定)
 * 2. 常用組件預設值 (Label, Sprite)
 * 3. 複雜結構封裝 (ScrollView + Mask)
 */
export class NodeFactory {
    /**
     * 建立基礎 UI 節點
     */
    public static createUINode(
        name: string,
        options: {
            size?: Size;
            anchor?: Vec2;
            layer?: number;
            parent?: Node;
        } = {},
    ): Node {
        const node = new Node(name);
        node.layer = options.layer ?? Layers.Enum.DEFAULT;
        
        // 強制 Z 軸歸零，避免 3D 警告
        node.setPosition(0, 0, 0);

        const uiTrans = node.addComponent(UITransform);
        if (options.size) uiTrans.setContentSize(options.size);
        if (options.anchor) uiTrans.setAnchorPoint(options.anchor);

        if (options.parent) {
            options.parent.addChild(node);
        }

        return node;
    }

    /**
     * 建立帶有 Label 的節點
     */
    public static createLabelNode(
        name: string,
        str: string,
        fontSize: number = 20,
    ): { node: Node; label: Label } {
        const node = this.createUINode(name);
        const label = node.addComponent(Label);
        label.string = str;
        label.fontSize = fontSize;
        label.lineHeight = fontSize;
        return { node, label };
    }

    /**
     * 建立帶有 Sprite 的節點
     */
    public static createSpriteNode(
        name: string,
        color: Color = Color.WHITE,
    ): { node: Node; sprite: Sprite } {
        const node = this.createUINode(name);
        const sprite = node.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.color = color;
        return { node, sprite };
    }

    /**
     * 建立標準 ScrollView 結構 (含遮罩 Mask)
     */
    public static createScrollView(
        name: string,
        size: Size,
    ): { node: Node; scrollView: ScrollView; content: Node; viewport: Node } {
        const root = this.createUINode(name, { size });
        const scrollView = root.addComponent(ScrollView);
        scrollView.horizontal = false;
        scrollView.vertical = true;

        // Viewport 必須包含 Mask
        const viewport = this.createUINode('Viewport', { size, parent: root });
        const mask = viewport.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT; // Mask.Type.GRAPHICS_RECT is 0

        const content = this.createUINode('Content', { parent: viewport });
        // 預設為垂直滾動錨點，水平滾動時需在外部自行調整或由組件控制
        content.getComponent(UITransform)?.setAnchorPoint(0.5, 1);

        scrollView.content = content;

        return { node: root, scrollView, content, viewport };
    }

    /**
     * 建立節點並掛載組件
     */
    public static createNodeWithComponent<T extends Component>(
        name: string,
        componentClass: Constructor<T>,
        options: {
            layer?: number;
            parent?: Node;
        } = {},
    ): { node: Node; component: T } {
        const node = new Node(name);
        node.layer = options.layer ?? Layers.Enum.DEFAULT;
        node.setPosition(0, 0, 0); // 強制 Z 軸為 0
        if (options.parent) options.parent.addChild(node);
        const component = node.addComponent(componentClass);
        return { node, component };
    }
}
