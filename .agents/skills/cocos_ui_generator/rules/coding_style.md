# 程式碼風格與事件處理

## 1. 命名與層級
- 類別：PascalCase / 方法：camelCase (私有加底線)。
- 強制 Layer：`node.layer = Layers.Enum.DEFAULT;`

## 2. 事件最佳實踐
- 預防穿透：`event.propagationStopped = true;`
- 按鈕監聽：使用 `buttonNode.on('click', ...)`。
