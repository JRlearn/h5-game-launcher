import {
    Layout,
    Widget,
    Layers,
    Node,
    Color,
    UITransform,
    UIOpacity,
    Vec3,
    Size,
    tween,
    SpriteFrame,
    Sprite,
} from 'cc';
import { ViewBase } from '../../../../../core/game/base/mvc/view/ViewBase';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { GridManager } from '../components/grid/GridManager';
import { TopInfoPanel } from '../components/ui/TopInfoPanel';
import { ControlPanel } from '../components/ui/ControlPanel';
import { ResManager } from '../../../../../core/systems/resource/ResManager';
import { BigWinView } from './BigWinView';
import { WinHistoryView } from './WinHistoryView';
import { BetSelectionView } from './BetSelectionView';
import { FreeSpinIntroView } from './FreeSpinIntroView';
import { EffectManager } from '../components/ui/EffectManager';
import { GameConfig } from '../config/GameConfig';

/**
 * GameView - 戰神賽特主視圖 (UI元件化重構版)
 * 單一職責：組裝並管理三大區塊 (TopInfo, GridManager, ControlPanel) 的生命週期與橋接
 */
export class GameView extends ViewBase {
    public onSpinClick: () => void = () => {};
    public onBuyFeatureClick: () => void = () => {};
    public onAutoSpinToggle: (isOn: boolean) => void = () => {};
    public onTurboToggle: (isOn: boolean) => void = () => {};
    public onLowPowerToggle: (isOn: boolean) => void = () => {};
    public onBetChange: (bet: number) => void = () => {};

    private _gridManager: GridManager | null = null;
    private _topPanel: TopInfoPanel | null = null;
    private _controlPanel: ControlPanel | null = null;
    private _historyView: WinHistoryView | null = null;
    private _betSelectionView: BetSelectionView | null = null;

    public get gridManager(): GridManager | null {
        return this._gridManager;
    }

    public override init(): void {
        this._buildUI();
    }

    private _buildUI(): void {
        const rootTrans = this.getUITransform();
        rootTrans.setContentSize(1280, 720);

        // 1. 背景層
        const bgNode = this._createBackground();
        this.addChild(bgNode);

        // 2. 角色層 (裝飾性)
        this._createCharacters();

        // 3. 核心內容容器
        const mainContainer = new Node('MainContainer');
        mainContainer.addComponent(UITransform).setContentSize(1280, 720);
        mainContainer.addComponent(Widget).alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        const mainWidget = mainContainer.getComponent(Widget)!;
        mainWidget.isAlignTop = mainWidget.isAlignBottom = mainWidget.isAlignLeft = mainWidget.isAlignRight = true;
        mainWidget.top = mainWidget.bottom = mainWidget.left = mainWidget.right = 0;
        this.addChild(mainContainer);

        // 4. 特效層
        const effectNode = new Node('EffectManager');
        effectNode.addComponent(EffectManager);
        mainContainer.addChild(effectNode);

        // 5. 頂部資訊 (Jackpot Bar)
        const topNode = new Node('TopPanel');
        this._topPanel = topNode.addComponent(TopInfoPanel);
        mainContainer.addChild(topNode);
        const topWidget = topNode.addComponent(Widget);
        topWidget.isAlignTop = true;
        topWidget.top = 0;
        topWidget.isAlignHorizontalCenter = true;

        // 6. 核心滾軸區 (Grid Area)
        const gridArea = this._createGridArea();
        mainContainer.addChild(gridArea);
        const gridWidget = gridArea.addComponent(Widget);
        gridWidget.isAlignHorizontalCenter = true;
        gridWidget.isAlignVerticalCenter = true;
        gridWidget.verticalCenter = -20;

        // 6.1 特色說明標籤 (Grid 上方)
        const infoNode = new Node('FeatureInfo');
        mainContainer.addChild(infoNode);
        infoNode.setPosition(0, 280);
        const { label: infoLbl } = NodeFactory.createLabelNode('Text', '出現 ◎ 可乘上贏分', 24);
        infoLbl.color = new Color(0, 255, 127); // 亮綠色
        infoNode.addChild(infoLbl.node);

        // 7. 控制面板 (Bottom Bar + Spin Button)
        const controlNode = new Node('ControlPanel');
        this._controlPanel = controlNode.addComponent(ControlPanel);
        this._bindControlEvents();
        mainContainer.addChild(controlNode);
        const ctrlWidget = controlNode.addComponent(Widget);
        ctrlWidget.isAlignBottom = true;
        ctrlWidget.bottom = 0;
        ctrlWidget.isAlignHorizontalCenter = true;

        // 8. 其他視圖
        const histNode = new Node('WinHistory');
        this.addChild(histNode);
        histNode.active = false;
        this._historyView = histNode.addComponent(WinHistoryView);

        const betNode = new Node('BetSelection');
        this.addChild(betNode);
        betNode.active = false;
        this._betSelectionView = betNode.addComponent(BetSelectionView);
    }

