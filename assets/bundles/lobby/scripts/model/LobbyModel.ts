// ==========================================
// Lobby 資料模型定義
// ==========================================

/** 遊戲類別列舉 */
export type GameCategory = 'all' | 'slot' | 'fish' | 'table' | 'card';

/** 遊戲資料介面（與後端 API 對齊） */
export interface IGameData {
    id: string;
    name: string;
    bundleName: string;
    iconPath: string;
    category: GameCategory;
    /** 累積彩金（選填） */
    jackpot?: number;
    /** 是否標記為熱門 */
    isHot?: boolean;
    /** 是否標記為新遊戲 */
    isNew?: boolean;
}

/** 類別頁籤定義 */
export interface ICategoryTab {
    id: GameCategory;
    label: string;
}

export const CATEGORY_TABS: ICategoryTab[] = [
    { id: 'all',   label: '全部' },
    { id: 'slot',  label: '老虎機' },
    { id: 'fish',  label: '捕魚' },
    { id: 'table', label: '桌遊' },
    { id: 'card',  label: '牌桌' },
];

// ==========================================
// LobbyModel
// ==========================================

export class LobbyModel {
    private allGames: IGameData[] = [];
    private currentCategory: GameCategory = 'all';

    constructor() {
        // 初始化靜態遊戲列表
        // TODO: 替換為 API 請求（NetworkManager.fetchGameList()）
        this.allGames = [
            {
                id: 'bullsAndCows',
                name: '猜數字 (1A2B)',
                bundleName: 'games/bullsAndCows',
                iconPath: 'textures/icon_bulls_and_cows_1773209881183/spriteFrame',
                category: 'card',
                isNew: true,
            },
            {
                id: 'robotClash',
                name: '機器人對戰',
                bundleName: 'games/robotClash',
                iconPath: 'textures/icon_robot_clash_1773209896877/spriteFrame',
                category: 'table',
                isHot: true,
            },
        ];
    }

    /**
     * 獲取所有遊戲（不過濾）
     */
    public getGameList(): IGameData[] {
        return this.allGames;
    }

    /**
     * 根據類別過濾遊戲列表
     * @param category 類別 ID（'all' 表示全部）
     */
    public getGameListByCategory(category: GameCategory): IGameData[] {
        this.currentCategory = category;
        if (category === 'all') return this.allGames;
        return this.allGames.filter((g) => g.category === category);
    }

    /**
     * 取得目前選中的類別
     */
    public getCurrentCategory(): GameCategory {
        return this.currentCategory;
    }

    /**
     * 取得類別頁籤列表
     */
    public getCategoryTabs(): ICategoryTab[] {
        return CATEGORY_TABS;
    }

    /**
     * 更新遊戲列表（供 API 回傳後呼叫）
     * @param games 後端回傳的遊戲資料陣列
     */
    public setGameList(games: IGameData[]): void {
        this.allGames = games;
    }
}
