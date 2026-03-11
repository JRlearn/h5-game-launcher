# H5 Game Launcher

## 📂 專案導覽 (Project Navigation)

本專案採用高度模組化的「大廳 + 多子遊戲」架構。透過單場景驅動與動態資源管理，為 H5 環境提供極致的加載性能。

*   📄 **[產品功能說明書](./docs/PRODUCT_OVERVIEW.md)**：包含多語系支援、大廳直連、MVC 架構與熱更新策略。
*   🏗️ **[技術架構與目錄說明](./docs/project_structure.md)**：詳細定義 Launcher 與 App 的初始化流程、單場景架構與管理員機制。
*   🤝 **[專案協作規範](./docs/contributing/GIT_COMMIT.md)**：標籤類型對照、編碼風格限制與 Git 分支管理規範。

---

---

## 🤖 AI 協作開發指南 (AI Collaboration)

本專案已配置了專屬的 AI Skills 與 Workflows（位於 `.agents` 目錄中），讓您可以透過 AI 助手（例如 Cursor、Copilot、Gemini 助手）大幅提升開發效率且保證架構一致性：

*   **專屬工作流 (Workflows)**：您可以直接請 AI 助手幫您套用樣板建立合規的子遊戲專案或 MVC 模塊。
    *   *指令範例：* 「請依照 workflow 建立一個名為 Slot 的新遊戲」
    *   *指令範例：* 「在 lobby 的 components 中，幫我用 workflow 建一個叫做 UserProfile 的 UI 模塊」
*   **遵守 MVC 與 Cocos 3.8.8 規範**：透過載入的 `.agents/skills`，AI 會自動嚴格遵循專案的 MVC 架構、組件命名規則 (`xxxUI`, `xxxScript` 等) 以及 Cocos Creator 3.8 的最新寫法。