import { _decorator, Node } from 'cc';
import { EntryBase } from '../../../core/game/base/entry/EntryBase';
import { LobbyController } from './controller/LobbyController';
import { LobbyModel } from './model/LobbyModel';
import { LobbyView } from './view/LobbyView';
import { AppConfig } from '../../../app/config/Config';
import { ResManager } from '../../../core/systems/resource/ResManager';
import { LanguageManager } from '../../../core/systems/language/LanguageManager';

const { ccclass } = _decorator;

/**
 * 大廳模組進入點 (Main)
 */
@ccclass('Main')
export class Main extends EntryBase<LobbyView, LobbyModel, LobbyController> {
    protected onGameStart(): void {
        console.log('大廳啟動');
    }
    protected createModel(): LobbyModel {
        return new LobbyModel();
    }

    protected createView(node: Node): LobbyView {
        return new LobbyView(node);
    }

    protected createController(view: LobbyView, model: LobbyModel): LobbyController {
        return new LobbyController(view, model);
    }

    // 大廳後續如果需要特定的資源加載可以寫在 onLoadResources
    protected override async onLoadResources(): Promise<void> {
        await ResManager.getInstance().loadBundleAsync(
            AppConfig.BUNDLE_LOBBY + '_' + LanguageManager.getInstance().getLanguage(),
        );
    }
}
