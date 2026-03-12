# H5 遊戲動態適配與螢幕旋轉規範 (Dynamic Adaptation Guide)

本文件定義了專案在不同 H5 裝置（手機、平板、桌面）上的動態適配策略與螢幕旋轉處理流程。

## 1. 核心適配概念

### 寬高比 (Aspect Ratio)
透過 `view.getVisibleSize()` 計算當前螢幕的可視寬高比：
`aspectRatio = width / height`

### 方向判定門檻 (Threshold)
為了提高識別準確度，專案採用 **1.2** 作為方向判定的閾值，而非單純的 1.0：
*   **橫屏 (Landscape)**: `aspectRatio >= 1.2`
*   **直屏 (Portrait)**: `aspectRatio < 1.2`
> [!NOTE]
> 使用 1.2 門檻能有效過濾掉「正方形」或「稍微偏高」的平板裝置，避免 UI 在極端比例下頻繁切換佈局。

## 2. 縮放策略 (Scaling Strategy)

專案預設採用 **等比縮放 (Fit)** 策略，確保遊戲內容在任何比例下都能完整顯示且不變形。

```typescript
// 適配計算公式
const scaleX = windowWidth / DESIGN_WIDTH;
const scaleY = windowHeight / DESIGN_HEIGHT;
const finalScale = Math.min(scaleX, scaleY);

// 應用於 UI 根節點
node.setScale(finalScale, finalScale, 1);
```

## 3. 螢幕旋轉提示系統 (Rotation Warning)

當偵測到螢幕方向與專案設計（由 `AppConfig` 定義）不符時，系統會自動觸發提示。

### 觸發邏輯
*   **直屏專案**: 當 `aspectRatio > 1.0` (進入橫向區域) 時顯示提示。
*   **橫屏專案**: 當 `aspectRatio < 1.2` (進入直向區域) 時顯示提示。

### 技術實作細節
*   **OrientationManager**: 全域單例，監聽 `canvas-resize` 並發送 `RESIZE` 與 `CHANGE` 事件。
*   **OrientationTip**: 專屬提示組件，掛載 `BlockInputEvents` 阻擋下方所有互動。
*   **置頂確保**: 提示彈窗顯示時，強制執行 `setSiblingIndex(999)`。

## 4. UI 適配開發流程

所有繼承自 `UIComponentBase` 的組件皆可透過覆寫 `onOrientationChange` 來達成佈局適配。

```typescript
protected override onOrientationChange(orientation: OrientationType): void {
    if (orientation === OrientationType.LANDSCAPE) {
        // 設定橫向佈局參數
        this.getUITransform().setContentSize(1200, 80);
    } else {
        // 設定直向佈局參數
        this.getUITransform().setContentSize(700, 80);
    }
}
```

## 5. 相關檔案存放路徑

*   **管理器**: `assets/scripts/framework/manager/ui/OrientationManager.ts`
*   **提示組件**: `assets/scripts/framework/manager/ui/OrientationTip.ts`
*   **設定檔**: `assets/scripts/config/AppConfig.ts`
