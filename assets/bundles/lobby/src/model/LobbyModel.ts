/** 遊戲類別列舉 */
export type GameCategory = 'all' | 'slot' | 'fish' | 'table' | 'card';

/** 遊戲資料介面（與後端 API 對齊） */
export interface IGameData {
    id: string;
    name: string;
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
    { id: 'all', label: '全部' },
    { id: 'slot', label: '老虎機' },
    { id: 'fish', label: '捕魚' },
    { id: 'table', label: '桌遊' },
    { id: 'card', label: '牌桌' },
];

// ==========================================
// LobbyModel
// ==========================================

/**
 * LobbyModel - 大廳資料模型
 * 負責管理遊戲列表、分類切換與頁籤定義。
 */
export class LobbyModel {
    /** 完整的遊戲資料列表 */
    private _allGames: IGameData[] = [];
    /** 當前選中的遊戲類別 */
    private _currentCategory: GameCategory = 'all';

    /**
     * 建構函數，執行初始資料填充
     */
    constructor() {
        // 初始化靜態遊戲列表
        // TODO: 替換為 API 請求（NetworkManager.fetchGameList()）
        this._allGames = [
            {
                id: 'stormOfSeth',
                name: '戰神塞特',
                iconPath: 'textures/icons/icon_slot_master/spriteFrame',
                category: 'slot',
                isNew: true,
            },
            {
                id: 'game_02',
                name: '遊戲二',
                iconPath: 'textures/icons/icon_fish_hunter/spriteFrame',
                category: 'slot',
                isHot: true,
                jackpot: 1258400,
            },
            {
                id: 'game_03',
                name: '遊戲三',
                iconPath: 'textures/icons/icon_bulls_and_cows/spriteFrame',
                category: 'fish',
                isHot: true,
                jackpot: 85200,
            },
            {
                id: 'game_04',
                name: '遊戲四',
                iconPath: 'textures/icons/icon_slot_master/spriteFrame',
                category: 'slot',
                isNew: true,
            },
            {
                id: 'game_05',
                name: '遊戲五',
                iconPath: 'textures/icons/icon_slot_master/spriteFrame',
                category: 'card',
            },
            {
                id: 'game_06',
                name: '遊戲六',
                iconPath: 'textures/icons/icon_slot_master/spriteFrame',
                category: 'card',
                isNew: true,
            },
            {
                id: 'game_07',
                name: '遊戲七',
                iconPath: 'textures/icons/icon_fish_hunter/spriteFrame',
                category: 'slot',
                isHot: true,
                jackpot: 1258400,
            },
            {
                id: 'game_08',
                name: '遊戲八',
                iconPath: 'textures/icons/icon_bulls_and_cows/spriteFrame',
                category: 'fish',
                isHot: true,
                jackpot: 85200,
            },
            {
                id: 'game_09',
                name: '遊戲九',
                iconPath: 'textures/icons/icon_slot_master/spriteFrame',
                category: 'slot',
                isNew: true,
            },
            {
                id: 'game_10',
                name: '遊戲十',
                iconPath: 'textures/icons/icon_slot_master/spriteFrame',
                category: 'card',
            },
        ];
    }

    /**
     * 獲取所有初始遊戲列表（不含過濾條件）
     * @returns 遊戲資料陣列
     */
    public getGameList(): IGameData[] {
        return this._allGames;
    }

    /**
     * 根據所選類別過濾遊戲列表並更新當前狀態
     * @param category 遊戲類別
     * @returns 符合類別的遊戲資料陣列
     */
    public getGameListByCategory(category: GameCategory): IGameData[] {
        this._currentCategory = category;
        if (category === 'all') return this._allGames;
        return this._allGames.filter((g) => g.category === category);
    }

    /**
     * 取得目前使用者選中的類別
     * @returns 類別字串
     */
    public getCurrentCategory(): GameCategory {
        return this._currentCategory;
    }

    /**
     * 取得大廳頂部顯示的頁籤配置列表
     * @returns 頁籤配置陣列
     */
    public getCategoryTabs(): ICategoryTab[] {
        return CATEGORY_TABS;
    }

    /**
     * 更新全域遊戲列表（通常用於 API 非同步回傳後）
     * @param games 遊戲資料陣列
     */
    public setGameList(games: IGameData[]): void {
        this._allGames = games;
    }
}
