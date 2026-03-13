# H5 遊戲打包最佳化指南 (Build Optimization Guide)

本文件針對 Cocos Creator 3.8.8 在 H5 (Web-Mobile) 環境下的資源打包、加載效能與運行效率提供最佳化方案。

## 1. 資源包管理 (Asset Bundle Strategy)

### 分離核心與業務
- **Common Bundle**: 存放全域通用的 UI 組件、音效、字體與語系配置。建議設定為 `Preload` 優先級。
- **Game Bundles**: 每個子遊戲獨立一個 Bundle。設定為 `Demand` (按需載入)，避免啟動時下載不必要的資源。

### 資源剪裁
- 在「專案設定 -> 功能剪裁」中，關閉未使用的模組（如 3D 物理、3D 粒子等），可顯著減少 `cocos-js` 核心引擎體積。

## 2. 網路加載最佳化

### 壓縮方案
- **Gzip / Brotli**: 確保伺服器（Nginx/CDN）開啟靜態壓縮。Brotli 通常比 Gzip 有更好的壓縮率。
- **MD5 Cache**: 打包時開啟「MD5 快取」，利用瀏覽器緩存機制，僅在資源變動時更新下載。

### 圖片與音訊
- **WebP**: 優先使用 WebP 格式，在畫質與體積間取得最佳平衡。
- **音訊格式**: Web 端建議使用 `.mp3`，並控制位元率在 128kbps 以下。

## 3. 代碼與運行時最佳化

### 啟動流程緩衝
- 使用 `build-templates` 自訂 `index.html`，加入輕量級的 CSS 進度條與 Logo，減少使用者面對黑屏的焦慮感。

### 渲染批次
- **Auto Atlas**: 儘量將同一面板的圖片打包至自動圖集，減少 DrawCall。
- **Label 效能**: 頻繁變動的數值建議使用 `BMFont`，固定文字則使用普通 `Label` 並開啟 `Cache Mode: BITMAP`。

## 4. 打包設定清單 (Checklist)

1. [ ] 開啟 MD5 快取。
2. [ ] 開啟資源壓縮 (JSON/JS)。
3. [ ] 檢查 Bundle 優先級設定。
4. [ ] 執行引擎功能剪裁。
5. [ ] 驗證 Nginx 的 Gzip/Brotli 配置。
