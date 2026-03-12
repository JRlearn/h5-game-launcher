import { _decorator, Node } from 'cc';
import { BaseUIController } from '../../../../../scripts/framework/ui/BaseUIController';
import { IGameData } from '../../model/LobbyModel';
import { GameListItem } from './GameListItem';

const { ccclass, property } = _decorator;

/**
 * GameListPanel - 遊戲列表面板 (完全程式碼生成 Item)
 *
 * 繼承 BaseUIController。
 * 現在不再依賴 Prefab 模板，直接在程式碼中建立 GameListItem 實例。
 */
@ccclass('GameListPanel')
export class GameListPanel extends BaseUIController {
    @property({ type: Node, tooltip: '帶有 Layout 元件的容器節點（Content）' })
    public listContainer: Node = null!;

    /** 由 Controller 直接賦值，View 不持有業務邏輯 */
    public onGameSelected: (gameId: string, bundleName: string) => void = () => {};

    private itemInstances: Node[] = [];

    /**
     * 覆寫 BaseUIController.init()
     */
    public override init(): void {
        this.collectViews(this.node);
    }

    /**
     * 根據遊戲資料列表重新渲染所有卡片
     */
    public renderList(games: IGameData[]): void {
        if (!this.listContainer) {
            console.error('GameListPanel: 請在 Editor 綁定 listContainer');
            return;
        }

        this.clearList();

        games.forEach((game) => {
            // 直接建立 Node 並掛載元件，不再使用 instantiate(prefab)
            const itemNode = new Node(`GameItem_${game.id}`);
            const itemComp = itemNode.addComponent(GameListItem);
            
            this.listContainer.addChild(itemNode);
            this.itemInstances.push(itemNode);

            // 初始化卡片資料
            itemComp.setup(game, (gameId: string, bundleName: string) => {
                this.onGameSelected(gameId, bundleName);
            });
        });
    }

    /**
     * 清空列表
     */
    public clearList(): void {
        this.itemInstances.forEach((node) => node.destroy());
        this.itemInstances = [];
    }
}
