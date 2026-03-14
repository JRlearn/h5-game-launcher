import { _decorator, Node, Label, Sprite, SpriteFrame, Color, assetManager, size, Vec3 } from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { ResManager } from '../../../../../core/systems/resource/ResManager';
import { UIComponentBase } from '../../../../../core/game/base/ui/UIComponentBase';
import { NodeFactory } from '../../../../../core/utils/NodeFactory';
import { AppConfig } from '../../../../../app/config/Config';
import { LanguageManager } from '../../../../../core/systems/language/LanguageManager';

const { ccclass } = _decorator;

/**
 * 分層容器引用介面
 */
export interface ILayerNodes {
    bgLayer: Node;
    iconLayer: Node;
    labelLayer: Node;
}

/**
 * GameListItem - 遊戲卡片元件
 */
@ccclass('GameListItem')
export class GameListItem extends UIComponentBase {
    /** 圖示渲染組件 */
    private _iconSprite!: Sprite;
    /** 遊戲名稱標籤 */
    private _nameLabel!: Label;
    /** 彩金數值標籤 */
    private _jackpotLabel!: Label;
    /** 彩金容器節點 */
    private _jackpotContainer!: Node;
    /** 熱門標籤節點 */
    private _tagHot!: Node;
    /** 新遊戲標籤節點 */
    private _tagNew!: Node;
    /** 資源包名稱 */
    private _bundleName: string = AppConfig.BUNDLE_LOBBY;
    /** 圖示資源路徑 */
    private _iconPath: string = '';
    /** 是否正在載入中 */
    private _isLoading: boolean = false;
    /** 是否已載入完畢 */
    private _isLoaded: boolean = false;

    /** 分層容器引用 */
    private _layers: ILayerNodes | null = null;
    /** 分層下屬節點及其偏移量 */
    private _subNodes: { node: Node; offset: Vec3 }[] = [];
    /** 暫存世界座標 */
    private _tempWorldPos: Vec3 = new Vec3();
    private _tempChildPos: Vec3 = new Vec3();

    /** 緩存的遊戲原始資料 */
    private _gameData: IGameData | null = null;
    /** 進入遊戲的回調函式 */
    private _onEnterCallback: ((data: IGameData) => void) | null = null;

    /**
     * 當螢幕方向改變時觸發 (由基類要求實作)
     */
    protected onOrientationChange(orientation: any): void {
        // GameListItem 採取 Flow 佈局或是由外部重新渲染，這裡暫不需要處理
    }

    /**
     * 實作基類 UI 建立邏輯
     */
    protected createUI(): void {
        const itemSize = size(280, 380);
        this.getUITransform().setContentSize(itemSize);

        const bgParent = this._layers?.bgLayer ?? this.node;
        const iconParent = this._layers?.iconLayer ?? this.node;
        const labelParent = this._layers?.labelLayer ?? this.node;

        // 1. 背景層 (主體)
        const bgNode = NodeFactory.createSpriteNode('Background', new Color(35, 40, 50, 255)).node;
        this._attachToLayer(bgNode, bgParent);
        this.getUITransform(bgNode).setContentSize(itemSize);

        // 2. 底部文字區遮罩
        const textBg = NodeFactory.createSpriteNode('TextBg', new Color(25, 25, 35, 200)).node;
        this._attachToLayer(textBg, bgParent);
        this.getUITransform(textBg).setContentSize(itemSize.width, 100);
        textBg.setPosition(0, -itemSize.height / 2 + 50);

        // 3. 圖示層
        const { node: iconNode, sprite: iconSprite } = NodeFactory.createSpriteNode('Icon');
        this.getUITransform(iconNode).setContentSize(240, 240);
        iconNode.setPosition(0, 40);
        this._attachToLayer(iconNode, iconParent);
        this._iconSprite = iconSprite;

        // 4. 名稱層
        const { node: nameNode, label: nameLabel } = NodeFactory.createLabelNode(
            'NameLabel',
            '',
            28,
        );
        this.getUITransform(nameNode).setContentSize(240, 40);
        nameNode.setPosition(0, -110);
        nameLabel.isBold = true;
        nameLabel.overflow = Label.Overflow.SHRINK;
        nameLabel.cacheMode = Label.CacheMode.CHAR; // 優化批量渲染
        this._attachToLayer(nameNode, labelParent);
        this._nameLabel = nameLabel;

        // 5. 彩金資訊區
        this._jackpotContainer = NodeFactory.createUINode('JackpotContainer');
        this._jackpotContainer.setPosition(0, -150);
        this._jackpotContainer.active = false;
        this._attachToLayer(this._jackpotContainer, labelParent);

        const { label: jpLabel } = NodeFactory.createLabelNode('JackpotLabel', '', 22);
        jpLabel.node.setParent(this._jackpotContainer);
        jpLabel.color = new Color(255, 180, 0);
        jpLabel.isBold = true;
        jpLabel.cacheMode = Label.CacheMode.CHAR; // 優化批量渲染
        this._jackpotLabel = jpLabel;

        // 6. 標籤層
        this._tagHot = this._createTag('HOT', new Color(255, 50, 50));
        this._tagHot.setPosition(80, 160);
        this._tagHot.active = false;
        this._attachToLayer(this._tagHot, labelParent);

        this._tagNew = this._createTag('NEW', new Color(50, 200, 50));
        this._tagNew.setPosition(-80, 160);
        this._tagNew.active = false;
        this._attachToLayer(this._tagNew, labelParent);

        // 事件綁定
        this.node.on(Node.EventType.TOUCH_END, this._onEnter, this);
    }

