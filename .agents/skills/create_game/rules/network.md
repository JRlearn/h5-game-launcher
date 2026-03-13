# 子遊戲網路對接規範

## 1. WebSocket 註冊
子遊戲在 `Main.ts` 啟動時或遊戲開始時，需透過 `WebSocketManager` 進行註冊。

```typescript
WebSocketManager.getInstance().register(
    '[GameId]',
    '[ServerURL]',
    this.controller // 控制器需實作 IMessageReceiver 介面
);
```

## 2. 協定處理
- 控制器 (Controller) 應負責分發網路訊息。
- 資料更新應回流至 Model。
