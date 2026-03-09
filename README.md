# 目錄架構
/assets
│── /bundles # 子專案 bundle
│   ├── /common # 通用資源包
│   ├── /games  # 遊戲目錄
│   │   ├── /template  # 遊戲專案(樣板:複製用)
│   │   │   ├── /prefabs   # 預製體目錄(命名規則:xxxUI,EX:PokerUI)
│   │   │   ├── /resources # 美術資源目錄
│   │   │   │   ├── /cn    # 語系
│   │   │   │   │   ├── /font     # 圖字
│   │   │   │   │   ├── /font     # 圖字
│   │   │   │   │   ├── /sounds   # 音效 
│   │   │   │   │   ├── /spine    # spine動畫 
│   │   │   │   │   └── /textures # 散圖   
│   │   │   │   ├── /...  
│   │   │   │   └── /en    
│   │   │   ├── /scenes    # 遊戲場景目錄 
│   │   │   │   └── Scene.scene    # 遊戲場景進入點(固定命名:"Scene") 
│   │   │   ├── /scripts   # 腳本目錄 
│   │   │   │   ├── /components    # prefab掛載腳本(命名規則:xxxScript,EX:預製體名為:PokerUI,掛載的腳本命名:PokerScript)
│   │   │   │   ├── /controller    # MVC架構(Controller模塊) 
│   │   │   │   ├── /model    # MVC架構(Model模塊) 
│   │   │   │   ├── /net      # 連線相關
│   │   │   │   ├── /states   # 狀態機 
│   │   │   │   ├── /view     # MVC架構(View模塊) 
│   │   │   │   └── Main.ts   # 遊戲程序進入點 (固定掛載在遊戲場景"Scene.scene"上)
│   │   │   └── README.md     # 專案說明文件
│   │   ├── /game1  # 遊戲專案(從樣板template複製來)
│   │   ├── /... 
│   │   └── /gameN 
│   └── /lobby  # 大廳專案
│           ├── /template  # 同遊戲專案的樣板目錄結構)
│           ...
│── /resources  # 美術資源
│── /scripts    # 程式腳本
│   ├── /3rd    # 第三方套件
│   ├── /framework     # 基底框架
│   ├── /manager
│   │   ├── /game      # 與遊戲狀態相關的管理器 
│   │   │   ├── GameManager.ts      # 遊戲管理器 
│   │   │   └── SceneManager.ts     # 場景管理器 
│   │   ├── /network   # 與網路請求相關 
│   │   │   ├── HttpManager.ts      # HTTP請求管理器 
│   │   │   └── WebSocketManager.ts # WebSocket連線管理器 
│   │   ├── /resource  # 與資源管理相關 
│   │   │   └── ResManager.ts       # 資源管理器 
│   │   ├── /ui        # UI 類管理器 
│   │   │   └── UIManager.ts        # UI管理器 
│   │   └── /system    # 系統級別  
│   │       ├── EventManager.ts     # 事件管理器 
│   │       ├── LanguageManager.ts  # 語系管理器 
│   │       └── SoundManager.ts     # 音樂、音效管理器  
│   ├── /utils        # 開發常用工具 
│   └── AppLaunch.ts  # 主程序進入點
└──  APP.scene  # 應用場景進入點

## 🤝 專案協作規範 (Contributing)

關於 Git Commit 標籤類型對照、程式碼風格限制等開發規範，請參閱：
👉 **[CONTRIBUTING.md](./docs/contributing/GIT_COMMIT.md)**

關於 Git 分支管理規範，請參閱：
👉 **[CONTRIBUTING.md](./docs/contributing/GIT_WORKFLOW.md)**

---

## 🤖 AI 協作開發指南 (AI Collaboration)

本專案已配置了專屬的 AI Skills 與 Workflows（位於 `.agents` 目錄中），讓您可以透過 AI 助手（例如 Cursor、Copilot、Gemini 助手）大幅提升開發效率且保證架構一致性：

*   **專屬工作流 (Workflows)**：您可以直接請 AI 助手幫您套用樣板建立合規的子遊戲專案或 MVC 模塊。
    *   *指令範例：* 「請依照 workflow 建立一個名為 Slot 的新遊戲」
    *   *指令範例：* 「在 lobby 的 components 中，幫我用 workflow 建一個叫做 UserProfile 的 UI 模塊」
*   **遵守 MVC 與 Cocos 3.8.8 規範**：透過載入的 `.agents/skills`，AI 會自動嚴格遵循專案的 MVC 架構、組件命名規則 (`xxxUI`, `xxxScript` 等) 以及 Cocos Creator 3.8 的最新寫法。