    /**
     * 輔助函式：根據是否有分層容器來決定掛載與追踪
     */
    private _attachToLayer(node: Node, parent: Node): void {
        node.setParent(parent);
        if (parent !== this.node) {
            // 儲存節點相對於 Item 中心點的偏移位置
            this._subNodes.push({ node, offset: node.position.clone() });
        }
    }

    /**
     * 每幀同步分層節點的世界座標
     */
    protected lateUpdate(): void {
        if (this._subNodes.length === 0) return;

        // 取得本體 (被 Layout 控制的節點) 的世界座標
        this.node.getWorldPosition(this._tempWorldPos);

        // 同步所有分層子節點的位置
        this._subNodes.forEach((item) => {
            if (!item.node.isValid) return;

            // 設置世界座標 = 本體世界座標 + 本地偏移 (簡化版，不考量縮放與旋轉)
            this._tempChildPos.set(
                this._tempWorldPos.x + item.offset.x,
                this._tempWorldPos.y + item.offset.y,
                this._tempWorldPos.z + item.offset.z,
            );
            item.node.setWorldPosition(this._tempChildPos);
        });
    }

    /**
     * 內部建立標籤節點的輔助函式
     * @param text 標籤文字
     * @param bgColor 背景顏色
     * @returns 標籤節點
     */
    private _createTag(text: string, bgColor: Color): Node {
        const { node } = NodeFactory.createSpriteNode(`Tag_${text}`, bgColor);
        this.getUITransform(node).setContentSize(50, 24);

        const { label } = NodeFactory.createLabelNode('Label', text, 14);
        label.color = Color.WHITE;
        label.cacheMode = Label.CacheMode.CHAR; // 優化批量渲染
        node.addChild(label.node);
        return node;
    }

    /**
     * 配置 Item 資料與點擊回調 (支援分層傳入)
     */
    public setup(data: IGameData, onEnter: (data: IGameData) => void, layers?: ILayerNodes): void {
        this._layers = layers ?? null;
        this.initUI();
        this._gameData = data;
        this._onEnterCallback = onEnter;

        if (this._nameLabel) {
            this._nameLabel.string = data.name;
        }

        const hasJackpot = data.jackpot !== undefined && data.jackpot > 0;
        this._jackpotContainer.active = hasJackpot;
        if (hasJackpot && this._jackpotLabel) {
            this._jackpotLabel.string = this._formatJackpot(data.jackpot!);
        }

        if (this._tagHot) this._tagHot.active = !!data.isHot;
        if (this._tagNew) this._tagNew.active = !!data.isNew;

        this._iconPath = data.iconPath;

        // 初始化時重設圖示狀態，不自動載入
        this.unloadIcon();
    }

    /**
     * 手動載入圖示 (由外部滾動容器調用)
     */
    public async loadIcon(): Promise<void> {
        if (this._isLoaded || this._isLoading || !this._iconPath) return;
        this._isLoading = true;
        const lang = LanguageManager.getInstance().getLanguage();
        const targetBundle = `${AppConfig.BUNDLE_LOBBY}_${lang}`;
        await this._doLoadIcon(targetBundle, this._iconPath);
        this._isLoading = false;
        this._isLoaded = true;
    }

    /**
     * 手動預加載圖示 (僅載入資源但不顯示，暫時共用 loadIcon)
     */
    public async preloadIcon(): Promise<void> {
        return this.loadIcon();
    }

    /**
     * 卸載/重設圖示顯示 (節省記憶體)
     */
    public unloadIcon(): void {
        if (this._iconSprite) {
            this._iconSprite.spriteFrame = null;
        }
        this._isLoaded = false;
        this._isLoading = false;
    }

    /**
     * 銷毀時同步銷毀分層節點
     */
    protected onDestroy(): void {
        this._subNodes.forEach((item) => {
            if (item.node.isValid) item.node.destroy();
        });
        this._subNodes = [];
        this.node.off(Node.EventType.TOUCH_END, this._onEnter, this);
    }

    /**
     * 處理點擊進入遊戲邏輯
     */
    private _onEnter(): void {
        if (!this._gameData || !this._onEnterCallback) return;
        this._onEnterCallback(this._gameData);
    }

    /**
     * 格式化數字為彩金顯示字串 (K/M)
     * @param amount 原始數值
     * @returns 格式化後的字串
     */
    private _formatJackpot(amount: number): string {
        if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `${Math.floor(amount / 1_000)}K`;
        return amount.toString();
    }

    /**
     * 非同步載入遊戲圖示紋理
     * @param bundleName 資源包名稱
     * @param iconPath 圖片路徑
     */
    private async _doLoadIcon(bundleName: string, iconPath: string): Promise<void> {
        try {
            await ResManager.getInstance().loadBundleAsync(bundleName);
            const bundle = assetManager.getBundle(bundleName);

            if (!bundle) return;

            return new Promise((resolve) => {
                bundle.load(iconPath, SpriteFrame, (err: Error | null, sf: SpriteFrame) => {
                    if (!err && this._iconSprite && this.isValid) {
                        sf.packable = true;
                        this._iconSprite.spriteFrame = sf;
                    }
                    resolve();
                });
            });
        } catch (e) {
            console.error(`[GameListItem] 載入圖示失敗: ${iconPath}`, e);
        }
    }
}
