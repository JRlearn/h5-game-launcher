# 子遊戲目錄結構規範

## 1. 目錄階層樣板
每個子遊戲應位於 `assets/bundles/games/[GameId]/` 下，結構如下：

```text
[GameId]/
├── prefabs/            # 存放 UI Prefabs (若不使用 Code-only 模式)
├── resources/          # 圖片、音效等靜態資源
└── scripts/            # 原始碼
    ├── Main.ts         # 唯一入口 (Component)
    ├── model/          # 資料模型與介面
    ├── view/           # 視圖層邏輯 (推薦繼承 ViewBase)
    ├── controller/     # 業務邏輯控制器
    ├── components/     # 子遊戲專屬 UI 組件 (繼承 UIComponentBase)
    └── net/            # 通訊通訊協定定義
```

## 2. 檔案命名
- 腳本一律使用 PascalCase。
- 入口檔案固定為 `Main.ts`。
