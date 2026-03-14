import {
    _decorator,
    Component,
    Node,
    Layers,
    UITransform,
    Size,
    Layout,
    Color,
    Sprite,
    tween,
    Vec3,
} from 'cc';
import { SymbolData } from '../../model/SymbolData';
import { ClusterInfo } from '../../model/ClusterLogic';
import { StormSymbol } from './StormSymbol';
import { EffectManager } from '../ui/EffectManager';

const { ccclass, property } = _decorator;

/**
 * GridManager - 負責 6x5 網格節點創建、符號生成與佈局 (UI 元件化重構版)
 * 單一職責：管理掉落層的實體 StormSymbol 物件
 */
@ccclass('GridManager')
export class GridManager extends Component {
    private _gridRootNode: Node | null = null;
    private _symbolsMap: Map<number, StormSymbol> = new Map();

    private readonly SYMBOL_WIDTH = 100;
    private readonly SYMBOL_HEIGHT = 100;
    private readonly SPACING_X = 5;
    private readonly SPACING_Y = 5;

    private _isTurbo: boolean = false;
    private _isLowPower: boolean = false;
    private _columnCount: number = 6;
    private _rowCount: number = 5;

    public set isTurbo(val: boolean) {
        this._isTurbo = val;
    }
    public set isLowPower(val: boolean) {
        this._isLowPower = val;
    }

    public init(cols: number, rows: number): void {
        this._columnCount = cols;
        this._rowCount = rows;
        this._buildUI();
    }

    private _buildUI(): void {
        this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        this._gridRootNode = this._createGridRoot();
        this.node.addChild(this._gridRootNode);
    }

    private _createGridRoot(): Node {
        const gridNode = new Node('GridRoot');
        gridNode.layer = Layers.Enum.DEFAULT;
        const uiTransform = gridNode.addComponent(UITransform);
        const totalWidth =
            this._columnCount * this.SYMBOL_WIDTH + (this._columnCount - 1) * this.SPACING_X;
        const totalHeight =
            this._rowCount * this.SYMBOL_HEIGHT + (this._rowCount - 1) * this.SPACING_Y;
        uiTransform.setContentSize(new Size(totalWidth, totalHeight));
        uiTransform.setAnchorPoint(0.5, 0.5);

        const layout = gridNode.addComponent(Layout);
        layout.type = Layout.Type.GRID;
        layout.resizeMode = Layout.ResizeMode.NONE;
        layout.startAxis = Layout.AxisDirection.HORIZONTAL;
        layout.spacingX = this.SPACING_X;
        layout.spacingY = this.SPACING_Y;
        layout.cellSize = new Size(this.SYMBOL_WIDTH, this.SYMBOL_HEIGHT);

        return gridNode;
    }

    public async syncGridFromData(gridData: SymbolData[][]): Promise<void> {
        if (!this._gridRootNode) return;
        this._gridRootNode.removeAllChildren();
        this._symbolsMap.clear();

        const promises: Promise<void>[] = [];
        let scatterCount = 0;

        for (let col = 0; col < gridData.length; col++) {
            for (let row = 0; row < gridData[col].length; row++) {
                const data = gridData[col][row];
                if (data.type === 8) scatterCount++;

                const symbolNode = new Node(`Symbol_${data.id}`);
                const stormSymbol = symbolNode.addComponent(StormSymbol);
                this._gridRootNode.addChild(symbolNode);
                stormSymbol.init(data, this.SYMBOL_WIDTH);
                this._symbolsMap.set(data.id, stormSymbol);

                let delay = col * 0.1 + (this._rowCount - row) * 0.05;
                let duration = 0.4;

                if (this._isTurbo) {
                    delay *= 0.5;
                    duration = 0.15;
                }

                let suspense = false;
                if (scatterCount >= 3 && col >= 3 && !this._isTurbo) {
                    delay += 0.5;
                    duration = 0.8;
                    suspense = true;
                } else if (scatterCount >= 3 && col >= 3 && this._isTurbo) {
                    delay += 0.1;
                    duration = 0.3;
                    suspense = true;
                }

                promises.push(stormSymbol.playDrop(delay, duration, suspense));
            }
        }
        await Promise.all(promises);
    }

    public getSymbolWorldPosition(symbolId: number): Vec3 {
        const stormSymbol = this._symbolsMap.get(symbolId);
        return stormSymbol ? stormSymbol.node.worldPosition : new Vec3();
    }

    public async eliminateSymbols(clusters: ClusterInfo[]): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const cluster of clusters) {
            for (const symbol of cluster.symbols) {
                const stormSymbol = this._symbolsMap.get(symbol.id);
                if (stormSymbol) {
                    this._playExplosionEffect(stormSymbol.node.position, stormSymbol.getColor());
                    promises.push(
                        stormSymbol.playExplode(this._isTurbo).then(() => {
                            this._symbolsMap.delete(symbol.id);
                        }),
                    );
                }
            }
        }
        await Promise.all(promises);
    }

    /**
     * 執行掉落補滿動畫 (Cascade Refill)
     * @param nextGridData 下一階段的完整網格資料
     */
    public async refillGrid(nextGridData: SymbolData[][]): Promise<void> {
        if (!this._gridRootNode) return;

        const promises: Promise<void>[] = [];
        const newSymbolsMap: Map<number, StormSymbol> = new Map();

        for (let col = 0; col < nextGridData.length; col++) {
            let dropCount = 0;
            for (let row = nextGridData[col].length - 1; row >= 0; row--) {
                const data = nextGridData[col][row];
                let stormSymbol = this._symbolsMap.get(data.id);

                const targetX = (col - (this._columnCount - 1) / 2) * (this.SYMBOL_WIDTH + this.SPACING_X);
                const targetY = (row - (this._rowCount - 1) / 2) * (this.SYMBOL_HEIGHT + this.SPACING_Y);
                const targetPos = new Vec3(targetX, targetY, 0);

                if (stormSymbol) {
                    // 已存在的符號，如果位置不對則掉落
                    if (!stormSymbol.node.position.equals(targetPos)) {
                        promises.push(this._playMoveAnimation(stormSymbol.node, targetPos));
                    }
                    newSymbolsMap.set(data.id, stormSymbol);
                } else {
                    // 新生成的符號，從上方掉入
                    const symbolNode = new Node(`Symbol_${data.id}`);
                    stormSymbol = symbolNode.addComponent(StormSymbol);
                    this._gridRootNode.addChild(symbolNode);
                    stormSymbol.init(data, this.SYMBOL_WIDTH);
                    
                    // 設定初始位置 (在頂部之上)
                    dropCount++;
                    const startY = (this._rowCount / 2 + dropCount) * (this.SYMBOL_HEIGHT + this.SPACING_Y);
                    symbolNode.setPosition(targetX, startY, 0);

                    promises.push(stormSymbol.playDrop(col * 0.05, 0.3, false));
                    newSymbolsMap.set(data.id, stormSymbol);
                }
            }
        }

        this._symbolsMap = newSymbolsMap;
        await Promise.all(promises);
    }

    private _playMoveAnimation(node: Node, targetPos: Vec3): Promise<void> {
        return new Promise((resolve) => {
            tween(node)
                .to(0.2, { position: targetPos }, { easing: 'sineIn' })
                .call(() => resolve())
                .start();
        });
    }

    private _playExplosionEffect(pos: Vec3, color: Color): void {
        if (this._isLowPower) return;
        EffectManager.getInstance().playExplosionSmoke(pos, color);
    }
}
