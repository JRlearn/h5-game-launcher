import { _decorator, Component, Node, Layers, UITransform, Size, Widget, Layout } from 'cc';
import { SymbolData } from '../../model/SymbolData';
import { GameModel } from '../../model/GameModel';
import { NodeFactory } from '../../../../../../core/utils/NodeFactory';

const { ccclass, property } = _decorator;

/**
 * GridManager - 負責 6x5 網格節點創建、符號生成與佈局
 * 遵循 Cocos UI Generator 原則
 */
@ccclass('GridManager')
export class GridManager extends Component {
    /** 節點參照 */
    private _gridRootNode: Node | null = null;

    /** 單個圖騰容器尺寸設定 */
    private readonly SYMBOL_WIDTH = 100;
    private readonly SYMBOL_HEIGHT = 100;
    private readonly SPACING_X = 5;
    private readonly SPACING_Y = 5;

    private _columnCount: number = 6;
    private _rowCount: number = 5;

    protected onLoad(): void {
        // Init will be called externally
    }

    public init(cols: number, rows: number): void {
        this._columnCount = cols;
        this._rowCount = rows;
        this._buildUI();
    }

    /**
     * 主導方法：調度所有節點創建並組裝場景樹
     */
    private _buildUI(): void {
        this.node.getComponent(UITransform) || this.node.addComponent(UITransform);

        this._gridRootNode = this._createGridRoot();
        this.node.addChild(this._gridRootNode);
    }

    /**
     * 創建 Grid 主容器
     */
    private _createGridRoot(): Node {
        const gridNode = new Node('GridRoot');
        gridNode.layer = Layers.Enum.DEFAULT;

        const uiTransform = gridNode.addComponent(UITransform);
        // Set size based on columns and rows
        const cols = this._columnCount;
        const rows = this._rowCount;
        const totalWidth = cols * this.SYMBOL_WIDTH + (cols - 1) * this.SPACING_X;
        const totalHeight = rows * this.SYMBOL_HEIGHT + (rows - 1) * this.SPACING_Y;
        uiTransform.setContentSize(new Size(totalWidth, totalHeight));
        uiTransform.setAnchorPoint(0.5, 0.5);

        // 使用 Layout 以方便等距排列
        const layout = gridNode.addComponent(Layout);
        layout.type = Layout.Type.GRID;
        layout.resizeMode = Layout.ResizeMode.NONE;
        layout.startAxis = Layout.AxisDirection.HORIZONTAL;
        layout.paddingLeft = 0;
        layout.paddingTop = 0;
        layout.spacingX = this.SPACING_X;
        layout.spacingY = this.SPACING_Y;
        layout.cellSize = new Size(this.SYMBOL_WIDTH, this.SYMBOL_HEIGHT);

        return gridNode;
    }

    /**
     * 依照提供的 grid 資料，生成對應的占位元件
     */
    public async syncGridFromData(gridData: SymbolData[][]): Promise<void> {
        if (!this._gridRootNode) return;

        this._gridRootNode.removeAllChildren();

        const cols = gridData.length;
        const rows = gridData[0].length;

        // 假設 grid[col][row] 中 row 越多代表越低
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const symbolData = gridData[col][row];
                const blockNode = this._createSymbolBlock(symbolData);
                this._gridRootNode.addChild(blockNode);
            }
        }

        // Timeout 確保 Layout 更新 (hacky for demo)
        return new Promise((resolve) => setTimeout(resolve, 300));
    }

    /**
     * 產生單一格子節點
     * @param data 符號資料
     */
    private _createSymbolBlock(data: SymbolData): Node {
        const node = new Node(`Symbol_${data.id}`);
        node.layer = Layers.Enum.DEFAULT;
        const trans = node.addComponent(UITransform);
        trans.setContentSize(new Size(this.SYMBOL_WIDTH, this.SYMBOL_HEIGHT));

        // 加入背景色以利辦識不同 Token
        const colors = [
            '#FF0000',
            '#00FF00',
            '#0000FF',
            '#FFFF00',
            '#FF00FF',
            '#00FFFF',
            '#FFA500',
            '#800080',
            '#D4AF37',
            '#FF1493',
        ];
        const hex = colors[data.type] || '#FFFFFF';

        const { node: bgNode, sprite } = NodeFactory.createSpriteNode('bg');
        // _createSymbolBlock is just mock
        bgNode.layer = Layers.Enum.DEFAULT;
        sprite.color.fromHEX(hex);
        const bgTrans = bgNode.getComponent(UITransform);
        if (bgTrans) {
            bgTrans.setContentSize(this.SYMBOL_WIDTH - 10, this.SYMBOL_HEIGHT - 10);
        }
        node.addChild(bgNode);

        let displayTxt = data.type.toString();
        if (data.type === 8) displayTxt = 'S'; // Scatter
        if (data.type === 9) displayTxt = `M${data.multiplier}x`; // Multiplier

        const { label } = NodeFactory.createLabelNode('Val', displayTxt, 40);
        label.node.layer = Layers.Enum.DEFAULT;
        label.color.fromHEX('#000000');
        node.addChild(label.node);
        return node;
    }
}
