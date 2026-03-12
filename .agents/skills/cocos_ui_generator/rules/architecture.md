# UI 元件化架構規範

## 1. 方法分離原則 (Method Separation)
- **Orchestrator (_buildUI)**: 僅負責 `addChild` 與組裝。
- **Private Builders (_createXXX)**: 每個節點獨立方法，需 return 實例。

## 2. 目錄結構 (File Structure)
- 路徑規範：`assets/bundles/[BundleName]/scripts/components/[Module]/`
- 範例：`assets/bundles/lobby/scripts/components/category/CategoryTabBar.ts`