    private _createCharacters(): void {
        const charLayer = new Node('CharacterLayer');
        charLayer.addComponent(UITransform).setContentSize(1280, 720);
        const widget = charLayer.addComponent(Widget);
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = widget.bottom = widget.left = widget.right = 0;
        this.addChild(charLayer);

        // 左側角色 (使用 Widget 靠左)
        const leftChar = NodeFactory.createSpriteNode('LeftCharacter').node;
        charLayer.addChild(leftChar);
        const leftWidget = leftChar.addComponent(Widget);
        leftWidget.isAlignLeft = true;
        leftWidget.left = 0;
        leftWidget.isAlignVerticalCenter = true;
        leftWidget.verticalCenter = 0;

        ResManager.getInstance()
            .load(GameConfig.getResBundleName(), 'textures/set_symbol/spriteFrame', SpriteFrame)
            .then((sf) => {
                if (sf && leftChar.isValid) {
                    const sprite = leftChar.getComponent(Sprite)!;
                    sprite.spriteFrame = sf;
                    leftChar.setScale(1.5, 1.5);
                }
            });

        // 右側角色 (使用 Widget 靠右)
        const rightChar = NodeFactory.createSpriteNode('RightCharacter').node;
        charLayer.addChild(rightChar);
        const rightWidget = rightChar.addComponent(Widget);
        rightWidget.isAlignRight = true;
        rightWidget.right = 0;
        rightWidget.isAlignVerticalCenter = true;
        rightWidget.verticalCenter = 0;

        ResManager.getInstance()
            .load(GameConfig.getResBundleName(), 'textures/pharaoh_symbol/spriteFrame', SpriteFrame)
            .then((sf) => {
                if (sf && rightChar.isValid) {
                    const sprite = rightChar.getComponent(Sprite)!;
                    sprite.spriteFrame = sf;
                    rightChar.setScale(1.5, 1.5);
                }
            });
    }

    private _bindControlEvents(): void {
        if (!this._controlPanel) return;
        this._controlPanel.onSpinClick = () => this.onSpinClick();
        this._controlPanel.onBuyFeatureClick = () => this.onBuyFeatureClick();
        this._controlPanel.onAutoSpinToggle = (i: boolean) => this.onAutoSpinToggle(i);
        this._controlPanel.onTurboToggle = (i: boolean) => this.onTurboToggle(i);
        this._controlPanel.onLowPowerToggle = (i: boolean) => this.onLowPowerToggle(i);
        this._controlPanel.onBetChange = (val: number) => this.onBetChange(val);
    }

    private _createBackground(): Node {
        const { node, sprite } = NodeFactory.createSpriteNode('Background');
        ResManager.getInstance()
            .load(GameConfig.getResBundleName(), 'textures/storm_bg/spriteFrame', SpriteFrame)
            .then((sf) => {
                if (sf && node.isValid) sprite.spriteFrame = sf;
            });

        const widget = node.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        return node;
    }

