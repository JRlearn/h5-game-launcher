import { Component, Node, error } from 'cc';

/**
 * 遊戲與大廳的統一進入點基底類別
 * 負責處理 MVC 初始化流程與資源的局部預載。
 *
 * @template V View 的型別
 * @template M Model 的型別
 * @template C Controller 的型別
 */
export abstract class EntryBase<V = any, M = any, C = any> extends Component {
    protected view!: V;
    protected model!: M;
    protected controller!: C;
    protected sandbox: any | null = null; // 避免循環引用，暫設為 any

    /**
     * 設置所屬沙盒環境 (由 GameSandbox 在引導時注入)
     */
    public setSandbox(sandbox: any): void {
        this.sandbox = sandbox;
    }

    protected onLoad(): void {
        // 舊有的 onLoad 自動啟動已移除，
        // 流程改由 SceneManager 動態加載後，主動 await bootstrapAsync() 確保時序正確。
    }

    /**
     * 核心啟動流程 (自動依照順序執行加載與 MVC 綁定)
     * 會由 SceneManager 在掛載後主動呼叫並等待。
     */
    public async bootstrapAsync(): Promise<void> {
        try {
            // 1. 資源非同步加載 (子類別實作)
            // 可在此配合 ProgressManager 顯示讀取進度
            await this.onLoadResources();

            // 2. 建立 MVC 實例
            this.model = this.createModel();
            this.view = this.createView(this.node);

            // 讓 View 進行初始化 (例如建立子節點、綁定事件)
            if (typeof (this.view as any).init === 'function') {
                await (this.view as any).init();
            }

            this.controller = this.createController(this.view, this.model);

            if (typeof (this.controller as any).init === 'function') {
                (this.controller as any).init();
            }

            // 3. 遊戲邏輯啟動
            this.onGameStart();
        } catch (err) {
            error('[EntryBase] 啟動流程發生錯誤：', err);
        }
    }

    /** ---------------- 需由子類實作的抽象方法 ---------------- */

    /** 建立 Data Model 實例 */
    protected abstract createModel(): M;

    /** 建立 View 實例並綁定實體節點 */
    protected abstract createView(rootNode: Node): V;

    /** 建立 Controller 實例並綁定 View 與 Model */
    protected abstract createController(view: V, model: M): C;

    /** ---------------- 生命週期 Hooks (可選擇性覆寫) ---------------- */

    /**
     * 進行特定資源的非同步加載 (例如讀取特定 Prefabs)
     * 在此處可呼叫 ResManager 進行資源讀取
     */
    protected abstract onLoadResources(): Promise<void>;

    /**
     * 遊戲啟動 (MVC 建置與資源加載完成後自動呼叫)
     */
    protected abstract onGameStart(): void;

    protected onDestroy(): void {
        // 統一在銷毀時嘗試清理控制器
        if (this.controller && typeof (this.controller as any).cleanup === 'function') {
            (this.controller as any).cleanup();
        }
    }
}
