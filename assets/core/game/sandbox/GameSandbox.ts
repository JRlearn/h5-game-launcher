import { _decorator, Component, Node, error, log } from 'cc';
import { EntryBase } from '../base/entry/EntryBase';
import { SandboxContext } from './SandboxContext';
import { GameLifecycle } from './GameLifecycle';

const { ccclass, property } = _decorator;

/**
 * GameSandbox - 遊戲隔離沙盒容器
 * 負責單個子遊戲的載入、生命週期管理與資源隔離。
 *
 * 未來將擴展為支援獨立的事件總線、UI 堆疊隔離等功能。
 */
@ccclass('GameSandbox')
export class GameSandbox extends Component {
    private _gameEntry: EntryBase | null = null;
    private _gameId: string = '';
    private _context: SandboxContext = new SandboxContext();
    private _lifecycle: GameLifecycle = new GameLifecycle();

    /**
     * 初始化沙盒並接管遊戲入口
     * @param gameId 遊戲 ID
     * @param node 包含 EntryBase 的節點
     */
    public async bootstrap(gameId: string, node: Node): Promise<void> {
        this._gameId = gameId;
        this._context.gameId = gameId;

        log(`[GameSandbox] 正在引導遊戲沙盒: ${gameId}`);

        // 1. 尋找入口組件
        this._gameEntry = node.getComponent(EntryBase);
        if (!this._gameEntry) {
            error(`[GameSandbox] ❌ 找不到 EntryBase 組件於節點: ${node.name}`);
            return;
        }

        // 2. 雙向綁定
        this._gameEntry.setSandbox(this);

        try {
            // 3. 執行啟動流程
            await this._gameEntry.bootstrapAsync();
            log(`[GameSandbox] 遊戲 ${gameId} 啟動完成`);
        } catch (err) {
            error(`[GameSandbox] 遊戲 ${gameId} 啟動失敗:`, err);
            throw err;
        }
    }

    /**
     * 銷毀沙盒與遊戲內容
     */
    public destroySandbox(): void {
        log(`[GameSandbox] 正在銷毀遊戲沙盒: ${this._gameId}`);
        if (this._gameEntry && this._gameEntry.node) {
            this._gameEntry.node.destroy();
        }
        this.node.destroy();
    }

    public get gameId(): string {
        return this._gameId;
    }
    public get context(): SandboxContext {
        return this._context;
    }
    public get lifecycle(): GameLifecycle {
        return this._lifecycle;
    }
}
