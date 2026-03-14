# 子遊戲目錄結構規範

## 1. 目錄階層樣板
每個子遊戲應位於 `assets/bundles/games/[GameId]/` 下，結構如下：

```text
[GameId]/
├── res/          # 靜態資源 (Bundle 模式下放置於此)
└── src/                # 原始碼 (與 stormOfSeth 保持一致)
    ├── Main.ts         # 唯一入口 (Component，繼承 EntryBase)
    ├── model/          # 資料模型 (State / Config)
    ├── view/           # 視圖層 (繼承 ViewBase，實作成全代碼 UI)
    ├── controller/     # 控制器 (業務邏輯與流程控制)
    ├── components/     # 子遊戲專屬 UI 組件 (繼承 UIComponentBase/Component)
    ├── service/        # 服務層 (Mock Server, API 請求, 狀態機)
    ├── states/         # 遊戲狀態定義 (State Machine 用)
    └── net/            # 通訊協議定義
```

## 2. 檔案命名
- 腳本一律使用 PascalCase。
- 入口檔案固定為 `Main.ts`。
