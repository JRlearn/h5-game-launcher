export interface IGameData {
    id: string;
    name: string;
    bundleName: string;
    iconPath: string;
}

export class LobbyModel {
    private gameList: IGameData[] = [];

    constructor() {
        // Initialize available games
        this.gameList = [
            {
                id: 'bullsAndCows',
                name: '猜數字 (1A2B)',
                bundleName: 'games/bullsAndCows',
                iconPath: 'textures/icon_bulls_and_cows_1773209881183/spriteFrame',
            },
            {
                id: 'robotClash',
                name: '機器人對戰',
                bundleName: 'games/robotClash',
                iconPath: 'textures/icon_robot_clash_1773209896877/spriteFrame',
            },
        ];
    }

    public getGameList(): IGameData[] {
        return this.gameList;
    }
}
