# 動態資源載載載載載入範例

```typescript
import { resources, SpriteFrame } from 'cc';

/** 載入 SpriteFrame 範例 */
resources.load('images/bg/spriteFrame', SpriteFrame, (err, spriteFrame) => {
    if (!err && spriteFrame) {
        sprite.spriteFrame = spriteFrame;
    }
});
```
