/**
 * MathUtils - 數學工具類
 * 提供常用數學運算的封裝。
 */
export class MathUtils {
    /**
     * 獲取範圍內的隨機整數 [min, max]
     */
    public static randomRangeInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 線性插值
     */
    public static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    /**
     * 限制數值範圍
     */
    public static clamp(val: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, val));
    }

    /**
     * 角度轉弧度
     */
    public static deg2Rad(deg: number): number {
        return (deg * Math.PI) / 180;
    }

    /**
     * 弧度轉角度
     */
    public static rad2Deg(rad: number): number {
        return (rad * 180) / Math.PI;
    }
}
