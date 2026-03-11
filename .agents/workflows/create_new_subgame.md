---
description: 透過複製模板文件夾創建新子遊戲項目的工作流。
---

# 工作流：創建新子遊戲

當用戶請求創建新子遊戲時（例如：「創建一個名為 Slot 的新子遊戲」）使用此工作流。

## 參數
*   `GAME_NAME`: 新遊戲的名稱（全小寫，例如：`slot`, `poker`）。

## 步驟

1.  **複製模板文件夾**:
    導航至 `assets/bundles/games/` 目錄。複製整個 `template` 文件夾並將其重命名為 `GAME_NAME`。

2.  **驗證結構**:
    確保新文件夾 `assets/bundles/games/GAME_NAME` 包含預期的基礎結構：
    *   `/prefabs/entry/main.prefab` (統一入口)
    *   `/resources`
    *   `/scripts/components/`
    *   `/scripts/controller/`
    *   `/scripts/model/`
    *   `/scripts/states/`
    *   `/scripts/view/`
    *   `/scripts/Main.ts`

3.  **更新模板腳本**:
    檢查 `assets/bundles/games/GAME_NAME/scripts/` 內的 `.ts` 文件。將類名、bundle 加載路徑或命名空間中出現的所有「template」或「Template」替換為對應的 `GAME_NAME`。
    *   例如，如果 `Main.ts` 從 `template` bundle 加載預製體，請將 bundle 名稱字符串更改為 `GAME_NAME`。

4.  **更新 README**:
    更新 `assets/bundles/games/GAME_NAME/` 內的 `README.md` 文件，以反映新子遊戲的名稱。

5.  **與用戶進行確認**:
    在未徵得用戶同意前，請勿自動在 `AppLaunch.ts` 或主大廳中註冊遊戲。
    列出你已創建和修改的文件。詢問用戶是否希望你在 `AppLaunch` 管理器或特定的啟動器配置文件中插入入口代碼。
