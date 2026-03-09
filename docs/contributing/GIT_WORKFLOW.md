#  GitFlow 分支管理規範

為了保持版本穩定與協作順暢，本專案遵循標準 GitFlow 開發流程。

## 1. 主要分支 (Permanent Branches)

*   **`master`**: 僅存放極度穩定的正式發布版本。嚴禁直接在此分支進行開發提交。
*   **`develop`**: 整合所有已完成功能的基礎分支，也是日常開發的主軸。

## 2. 輔助分支 (Support Branches)

*   **`feature/*`**: 新功能開發。
    *   **來源**: `develop`
    *   **合併回**: `develop`
    *   **命名範例**: `feature/login-logic`, `feature/poker-ui`
*   **`hotfix/*`**: 緊急線上 Bug 修復。
    *   **來源**: `master`
    *   **合併回**: `master` 與 `develop`
    *   **命名範例**: `hotfix/crash-on-ios`, `hotfix/payment-error`
*   **`release/*`**: 發布前夕的最後測試與版本微調。
    *   **來源**: `develop`
    *   **合併回**: `master` 與 `develop`
    *   **命名範例**: `release/v1.0.1`

## 3. 操作守則

1.  **提交 PR (Pull Request)**: 所有輔助分支合併回主分支時，必須經過 PR 與代碼審核。
2.  **解決衝突**: 在從 `feature` 合併回 `develop` 前，請先在本地 pull 最新 `develop` 並解決可能存在的衝突。
3.  **同步更新**: 合併 `hotfix` 或 `release` 後，務必確保 `master` 與 `develop` 的代碼都是最新的。
