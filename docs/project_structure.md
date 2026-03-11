# H5 Game Launcher 專案目錄架構

本專案採用高度模組化、單場景（Single Scene）驅動、多子遊戲 Bundle 的架構設計。這份文件詳細說明了專案根目錄下各個資料夾的用途，以及 `assets` 內部的資源組織方式。

## 根目錄結構

*   **`.agents/`**, **`.creator/`**, **`.vscode/`**：這三者皆為編輯器與 AI 輔助開發工具的設定檔資料夾。
*   **`assets/`**：Cocos Creator 專案的核心資源目錄，包含所有遊戲腳本、場景、美術資源等（詳見下方說明）。
*   **`docs/`**：專案開發文件目錄，包含 Git 工作流、協作規範，以及您正在閱讀的架構說明。
*   **`library/`**, **`temp/`**：Cocos Creator 編輯器自動生成的快取與編譯暫存目錄。開發過程中不需手動修改，且這兩個目錄通常已加入 `.gitignore` 忽略清單。
*   **`profiles/`**, **`settings/`**：Cocos 專案與編輯器的相關設定檔 (Project Settings / Editor Settings)。
*   **`server/`**：專門存放遊戲運作所需的後端伺服器原始碼（Node.js/WebSocket 開發）。

---

## Assets 目錄詳解 (`/assets`)

這部分是開發者日常接觸最多的區域，分為 `bundles` 與 `scripts` 兩大主軸，並採用單一持久場景設計。

```text
/assets
│
│── /bundles # 子專案資源包 (以 Asset Bundle 形式存在，方便獨立加載與熱更新)
│   ├── /common # 所有遊戲共用的通用資源包 (UI, Sounds, i18n)
│   ├── /games  # 各子遊戲的開發目錄 (Bundle)
│   │   ├── /template  # 🌟 遊戲專案樣板 (建立新遊戲時直接複製此目錄)
│   │   │   ├── /prefabs   # 預製體目錄 (命名規則: xxxUI, Ex: PokerUI)
│   │   │   ├── /resources # 美術資源目錄 (拆分為 cn, en 語系 / font, sounds, textures 等)
│   │   │   ├── /scenes    # 遊戲場景目錄 (舊架構相容用，新架構採 Prefab 載入)
│   │   │   ├── /scripts   # 腳本目錄 (包含組件與 MVC 架構)
│   │   │   │   ├── /components    # 綁定在 Node 上的 UI 腳本
│   │   │   │   ├── /controller    # MVC - 控制器 (繼承 BaseGameController)
│   │   │   │   ├── /model         # MVC - 資料模型
│   │   │   │   ├── /view          # MVC - 視圖更新
│   │   │   │   ├── /net           # 網路事件與封包定義
│   │   │   │   ├── /states        # 狀態機腳本 (Idle, Playing, Result, etc.)
│   │   │   │   └── Main.ts        # 子遊戲邏輯進入點
│   │   │   └── README.md     # 該子遊戲的專屬說明文件
│   │   │
│   │   ├── /bullsAndCows  # 已實作的子遊戲：猜數字
│   │   └── /robotClash    # 已實作的子遊戲：機器人對戰
│   │
│   └── /lobby  # 遊戲大廳專案目錄 (Bundle)
│
│── /resources  # 全局靜態美術資源
│
│── /scripts    # 核心框架與共用程式庫
│   ├── /config        # 全局配置 (AppConfig.ts)
│   ├── /framework     # 基底框架 (封裝了共用的 MVC 類別、UI 基礎、網路基礎等)
│   ├── /manager       # 全局別的系統管理器 (Singleton 設計)
│   │   ├── /game      # GameManager (全局狀態)
│   │   ├── /scene     # SceneManager (場景/Prefab 切換與卸載)
│   │   ├── /network   # HttpManager, WebSocketManager
│   │   ├── /resource  # ResManager (Bundle 加載器)
│   │   ├── /ui        # UIManager (UI 層級管理)
│   │   └── /i18n      # LanguageManager (多國語系)
│   │
│   ├── Launcher.ts   # 應用程式啟動入口 (掛載於 Launcher 場景)
│   └── App.ts        # 核心主框架入口 (掛載於 AppScene，負責掛載子遊戲與 UI 層級)
│
├── AppScene.scene   # 唯一持久主場景 (負責 UI 層級與遊戲動態掛載點)
└── Launcher.scene   # 極小初始化場景 (負責核心資源加載與環境初始化)
```

## 架構核心思想

本專案採用 **Launcher (Boot) → App (Single Scene)** 的分層架構，具備以下優勢：

1.  **H5 首包加載極速 (Fast Initial Load)**:
    - `Launcher.scene` 僅包含最基礎的初始化代碼（Log, Config, ResManager）。
    - 核心資源與多國語系透過 `TaskChain` 在啟動過程中分段加載，避免首包過大。

2.  **編輯器可視化 (Editor-Friendly)**:
    - 保留 `AppScene` 並掛載 `App.ts`，讓開發者能在編輯器中視覺化調整 Canvas UI 層級（`uiLayerRoot`）與遊戲掛載點（`gameRoot`），確保 UI 適配效果可見。

3.  **動態資源加載 (Dynamic Asset Loading)**:
    - 子遊戲（Bundle）不切換場景，而是透過 `SceneManager` 以 Prefab 動態實例化至 `gameRoot` 下。
    - 支援根據 URL 參數動態分流（Lobby 或特定 Game），進入/離開時自動處理 Bundle 卸載與記憶體釋放。

4.  **熱更新與模組化管理 (Hot Update & Modularity)**:
    - 核心框架（Launcher/App）路徑固定且輕量，內容全數透過 Bundle 形式動態注入。
    - 對 H5 緩存刷新機制極友善，只需刷新對應 Bundle 的 `version.json` 即可更新特定遊戲模塊。
