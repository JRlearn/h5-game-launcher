# H5 Game Launcher - 架構說明與產品規範 (Optimized Architecture)

本專案採用 Cocos Creator 3.8.8 開發，核心設計理念為「單場景啟動、動態 Bundle 載入、強 MVC 規範」。旨在達成極速首屏加載、模組化開發與高度自動化。

---

## 1. 系統架構圖 (System Architecture)

```text
H5 Game Launcher
│
├── Core Systems (核心框架層 - assets/core/)
│   ├── game/
│   │   ├── base/ (基礎模板: mvc, entry, ui)
│   │   ├── sandbox/ (獨立沙盒)
│   │   └── GameManager.ts / GameState.ts
│   ├── systems/ (引擎服務: audio, event, language, resource, screen)
│   ├── net/ (網路通訊)
│   └── utils/ (通用工具)
│
├── App Layer (應用程式層 - assets/app/)
│   ├── AppScene.ts (場景管理: )
│   ├── config/ (全域設定: Config.ts)
│   ├── progress/ (加載進度控制)
│   └── ui/ (全域 UI 組件: LoadingOverlay, OrientationTip, UIManager)
│   
└── Business Bundles (業務資源包 - assets/bundles/)
│   ├── lobby/ (大廳資源)
│   └── games/ (子遊戲資源，如 stormOfSeth)
│       
└── Launcher.ts (啟動進入點)
```

---

## 2. 核心流程與組態

### 2.1 啟動流程 (Startup Flow)
應用程式由 `Launcher` 場景啟動並掛載Launcher.ts`，負責以下初始化工作：
1. **環境解析**：解析 URL 參數 (如 `game`, `lang`) 並儲存於 `config/Config.ts`。
2. **核心資源載入**：載入 `common` bundle 與多國語系設定 (`LanguageManager`)。
3. **場景切換**：初始化 `scene/AppScene.ts` 並根據參數進入大廳或特定遊戲。

### 2.2 EntryBase
所有子遊戲或大廳的入口必須繼承 `EntryBase`，它定義了標準的生命週期與 MVC 初始化規範：
- `createModel()`: 初始化數據層。
- `createView()`: 初始化視覺層。
- `createController()`: 初始化邏輯層。
- `onGameStart()`: 核心初始化完成後的入口。

### 2.3 資源管理 (Resource Management)
`ResManager` 負責全域資源生命週期：
- **Bundle 快取**：避免重複載入 Asset Bundle。
- **並行載入**：支援 `async/await` 並行處理。
- **自動釋放**：支援按 Bundle 釋放資源 (`decRef`)。

---

## 3. 核心技術特點

1. **SPA 單場景架構**：切換遊戲時不重啟引擎，實現秒級切換、無黑屏體驗。
2. **Code-Driven UI**：UI 採用全程式碼生成模式（詳見 `ui_component_architecture.md`），減少對 Prefab 的依賴。
3. **沙盒隔離 (Sandbox)**：子遊戲運行於 `GameSandbox` 容器中，實現組件與事件的徹底隔離。
4. **多語系支援 (i18n)**：動態熱加載 JSON 語系配置，支援即時切換。

---

## 4. 目錄結構規範

- `assets/core`: 核心框架、服務、網路與基礎類。
- `assets/app`: 應用程式入口、全域 UI 與路由邏輯。
- `assets/bundles`: 業務資源包（大廳、子遊戲、共用資源）。 
- `docs`: 專案相關文件。

---

## 5. 最佳實踐

1. **優先使用異步**：資源載入與初始化應儘量使用 `async`。
2. **單元職責單一**：Controller 處理邏輯，View 只負責顯示，Model 只負責數據。
3. **動態適配**：UI 組件應繼承 `UIComponentBase` 以處理螢幕旋轉事件。
