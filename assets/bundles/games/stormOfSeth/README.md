# Storm of Seth - Slot Game Specifications

**Status**: Production Ready (Version 1.5.0)
**Theme**: Ancient Egyptian Mythology

## 0. 核心架構 (Core Architecture)
本專案採用嚴格的 **MVC + Service + FSM** 架構，確保職責分離 (SRP)：
- **Model**: `GameModel` 負責純資料狀態與 View 屬性綁定。
- **View**: `GameView` 負責全代碼 UI 生成、動畫調度。
- **Controller**: `GameController` 透過 `SlotStateMachine` 管理遊戲循環。
- **Service**: `SlotServerMock` 負責所有 RNG、中獎判定與賠率運算 (模擬後端)。
- **Standard**: 所有 UI 組件繼承 `UIComponentBase` 統一生命週期與適配。

「戰神賽特」是一款基於古埃及神話背景的消除類 (Cluster Pay) Slot 遊戲。

## 1. 基本資訊
- **遊戲類型**: Cluster Pay (聚合賠付)
- **盤面規格**: 6x5 網格
- **賠付模式**: 8 顆以上相同符號出現在網格任何位置即可獲獎。
- **RTP**: 96.5% (理論值)
- **波動性**: 高 (High Volatility)

## 2. 符號與賠率 (8+ 顆賠付)

| 符號 (Type) | 名稱 | 8-9 顆 | 10-11 顆 | 12+ 顆 |
| :--- | :--- | :--- | :--- | :--- |
| **0** | 藍色寶石 | 0.25 | 0.75 | 2.00 |
| **1** | 綠色寶石 | 0.40 | 1.00 | 4.00 |
| **2** | 橘色寶石 | 0.50 | 1.50 | 5.00 |
| **3** | 紫色寶石 | 0.80 | 1.20 | 8.00 |
| **4** | 紅色寶石 | 1.00 | 1.50 | 10.00 |
| **5** | Ankh (十字架) | 1.50 | 2.00 | 12.00 |
| **6** | Scarab (聖甲蟲) | 2.00 | 5.00 | 15.00 |
| **7** | Eye of Ra (荷魯斯之眼) | 2.50 | 10.00 | 25.00 |
| **8** | Seth (Scatter) | — | 4顆觸發 FreeSpin | 100.00 (6顆) |

## 3. 特殊玩法
### 3.1 乘倍符號 (Multiplier)
- 盤面隨機出現倍數符號 (2x, 3x, 5x, 10x, 20x, 50x)。
- 該回合所有連鎖消除結束後，將累積的所有倍數相加，乘以總贏分。

### 3.2 免費旋轉 (Free Spins)
- 出現 4 顆以上 Scatter 觸發 15 次免費旋轉。
- 在免費旋轉期間，倍數會持續累加不重置。

### 3.3 翻倍購買 (Buy Feature)
- 玩家可以支付 100 倍下注額直接進入免費旋轉模式。

## 4. 進階設定
- **極速模式 (Turbo)**: 加速消除與掉落動畫。
- **歷史紀錄 (History)**: 側邊欄紀錄最近 5 次贏分。
- **節電模式 (Performance)**: 關閉粒子特效以提升效能。
