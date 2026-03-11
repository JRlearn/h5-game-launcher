import { LobbyModel } from '../model/LobbyModel';
import { LobbyView } from '../view/LobbyView';
import { SceneManager } from '../../../../scripts/manager/scene/SceneManager';
import { AppConfig } from '../../../../scripts/config/AppConfig';
import { GameManager } from '../../../../scripts/manager/game/GameManager';
import { GameControllerBase } from '../../../../scripts/framework/mvc/controller/GameControllerBase';

/**
 * 大廳控制器
 * 處理玩家在大廳面板上的交互邏輯
 */
export class LobbyController extends GameControllerBase<LobbyView, LobbyModel> {
    
    constructor(view: LobbyView, model: LobbyModel) {
        super(view, model);
    }

    /**
     * 初始化控制器
     */
    public init(): void {
        if (!this.view) {
            console.error('LobbyController: 尚未綁定 LobbyView 組件');
            return;
        }

        // 綁定視圖回調事件
        this.view.init(this.onGameSelected.bind(this));
        
        // 將初始資料傳遞給 View 進行渲染
        const gameList = this.model.getGameList();
        this.view.renderGameList(gameList);
    }

    /**
     * 當玩家點擊遊戲選單時觸發
     */
    private onGameSelected(gameId: string, bundleName: string) {
        console.log(`LobbyController: 玩家選擇了遊戲 -> ${gameId} (${bundleName})`);

        // 設定全域狀態
        GameManager.getInstance().setGameState('PLAYING');

        // 呼叫 SceneManager 進行資源下載與動態掛載
        SceneManager.getInstance().enterGame({
            bundleName: bundleName,
            path: AppConfig.DEFAULT_GAME_PREFAB_PATH,
            isPrefab: true,
        });
    }
}
