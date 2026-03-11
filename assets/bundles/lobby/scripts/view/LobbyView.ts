import { _decorator, Component } from 'cc';
import { IGameData } from '../model/LobbyModel';
import { GameListPanel } from '../components/gameList/GameListPanel';

const { ccclass, property } = _decorator;

/**
 * LobbyView - 大廳視圖
 *
 * 負責大廳主場景的 UI 橋接：
 * - 接收 Controller 傳入的遊戲資料並委派 GameListPanel 渲染
 * - 轉發玩家交互事件至 Controller
 *
 * 掛載位置：大廳主 Prefab（LobbyMain）根節點
 */
@ccclass('LobbyView')
export class LobbyView extends Component {
    @property({ type: GameListPanel, tooltip: '遊戲列表面板元件' })
    public gameListPanel: GameListPanel = null!;

    private onGameSelectedCallback: ((gameId: string, bundleName: string) => void) | null = null;

    protected onLoad(): void {
        if (!this.gameListPanel) {
            console.error('LobbyView: 請在編輯器綁定 gameListPanel');
        }
    }

    /**
     * 初始化視圖事件回調（由 Controller 傳入）
     */
    public init(onGameSelected: (gameId: string, bundleName: string) => void): void {
        this.onGameSelectedCallback = onGameSelected;

        if (this.gameListPanel) {
            this.gameListPanel.init((gameId, bundleName) => {
                this.onGameSelectedCallback?.(gameId, bundleName);
            });
        }
    }

    /**
     * 渲染遊戲列表（由 Controller 傳入 Model 資料後呼叫）
     */
    public renderGameList(games: IGameData[]): void {
        if (!this.gameListPanel) return;
        this.gameListPanel.renderList(games);
    }
}
