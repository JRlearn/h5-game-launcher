/**
 * SandboxContext 提供子遊戲運行數據上下文
 */
export class SandboxContext {
    public gameId: string = '';
    public sessionId: string = '';
    public config: any = {};

    // 存放子遊戲獨立的數據傳遞對象
}
