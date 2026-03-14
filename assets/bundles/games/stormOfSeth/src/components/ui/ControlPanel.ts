import {
    _decorator,
    Component,
    Node,
    Color,
    UITransform,
    Layout,
    SpriteFrame,
    Rect,
    Sprite,
    Button,
    Layers,
    Label,
} from 'cc';
import { NodeFactory } from '../../../../../../core/utils/NodeFactory';
import { ResManager } from '../../../../../../core/systems/resource/ResManager';
import { LanguageManager } from '../../../../../../core/systems/language/LanguageManager';
import { GameConfig } from '../../config/GameConfig';

const { ccclass } = _decorator;

/**
 * ControlPanel - 控制按鈕區元件
 * 單一職責：生成主控按鈕與發送事件
 */
@ccclass('ControlPanel')
export class ControlPanel extends Component {
    public onSpinClick: () => void = () => {};
    public onBuyFeatureClick: () => void = () => {};
    public onAutoSpinToggle: (isOn: boolean) => void = () => {};
    public onTurboToggle: (isOn: boolean) => void = () => {};
    public onLowPowerToggle: (isOn: boolean) => void = () => {};
    public onBetChange: (val: number) => void = () => {};

    private _isAuto = false;
    private _isTurbo = false;
    private _isLowPower = false;
    private _currentBet = 10;

    private _balanceLabel: Label | null = null;
    private _winLabel: Label | null = null;
    private _betLabel: Label | null = null;

    protected onLoad(): void {
        this._buildUI();
    }

    private _buildUI(): void {
        const trans = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        trans.setContentSize(1280, 150);

        // 1. 底部資訊條 (Points, Win, Bet)
        const infoBar = new Node('InfoBar');
        this.node.addChild(infoBar);
        infoBar.setPosition(0, -20);
        const infoTrans = infoBar.addComponent(UITransform);
        infoTrans.setContentSize(1280, 80);
        
        // 背景
        const barBg = NodeFactory.createSpriteNode('BarBg', new Color(0, 0, 0, 180)).node;
        infoBar.addChild(barBg);
        barBg.getComponent(UITransform)!.setContentSize(1280, 80);

        // A. 餘額 (左側)
        const balanceNode = this._createDisplayBox('點數', '57,358.00', -400);
        infoBar.addChild(balanceNode);
        this._balanceLabel = balanceNode.getChildByName('Val')!.getComponent(Label);

        // B. 贏分 (中間)
        const winNode = this._createDisplayBox('贏分', '0.00', 0);
        infoBar.addChild(winNode);
        this._winLabel = winNode.getChildByName('Val')!.getComponent(Label);

        // C. 押注 (右側)
        const betNode = this._createBetControl(350);
        infoBar.addChild(betNode);

        // 2. 右側懸浮控制區 (Spin, Auto, Turbo, Menu)
        const controlGroup = new Node('ControlGroup');
        this.node.addChild(controlGroup);
        controlGroup.setPosition(520, 100);

        // A. Spin 按鈕 (巨大圓形)
        const spinBtn = this._createCircularBtn('SPIN', new Color(180, 0, 255), 140, () => this.onSpinClick());
        controlGroup.addChild(spinBtn);

        // B. Turbo 按鈕 (Spin 左上方)
        const turboBtn = this._createSmallCircularBtn('Turbo', -80, 80, () => {
            this._isTurbo = !this._isTurbo;
            turboBtn.getComponent(Sprite)!.color = this._isTurbo ? Color.YELLOW : Color.WHITE;
            this.onTurboToggle(this._isTurbo);
        });
        controlGroup.addChild(turboBtn);

        // C. Auto 按鈕 (Spin 左下方)
        const autoBtn = this._createSmallCircularBtn('Auto', -80, -40, () => {
            this._isAuto = !this._isAuto;
            autoBtn.getComponent(Sprite)!.color = this._isAuto ? Color.GREEN : Color.WHITE;
            this.onAutoSpinToggle(this._isAuto);
        });
        controlGroup.addChild(autoBtn);

        // D. Menu 按鈕 (Spin 正上方)
        const menuBtn = this._createSmallCircularBtn('Menu', 0, 100, () => {});
        controlGroup.addChild(menuBtn);

        // 3. Buy Feature 按鈕 (左側懸浮)
        const buyBtnNode = new Node('BuyFeature');
        this.node.addChild(buyBtnNode);
        buyBtnNode.setPosition(-500, 120);
        const buyBtn = this._createRectBtn('購買免費遊戲\n3,000.00', new Color(139, 69, 19), 180, 80, () => this.onBuyFeatureClick());
        buyBtnNode.addChild(buyBtn);
    }

