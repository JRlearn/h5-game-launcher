---
name: cocos_ui_generator
description: 專為 Cocos Creator 3.8.8 打造的程式化 UI 全代碼生成與架構規範。
metadata:
  version: "1.0.0"
  author: "Billy Lu"
---

# Cocos Creator UI 產生器

## 任務目標
根據使用者需求，生成符合 3.8.8 標準的「全代碼」UI 元件，嚴格遵守私有建構方法分離原則。

## 執行指令
1. **查閱規範**：參考 `rules/architecture.md` 進行方法拆解。
2. **遵循風格**：依據 `rules/coding_style.md` 進行命名與事件綁定。
3. **套用模板**：使用 `templates/ui_manager_ts.md` 作為程式碼結構基礎。
4. **API 校對**：若涉及特定元件屬性，查閱 `references/api_matrix.md`。

## 強制約束
- 必須包含 `_initUI()` 作為唯一入口。
