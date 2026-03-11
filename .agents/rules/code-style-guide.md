# 程式碼規範指南 (Code Style Guide)

為確保程式碼可維護性、可讀性與團隊協作效率，開發時需遵守以下規則：

## 1. 註釋規範

### JSDoc 必須存在
所有 **類別、屬性與方法** 必須提供 JSDoc。
*   **註釋語言**：繁體中文
*   **必須包含**：
    *   功能描述
    *   `@param`
    *   `@returns`（若有回傳）

**範例：**
```typescript
/**
 * 根據用戶 ID 取得玩家頭像
 * @param userId 用戶唯一標識
 * @returns 頭像 URL
 */
public getAvatarByUserId(userId: string): string { }
```

### 複雜邏輯註釋
以下情況需補充行內註釋 `//`：
*   複雜演算法
*   狀態機流程
*   非同步網路請求
*   邊界條件處理

## 2. 命名規範

| 類型 | 規則 | 範例 |
| :--- | :--- | :--- |
| 類別 / Interface / Enum | PascalCase | `LoginController` |
| 變數 / 方法 | camelCase | `updatePlayerInfo` |
| 私有屬性 | _camelCase | `_isInitialized` |
| 常數 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

## 3. 類型安全

### 禁止濫用 any
必須使用：
*   明確型別
*   `interface`
*   `type`
*   `generic`

所有方法需明確標註回傳型別，例如：
```typescript
function loadUser(): Promise<User>
function init(): void
```

## 4. 非同步處理

*   **優先使用**：`async` / `await`
*   **避免**：深層 Promise chain、callback hell

## 5. Cocos 性能規範

*   避免在 `update()` 中頻繁呼叫 `getComponent()`。
*   應在 `onLoad` 或 `start` 階段進行快取 (Cache)。

## 6. 核心開發原則

### 單一職責原則 (SRP)
每個 **類別 / 函式** 只負責 **一個明確功能**。

### 邏輯拆分
當出現以下情況時必須拆分：
*   多條業務邏輯
*   多種流程模式
*   複雜條件判斷

**禁止**：一個函式塞入大量不同邏輯。
**應改為**：模組化、函式拆分、清晰流程。
