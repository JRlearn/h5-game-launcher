import { Node, Layers, Button, EventHandler, UITransform } from 'cc';

/**
 * UIUtils - UI 工具類
 * 提供常用 UI 操作的封裝。
 */
export class UIUtils {
    /**
     * 遞迴設定節點及其子節點的層級
     * @param node 目標節點
     * @param layer 層級 (Layers.Enum)
     */
    public static setLayerRecursive(node: Node, layer: number): void {
        node.layer = layer;
        node.children.forEach((child) => {
            this.setLayerRecursive(child, layer);
        });
    }

    /**
     * 透過名稱遞迴尋找子節點
     * @param node 開始尋找的節點
     * @param name 目標名稱
     * @returns 找到的節點或 null
     */
    public static findChildByName(node: Node, name: string): Node | null {
        if (node.name === name) return node;
        for (const child of node.children) {
            const result = this.findChildByName(child, name);
            if (result) return result;
        }
        return null;
    }

    /**
     * 為按鈕安全地添加點擊回呼 (避免重複添加)
     * @param node 含有 Button 組件的節點或 Button 實例
     * @param callback 點擊回呼
     * @param target 呼叫對象
     */
    public static safeClick(node: Node | Button, callback: Function, target: any): void {
        const btn = node instanceof Node ? node.getComponent(Button) : node;
        if (!btn) return;

        btn.node.off(Button.EventType.CLICK);
        btn.node.on(Button.EventType.CLICK, callback, target);
    }
}