    private _createGridArea(): Node {
        const { node: area, sprite } = NodeFactory.createSpriteNode('GridArea');
        const trans = area.getComponent(UITransform)!;
        trans.setContentSize(720, 560);

        ResManager.getInstance()
            .load(GameConfig.getResBundleName(), 'textures/egyptian_ornate_border/spriteFrame', SpriteFrame)
            .then(sf => {
                if (sf && area.isValid) {
                    sprite.spriteFrame = sf;
                    sprite.type = Sprite.Type.SLICED;
                }
            });

        const { component: gridManager } = NodeFactory.createNodeWithComponent(
            'GridManager_Node',
            GridManager,
            { parent: area },
        );
        this._gridManager = gridManager as GridManager;
        this._gridManager.node.setPosition(0, 0);

        return area;
    }

    public updateBalance(val: number): void {
        if (this._controlPanel) this._controlPanel.updateBalance(val);
    }

    public updateWin(val: number): void {
        if (this._controlPanel) this._controlPanel.updateWin(val);
    }

    public updateFreeSpin(val: number): void {
        if (this._topPanel) this._topPanel.updateFreeSpin(val);
    }

    public updateMultiplier(val: number): void {
        if (this._topPanel) this._topPanel.updateMultiplier(val);
    }

    public async playMultiplierCollectAnimation(
        startWorldPos: Vec3,
        multiplierVal: number,
        isTurbo: boolean = false,
    ): Promise<void> {
        if (!this._topPanel) return;

        const targetWorldPos = this._topPanel.getMultiplierWorldPosition();
        const duration = isTurbo ? 0.3 : 0.6;

        // 建立一個臨時的飛行光球
        const orb = new Node('MultiplierOrb');
        orb.layer = Layers.Enum.DEFAULT;
        this.addChild(orb);
        orb.worldPosition = startWorldPos;

        const { label } = NodeFactory.createLabelNode('Val', `${multiplierVal}x`, 30);
        label.color = Color.YELLOW;
        orb.addChild(label.node);

        return new Promise((resolve) => {
            tween(orb)
                .to(
                    duration,
                    { worldPosition: targetWorldPos, scale: new Vec3(0.5, 0.5, 0.5) },
                    { easing: 'backIn' },
                )
                .call(() => {
                    orb.destroy();
                    resolve();
                })
                .start();
        });
    }

    public playWinFountainEffect(): void {
        EffectManager.getInstance().playWinFountain(new Vec3(0, -300, 0), 30);
    }

    public updateHistory(amount: number): void {
        if (this._historyView) {
            this._historyView.addRecord(amount);
        }
    }

    public showBetSelection(currentBet: number): void {
        if (this._betSelectionView) {
            this._betSelectionView.node.active = true;
            this._betSelectionView.init(currentBet, (val) => {
                this.onBetChange(val);
                this._betSelectionView!.node.active = false;
            });
        }
    }

    public setNightMode(isNight: boolean): void {
        const bg = this.root.getChildByName('Background');
        if (bg) {
            const sprite = bg.getComponent(Sprite);
            if (sprite) {
                const targetColor = isNight ? new Color(100, 100, 255) : Color.WHITE;
                tween(sprite).to(1.0, { color: targetColor }).start();
            }
        }
    }

    public shakeScreen(duration: number = 0.5, strength: number = 20): void {
        const container = this.root.getChildByName('MainContainer');
        if (!container) return;
        const oPos = container.position.clone();
        tween(container)
            .to(0.05, { position: new Vec3(oPos.x + strength, oPos.y + strength, 0) })
            .to(0.05, { position: new Vec3(oPos.x - strength, oPos.y - strength, 0) })
            .to(0.05, { position: new Vec3(oPos.x + strength, oPos.y - strength, 0) })
            .to(0.05, { position: new Vec3(oPos.x - strength, oPos.y + strength, 0) })
            .union()
            .repeat(Math.floor(duration / 0.2))
            .to(0.1, { position: oPos })
            .start();
    }

    public showBigWin(amount: number, callback?: () => void): void {
        const node = new Node('BigWinPopup');
        this.addChild(node);
        const view = node.addComponent(BigWinView);
        view.show(amount, callback);
    }

    public showFreeSpinIntro(callback?: () => void): void {
        const node = new Node('FreeSpinIntro');
        this.addChild(node);
        const view = node.addComponent(FreeSpinIntroView);
        view.show(callback);
    }
}
