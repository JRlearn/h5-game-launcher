import { _decorator, Component, Node, instantiate, Prefab, Layout } from 'cc';
import { IGameData } from '../../model/LobbyModel';
import { GameListItem } from './GameListItem';

const { ccclass, property } = _decorator;

/**
 * GameListPanel - 遊戲列表面板
 *
 * 掛載於大廳主 Prefab 內的 GameListPanel 節點，負責：
 * - 動態產生遊戲卡片列表
 * - 轉發玩家的遊戲選擇事件
 *
 * 必要的編輯器設定：
 * - listContainer：帶有 Layout 元件的容器節點（建議使用 Vertical Layout）
 * - gameItemPrefab：GameItem Prefab（根節點須掛載 GameListItem.ts）
 *
 * Prefab 結構：
 * LobbyMain (Prefab 根節點)
 * └── GameListPanel (此元件掛載節點)
 *     └── ScrollView
 *         └── Content (Layout)  <- 綁定到 listContainer
 */
@ccclass('GameListPanel')
export class GameListPanel extends Component {
    @property({ type: Node, tooltip: '列表容器節點 (建議帶有 Layout 元件)' })
    public listContainer: Node = null!;

    @property({ type: Prefab, tooltip: 'GameItem Prefab (根節點須掛載 GameListItem 元件)' })
    public gameItemPrefab: Prefab = null!;

    private onGameSelectedCallback: ((gameId: string, bundleName: string) => void) | null = null;
    private itemInstances: Node[] = [];

    /**
     * 初始化面板，傳入點擊進入遊戲的回調
     */
    public init(onGameSelected: (gameId: string, bundleName: string) => void): void {
        this.onGameSelectedCallback = onGameSelected;
    }

    /**
     * 根據遊戲資料列表動態生成卡片
     */
    public renderList(games: IGameData[]): void {
        if (!this.listContainer || !this.gameItemPrefab) {
            console.error('GameListPanel: 請在編輯器綁定 listContainer 與 gameItemPrefab');
            return;
        }

        this.clearList();

        games.forEach((game) => {
            const itemNode = instantiate(this.gameItemPrefab);
            itemNode.name = `GameItem_${game.id}`;
            this.listContainer.addChild(itemNode);
            this.itemInstances.push(itemNode);

            const itemComp = itemNode.getComponent(GameListItem);
            if (itemComp) {
                itemComp.setup(game, (gameId, bundleName) => {
                    this.onGameSelectedCallback?.(gameId, bundleName);
                });
            } else {
                console.error(`GameListPanel: GameItem Prefab 根節點缺少 GameListItem 元件`);
            }
        });
    }

    /**
     * 清除所有已生成的卡片
     */
    public clearList(): void {
        this.itemInstances.forEach((node) => node.destroy());
        this.itemInstances = [];
    }
}
