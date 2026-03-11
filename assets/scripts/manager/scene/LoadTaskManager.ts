import { Prefab } from 'cc';
import { ResManager } from '../resource/ResManager';
import { LogManager } from '../core/LogManager';

export interface ILoadTask<T> {
    /** 任務識別名稱（用於 log） */
    label: string;
    /** 執行並回傳結果的 async 函式 */
    run: () => Promise<T>;
}

export interface ILoadPlan {
    bundleName: string;
    entryPrefabPath: string;
    /** 需要在 entry prefab 實例化之前預載的 UI prefab 路徑列表 */
    uiPrefabPaths?: string[];
}

/**
 * LoadTaskManager - 並行加載任務調度器
 *
 * 設計目標：
 * 1. Bundle manifest 加載 + Entry Prefab 加載 → 可並行
 * 2. UI Prefab 列表 → 與上面並行執行
 * 3. 所有任務完成後回傳；任一失敗則繼續其他任務並回報錯誤
 * 4. 提供進度回調（0~1）
 */
export class LoadTaskManager {
    /**
     * 執行並行加載計畫
     * @param plan 加載計畫（Bundle + Entry + UI Prefabs）
     * @param onProgress 進度回調 (0~1)
     * @returns entry prefab 實例（若失敗則為 null）
     */
    public static async execute(
        plan: ILoadPlan,
        onProgress?: (progress: number) => void,
    ): Promise<Prefab | null> {
        const { bundleName, entryPrefabPath, uiPrefabPaths = [] } = plan;

        // 計算進度：1 (bundle) + 1 (entry prefab) + N (ui prefabs)
        const totalSteps = 2 + uiPrefabPaths.length;
        let completedSteps = 0;

        const tick = () => {
            completedSteps++;
            onProgress?.(completedSteps / totalSteps);
        };

        let entryPrefab: Prefab | null = null;

        // ── Task A: 加載 Bundle manifest（輕量）──────────────────
        const bundleTask = ResManager.getInstance()
            .loadBundleAsync(bundleName)
            .then(() => {
                tick();
                LogManager.getInstance().debug('LoadTaskManager', `Bundle 就緒: ${bundleName}`);
            });

        // ── Task B: 加載 Entry Prefab（依賴 Bundle 完成）──────────
        // 先 await bundleTask 再加載 prefab，與 UI Prefabs 的 Promise.all 同時跑
        const entryTask = bundleTask.then(async () => {
            entryPrefab = await ResManager.getInstance().loadPrefabAsync(
                bundleName,
                entryPrefabPath,
            );
            tick();
            LogManager.getInstance().debug('LoadTaskManager', `Entry Prefab 就緒: ${entryPrefabPath}`);
        });

        // ── Task C: 加載 UI Prefabs（並行，也等 Bundle 完成）──────
        const uiTasks = uiPrefabPaths.map((path) =>
            bundleTask.then(async () => {
                await ResManager.getInstance().loadPrefabAsync(bundleName, path);
                tick();
                LogManager.getInstance().debug('LoadTaskManager', `UI Prefab 就緒: ${path}`);
            }),
        );

        // 全部並行等待；各任務自行 catch，不讓單一失敗中斷其餘任務
        await Promise.all(
            [entryTask, ...uiTasks].map((t) => t.catch((err) => {
                LogManager.getInstance().error('LoadTaskManager', '任務失敗:', err);
            })),
        );

        // 確保進度推到 1.0
        onProgress?.(1);

        return entryPrefab;
    }
}
