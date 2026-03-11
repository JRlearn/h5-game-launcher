import { _decorator, Component, Node, Label, Sprite, SpriteFrame, assetManager, Button, EventHandler } from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { AppConfig } from '../../../../../scripts/config/AppConfig';
import { ResManager } from '../../../../../scripts/manager/resource/ResManager';

const { ccclass, property } = _decorator;

/**
 * GameListItem - 遊戲列表中單張遊戲卡片元件
 *
 * 掛載於 GameItem Prefab 根節點，負責：
 * - 顯示遊戲名稱與圖示
 * - 觸發點擊進入遊戲的回調
 *
 * Prefab 結構：
 * GameItem (Node)
 * ├── Background (Sprite)
 * ├── Icon (Sprite)          <- 遊戲圖示
 * ├── Name (Label)           <- 遊戲名稱
 * └── EnterBtn (Button)      <- 進入按鈕
 */
@ccclass('GameListItem')
export class GameListItem extends Component {
    @property({ type: Label, tooltip: '遊戲名稱 Label' })
    public nameLabel: Label = null!;

    @property({ type: Sprite, tooltip: '遊戲圖示 Sprite' })
    public iconSprite: Sprite = null!;

    @property({ type: Node, tooltip: '進入按鈕節點 (選填，若無則整個節點可點擊)' })
    public enterBtn: Node = null!;

    private gameData: IGameData | null = null;
    private onEnterCallback: ((gameId: string, bundleName: string) => void) | null = null;

    protected onLoad(): void {
        // 整個卡片節點可點擊
        this.node.on(Node.EventType.TOUCH_END, this.onEnter, this);

        // 若有獨立按鈕，也綁定到按鈕
        if (this.enterBtn) {
            this.enterBtn.on(Node.EventType.TOUCH_END, this.onEnter, this);
        }
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onEnter, this);
        if (this.enterBtn) {
            this.enterBtn.off(Node.EventType.TOUCH_END, this.onEnter, this);
        }
    }

    /**
     * 設定卡片資料並初始化顯示
     * @param data 遊戲資料
     * @param onEnter 點擊進入回調
     */
    public setup(data: IGameData, onEnter: (gameId: string, bundleName: string) => void): void {
        this.gameData = data;
        this.onEnterCallback = onEnter;

        // 設定文字
        if (this.nameLabel) {
            this.nameLabel.string = data.name;
        }

        // 載入圖示
        if (this.iconSprite && data.iconPath) {
            this.loadIcon(data.iconPath);
        }
    }

    private onEnter(): void {
        if (!this.gameData || !this.onEnterCallback) return;
        this.onEnterCallback(this.gameData.id, this.gameData.bundleName);
    }

    private async loadIcon(iconPath: string): Promise<void> {
        try {
            await ResManager.getInstance().loadBundleAsync(AppConfig.BUNDLE_LOBBY);
            const bundle = assetManager.getBundle(AppConfig.BUNDLE_LOBBY);
            if (!bundle) return;

            bundle.load(iconPath, SpriteFrame, (err: Error | null, spriteFrame: SpriteFrame) => {
                if (err) {
                    console.warn(`GameListItem: 無法載入圖示 ${iconPath}`, err);
                    return;
                }
                if (this.iconSprite && this.isValid) {
                    this.iconSprite.spriteFrame = spriteFrame;
                }
            });
        } catch (error) {
            console.warn('GameListItem: 載入 Lobby Bundle 失敗', error);
        }
    }
}
