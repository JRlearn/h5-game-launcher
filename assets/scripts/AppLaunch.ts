import { _decorator, Component } from 'cc';
import { SceneManager } from './manager/game/SceneManager';
const { ccclass } = _decorator;

/** 應用主程式進入點 */
@ccclass('AppLaunch')
export class AppLaunch extends Component {
    public onLoad(): void {
        console.log('AppLaunch onLoad');
    }

    public start(): void {
        console.log('AppLaunch start');
        SceneManager.getInstance().enterGame('bullsAndCows', 'Scence');
        // SceneManager.getInstance().enterGame('robotClash', 'Scence');
    }
}