    private _createDisplayBox(title: string, val: string, x: number): Node {
        const node = new Node(title);
        node.setPosition(x, 0);
        
        const { label: titleLbl } = NodeFactory.createLabelNode('Title', title, 18);
        titleLbl.color = new Color(200, 200, 200);
        titleLbl.node.setPosition(0, 15);
        node.addChild(titleLbl.node);

        const { label: valLbl } = NodeFactory.createLabelNode('Val', val, 24);
        valLbl.color = Color.WHITE;
        valLbl.node.setPosition(0, -15);
        node.addChild(valLbl.node);

        return node;
    }

    private _createBetControl(x: number): Node {
        const node = new Node('BetControl');
        node.setPosition(x, 0);
        const trans = node.addComponent(UITransform);
        trans.setContentSize(300, 60);

        // 背景
        const bg = NodeFactory.createSpriteNode('Bg', new Color(40, 40, 40)).node;
        node.addChild(bg);
        bg.getComponent(UITransform)!.setContentSize(200, 50);

        // 數值
        const { label } = NodeFactory.createLabelNode('Val', this._currentBet.toString(), 24);
        this._betLabel = label;
        node.addChild(label.node);

        // 減號
        const minusBtn = this._createRectBtn('-', new Color(80, 80, 80), 40, 40, () => {
            this._currentBet = Math.max(1, this._currentBet - 1);
            this._betLabel!.string = this._currentBet.toString();
            this.onBetChange(this._currentBet);
        });
        minusBtn.setPosition(-120, 0);
        node.addChild(minusBtn);

        // 加號
        const plusBtn = this._createRectBtn('+', new Color(80, 80, 80), 40, 40, () => {
            this._currentBet += 1;
            this._betLabel!.string = this._currentBet.toString();
            this.onBetChange(this._currentBet);
        });
        plusBtn.setPosition(120, 0);
        node.addChild(plusBtn);

        const title = NodeFactory.createLabelNode('Title', '押注', 16).label;
        title.node.setPosition(0, 35);
        node.addChild(title.node);

        return node;
    }

    private _createCircularBtn(name: string, color: Color, size: number, callback: Function): Node {
        const { node, sprite } = NodeFactory.createSpriteNode(name, color);
        node.getComponent(UITransform)!.setContentSize(size, size);
        
        // 模擬圓形 (Cocos 3.8 全代碼畫圓較麻煩，這裡先用方塊，讀者可替換圓形資源)
        ResManager.getInstance()
            .load(GameConfig.getResBundleName(), 'textures/ui_elements/spriteFrame', SpriteFrame)
            .then(sf => {
                if (sf && node.isValid) {
                    sprite.spriteFrame = sf;
                    sprite.color = color;
                }
            });

        const btn = node.addComponent(Button);
        btn.transition = Button.Transition.SCALE;
        node.on(Button.EventType.CLICK, callback, this);

        return node;
    }

    private _createSmallCircularBtn(name: string, x: number, y: number, callback: Function): Node {
        const node = this._createCircularBtn(name, Color.WHITE, 60, callback);
        node.setPosition(x, y);
        return node;
    }

    private _createRectBtn(text: string, color: Color, w: number, h: number, callback: Function): Node {
        const { node } = NodeFactory.createSpriteNode('Btn', color);
        node.getComponent(UITransform)!.setContentSize(w, h);
        
        const { label } = NodeFactory.createLabelNode('Label', text, 20);
        node.addChild(label.node);

        const btn = node.addComponent(Button);
        btn.transition = Button.Transition.SCALE;
        node.on(Button.EventType.CLICK, callback, this);

        return node;
    }

    public updateBalance(val: number): void {
        if (this._balanceLabel) this._balanceLabel.string = val.toLocaleString();
    }

    public updateWin(val: number): void {
        if (this._winLabel) this._winLabel.string = val.toLocaleString();
    }
}
