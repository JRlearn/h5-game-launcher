import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Color, UITransform, assetManager } from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { ResManager } from '../../../../../scripts/manager/resource/ResManager';

const { ccclass } = _decorator;

/**
 * GameListItem - 程式碼生成版遊戲卡片
 * 
 * 不依賴 Prefab，所有 UI 結構皆在 onLoad 時由程式動態建立。
 */
@ccclass('GameListItem')
export class GameListItem extends Component {
    // 內部節點引用
    private bgNode!: Node;
    private iconSprite!: Sprite;
    private nameLabel!: Label;
    private jackpotLabel!: Label;
    private jackpotContainer!: Node;
    private tagHot!: Node;
    private tagNew!: Node;

    private gameData: IGameData | null = null;
    private onEnterCallback: ((gameId: string, bundleName: string) => void) | null = null;

    protected onLoad(): void {
        this.initUI();
        this.node.on(Node.EventType.TOUCH_END, this.onEnter, this);
    }

    /**
     * 動態構建 UI 結構
     */
    private initUI(): void {
        const uiTrans = this.getOrAddComponent(this.node, UITransform);
        uiTrans.setContentSize(200, 260);

        // 1. Background
        this.bgNode = new Node('Background');
        const bgTrans = this.bgNode.addComponent(UITransform);
        bgTrans.setContentSize(200, 260);
        const bgSprite = this.bgNode.addComponent(Sprite);
        bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        bgSprite.color = new Color(45, 50, 60, 255); // 深灰色卡片色
        this.node.addChild(this.bgNode);

        // 2. Icon 容器與 Sprite
        const iconNode = new Node('Icon');
        const iconTrans = iconNode.addComponent(UITransform);
        iconTrans.setContentSize(160, 160);
        iconNode.setPosition(0, 30);
        this.iconSprite = iconNode.addComponent(Sprite);
        this.iconSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        this.node.addChild(iconNode);

        // 3. NameLabel
        const nameNode = new Node('NameLabel');
        const nameTrans = nameNode.addComponent(UITransform);
        nameTrans.setContentSize(180, 40);
        nameNode.setPosition(0, -70);
        this.nameLabel = nameNode.addComponent(Label);
        this.nameLabel.fontSize = 22;
        this.nameLabel.lineHeight = 22;
        this.nameLabel.enableWrapText = false;
        this.nameLabel.overflow = Label.Overflow.SHRINK;
        this.nameLabel.string = '';
        this.node.addChild(nameNode);

        // 4. Jackpot 容器與 Label
        this.jackpotContainer = new Node('JackpotContainer');
        this.jackpotContainer.setPosition(0, -105);
        this.jackpotContainer.active = false;
        
        const jpLabelNode = new Node('JackpotLabel');
        this.jackpotLabel = jpLabelNode.addComponent(Label);
        this.jackpotLabel.fontSize = 18;
        this.jackpotLabel.color = new Color(255, 215, 0); // 金色
        this.jackpotContainer.addChild(jpLabelNode);
        this.node.addChild(this.jackpotContainer);

        // 5. Tags
        this.tagHot = this.createTag('HOT', new Color(255, 60, 60));
        this.tagHot.setPosition(70, 100);
        this.tagHot.active = false;
        this.node.addChild(this.tagHot);

        this.tagNew = this.createTag('NEW', new Color(60, 255, 60));
        this.tagNew.setPosition(-70, 100);
        this.tagNew.active = false;
        this.node.addChild(this.tagNew);
    }

    /** 建立標籤節點小工具 */
    private createTag(text: string, bgColor: Color): Node {
        const tagNode = new Node(`Tag_${text}`);
        const trans = tagNode.addComponent(UITransform);
        trans.setContentSize(50, 24);
        
        const sprite = tagNode.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        sprite.color = bgColor;

        const labelNode = new Node('Label');
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 14;
        label.lineHeight = 14;
        label.color = Color.WHITE;
        tagNode.addChild(labelNode);
        
        return tagNode;
    }

    private getOrAddComponent<T extends Component>(node: Node, type: { new(): T }): T {
        return node.getComponent(type) || node.addComponent(type);
    }

    // ──────────────────────────────────────────
    // 公開 API
    // ──────────────────────────────────────────

    /**
     * 設定卡片資料並更新顯示
     */
    public setup(data: IGameData, onEnter: (gameId: string, bundleName: string) => void): void {
        this.gameData = data;
        this.onEnterCallback = onEnter;

        if (this.nameLabel) this.nameLabel.string = data.name;
        
        // Jackpot
        const hasJackpot = data.jackpot !== undefined && data.jackpot > 0;
        if (this.jackpotContainer) this.jackpotContainer.active = hasJackpot;
        if (hasJackpot && this.jackpotLabel) {
            this.jackpotLabel.string = this.formatJackpot(data.jackpot!);
        }

        // Tags
        if (this.tagHot) this.tagHot.active = !!data.isHot;
        if (this.tagNew) this.tagNew.active = !!data.isNew;

        // Icon
        if (data.iconPath) {
            this.loadIcon(data.bundleName, data.iconPath);
        }
    }

    private onEnter(): void {
        if (!this.gameData || !this.onEnterCallback) return;
        this.onEnterCallback(this.gameData.id, this.gameData.bundleName);
    }

    private formatJackpot(amount: number): string {
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `${Math.floor(amount / 1_000)}K`;
        return amount.toString();
    }

    private async loadIcon(bundleName: string, iconPath: string): Promise<void> {
        try {
            await ResManager.getInstance().loadBundleAsync(bundleName);
            const bundle = assetManager.getBundle(bundleName);
            if (!bundle) return;

            bundle.load(iconPath, SpriteFrame, (err, sf) => {
                if (!err && this.iconSprite && this.isValid) {
                    this.iconSprite.spriteFrame = sf;
                }
            });
        } catch (e) {
            console.warn(`GameListItem: 載入圖示失敗 [${bundleName}] ${iconPath}`);
        }
    }
}
