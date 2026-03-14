import {
    _decorator,
    Component,
    Node,
    Label,
    Color,
    UITransform,
    Size,
    Layout,
    Sprite,
    SpriteFrame,
    Color as ccColor,
    Button,
    EventHandler,
    Widget,
} from 'cc';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { ResManager } from '../../../../../core/systems/resource/ResManager';
import { GameConfig } from '../config/GameConfig';

const { ccclass, property } = _decorator;

/**
 * BetSelectionView - 下注金額選擇面板 (Iteration 23)
 * 遵循 cocos_ui_generator 架構規範：全代碼生成、私有建造器分離。
 */
@ccclass('BetSelectionView')
export class BetSelectionView extends Component {
    private _selectedBet: number = 10;
    private _onBetSelected: (bet: number) => void = () => {};
    private _rootNode: Node | null = null;
    private _betButtons: Node[] = [];

    public init(currentBet: number, onSelected: (bet: number) => void): void {
        this._selectedBet = currentBet;
        this._onBetSelected = onSelected;
        this._initUI();
    }

    /** 強制約束：唯一入口 */
    private _initUI(): void {
        this._buildUI();
    }

    private _buildUI(): void {
        this._rootNode = this._createMainPanel();
        this.node.addChild(this._rootNode);

        const title = this._createTitle();
        this._rootNode.addChild(title);

        const buttonGroup = this._createButtonGroup();
        this._rootNode.addChild(buttonGroup);

        const closeBtn = this._createCloseButton();
        this._rootNode.addChild(closeBtn);

        // 初始狀態更新
        this._updateButtonSelection();
    }

    private _createMainPanel(): Node {
        const node = new Node('MainPanel');
        const trans = node.addComponent(UITransform);
        trans.setContentSize(500, 600);

        // 背景
        const { node: bg } = NodeFactory.createSpriteNode('BG', new Color(0, 0, 0, 230));
        node.addChild(bg);
        bg.getComponent(UITransform)!.setContentSize(500, 600);

        // Iteration 22: 使用生成的裝飾邊框
        ResManager.getInstance()
            .load(
                GameConfig.getResBundleName(),
                'textures/zh-TW/egyptian_ornate_border',
                SpriteFrame,
            )
            .then((sf: SpriteFrame | null) => {
                if (sf && node.isValid) {
                    const borderNode = new Node('Border');
                    node.addChild(borderNode);
                    const s = borderNode.addComponent(Sprite);
                    s.spriteFrame = sf;
                    s.type = Sprite.Type.SLICED;
                    borderNode.addComponent(UITransform).setContentSize(520, 620);
                }
            });

        return node;
    }

    private _createTitle(): Node {
        const { node, label } = NodeFactory.createLabelNode('Title', 'SELECT BET', 32);
        node.setPosition(0, 240);
        label.color = Color.YELLOW;
        return node;
    }

    private _createButtonGroup(): Node {
        const node = new Node('ButtonGroup');
        node.setPosition(0, 0);
        const trans = node.addComponent(UITransform);
        trans.setContentSize(400, 400);

        const layout = node.addComponent(Layout);
        layout.type = Layout.Type.GRID;
        layout.cellSize = new Size(120, 80);
        layout.spacingX = 20;
        layout.spacingY = 20;
        layout.resizeMode = Layout.ResizeMode.CONTAINER;

        const betValues = [1, 2, 5, 10, 20, 50, 100, 200, 500];
        betValues.forEach((val) => {
            const btn = this._createBetButton(val);
            node.addChild(btn);
            this._betButtons.push(btn);
        });

        return node;
    }

    private _createBetButton(val: number): Node {
        const node = new Node(`Bet_${val}`);
        const trans = node.addComponent(UITransform);
        trans.setContentSize(120, 80);

        const { node: bg } = NodeFactory.createSpriteNode('BG', new Color(80, 80, 80));
        node.addChild(bg);
        bg.getComponent(UITransform)!.setContentSize(120, 80);

        const { label } = NodeFactory.createLabelNode('Label', val.toString(), 24);
        node.addChild(label.node);

        const btn = node.addComponent(Button);
        btn.target = bg;

        node.on(Node.EventType.TOUCH_END, () => {
            this._selectedBet = val;
            this._updateButtonSelection();
            this._onBetSelected(val);
        });

        return node;
    }

    private _createCloseButton(): Node {
        const node = new Node('CloseBtn');
        node.setPosition(0, -250);
        const trans = node.addComponent(UITransform);
        trans.setContentSize(200, 60);

        const { node: bg } = NodeFactory.createSpriteNode('BG', new Color(150, 50, 50));
        node.addChild(bg);
        bg.getComponent(UITransform)!.setContentSize(200, 60);

        const { node: txt } = NodeFactory.createLabelNode('Text', 'CLOSE', 24);
        node.addChild(txt);

        const btn = node.addComponent(Button);
        btn.target = bg;
        node.on(Node.EventType.TOUCH_END, () => {
            this.node.active = false;
        });

        return node;
    }

    private _updateButtonSelection(): void {
        this._betButtons.forEach((node) => {
            const val = parseInt(node.name.split('_')[1]);
            const bg = node.getChildByName('BG');
            if (bg) {
                const sprite = bg.getComponent(Sprite);
                if (sprite) {
                    sprite.color = val === this._selectedBet ? Color.YELLOW : new Color(80, 80, 80);
                }
            }
        });
    }
}
