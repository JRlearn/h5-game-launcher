import { _decorator, Component } from 'cc';
import { GameController } from './controller/GameController';
import { GameModel } from './model/GameModel';
import { GameView } from './view/GameView';

import { ResManager } from '../../../../scripts/manager/resource/ResManager';
import { WebSocketManager } from '../../../../scripts/manager/network/WebSocketManager';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    private controller: GameController;
    private model: GameModel;
    private view: GameView;

    protected onLoad(): void {
        this.model = new GameModel(); // 初始化模型
        this.view = new GameView(this.node); // 初始化視
        this.controller = new GameController(this.view, this.model); // 初始化控制器
    }

    protected start() {
        console.log('資源加載中...');

        this.loadResources(); // 加載資源
    }

    protected conectToServer() {
        console.log('連接到伺服器...');
        WebSocketManager.getInstance().register(
            'robotClash',
            'ws://127.0.0.1:8082',
            this.controller,
        );
    }

    protected loadResources() {
        console.log('資源加載中...');
        ResManager.getInstance().loadBundle(
            'robotClash',
            () => {
                console.log('資源包加載完成'); // 資源包加載完成回調
                this.gameStart(); // 開始遊戲
            }, // 加載資源包
        );
    }

    protected gameStart() {
        console.log('遊戲開始');
        this.controller.init(); // 初始化控制器
        this.conectToServer(); // 連接伺服器
        this.controller.start(); // 開始遊戲
    }
}
