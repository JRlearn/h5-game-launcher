import { _decorator, Node, Label, Sprite, SpriteFrame, Color, assetManager } from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { ResManager } from '../../../../../scripts/framework/manager/resource/ResManager';
import { UIComponentBase } from '../../../../../scripts/core/base/ui/UIComponentBase';
import { NodeFactory } from '../../../../../scripts/core/utils/NodeFactory';

const { ccclass } = _decorator;

/**
 * GameListItem - 遊戲卡片 (優化版)
 */
@ccclass('GameListItem')
export class GameListItem extends UIComponentBase {
    private _iconSprite!: Sprite;
    private _nameLabel!: Label;
    private _jackpotLabel!: Label;
    private _jackpotContainer!: Node;
    private _tagHot!: Node;
    private _tagNew!: Node;

    private _gameData: IGameData | null = null;
    private _onEnterCallback: ((gameId: string, bundleName: string) => void) | null = null;

    protected createUI(): void {
        this.getUITransform().setContentSize(200, 260);

        // 1. Background
        NodeFactory.createSpriteNode('Background', new Color(45, 50, 60, 255)).node.setParent(this.node);
        this.getUITransform(this.node.getChildByName('Background')!).setContentSize(200, 260);

        // 2. Icon
        const { node: iconNode, sprite: iconSprite } = NodeFactory.createSpriteNode('Icon');
        this.getUITransform(iconNode).setContentSize(160, 160);
        iconNode.setPosition(0, 30);
        this.node.addChild(iconNode);
        this._iconSprite = iconSprite;

        // 3. Name
        const { node: nameNode, label: nameLabel } = NodeFactory.createLabelNode('NameLabel', '', 22);
        this.getUITransform(nameNode).setContentSize(180, 40);
        nameNode.setPosition(0, -70);
        nameLabel.overflow = Label.Overflow.SHRINK;
        this.node.addChild(nameNode);
        this._nameLabel = nameLabel;

        // 4. Jackpot
        this._jackpotContainer = NodeFactory.createUINode('JackpotContainer', { parent: this.node });
        this._jackpotContainer.setPosition(0, -105);
        this._jackpotContainer.active = false;
        
        const { label: jpLabel } = NodeFactory.createLabelNode('JackpotLabel', '', 18);
        jpLabel.node.setParent(this._jackpotContainer);
        jpLabel.color = new Color(255, 215, 0); 
        this._jackpotLabel = jpLabel;

        // 5. Tags
        this._tagHot = this._createTag('HOT', new Color(255, 60, 60));
        this._tagHot.setPosition(70, 100);
        this._tagHot.active = false;
        this.node.addChild(this._tagHot);

        this._tagNew = this._createTag('NEW', new Color(60, 255, 60));
        this._tagNew.setPosition(-70, 100);
        this._tagNew.active = false;
        this.node.addChild(this._tagNew);

        // 事件綁定
        this.node.on(Node.EventType.TOUCH_END, this._onEnter, this);
    }

    private _createTag(text: string, bgColor: Color): Node {
        const { node, sprite } = NodeFactory.createSpriteNode(`Tag_${text}`, bgColor);
        this.getUITransform(node).setContentSize(50, 24);

        const { label } = NodeFactory.createLabelNode('Label', text, 14);
        label.color = Color.WHITE;
        node.addChild(label.node);
        return node;
    }

    public setup(data: IGameData, onEnter: (gameId: string, bundleName: string) => void): void {
        this.initUI();
        this._gameData = data;
        this._onEnterCallback = onEnter;

        if (this._nameLabel) this._nameLabel.string = data.name;
        
        const hasJackpot = data.jackpot !== undefined && data.jackpot > 0;
        this._jackpotContainer.active = hasJackpot;
        if (hasJackpot && this._jackpotLabel) {
            this._jackpotLabel.string = this._formatJackpot(data.jackpot!);
        }

        if (this._tagHot) this._tagHot.active = !!data.isHot;
        if (this._tagNew) this._tagNew.active = !!data.isNew;

        if (data.iconPath) {
            this._loadIcon(data.bundleName, data.iconPath);
        }
    }

    private _onEnter(): void {
        if (!this._gameData || !this._onEnterCallback) return;
        this._onEnterCallback(this._gameData.id, this._gameData.bundleName);
    }

    private _formatJackpot(amount: number): string {
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `${Math.floor(amount / 1_000)}K`;
        return amount.toString();
    }

    private async _loadIcon(bundleName: string, iconPath: string): Promise<void> {
        try {
            await ResManager.getInstance().loadBundleAsync(bundleName);
            const bundle = assetManager.getBundle(bundleName);
            if (!bundle) return;

            bundle.load(iconPath, SpriteFrame, (err, sf) => {
                if (!err && this._iconSprite && this.isValid) {
                    this._iconSprite.spriteFrame = sf;
                }
            });
        } catch (e) {}
    }
}
