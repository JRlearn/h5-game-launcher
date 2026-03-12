import { Prefab, log, error } from 'cc';
import { ResManager } from '../../resource/ResManager';
export interface ILoadTask<T> {
    label: string;
    run: () => Promise<T>;
}

export interface ILoadPlan {
    bundleName: string;
    entryPrefabPath?: string;
    uiPrefabPaths?: string[];
}

/**
 * LoadTaskManager - 並行加載任務調度器
 */
export class LoadTaskManager {
    /**
     * 執行並行加載計畫
     */
    public static async execute(
        plan: ILoadPlan,
        onProgress?: (progress: number) => void,
    ): Promise<Prefab | null> {
        const { bundleName, entryPrefabPath, uiPrefabPaths = [] } = plan;

        const hasEntry = !!entryPrefabPath;
        const totalSteps = (hasEntry ? 2 : 1) + uiPrefabPaths.length;
        let completedSteps = 0;

        const tick = () => {
            completedSteps++;
            onProgress?.(completedSteps / totalSteps);
        };

        let entryPrefab: Prefab | null = null;

        const bundleTask = ResManager.getInstance()
            .loadBundleAsync(bundleName)
            .then(() => {
                tick();
                log(`[LoadTaskManager] Bundle 就緒: ${bundleName}`);
            });

        const entryTask = hasEntry ? bundleTask.then(async () => {
            entryPrefab = await ResManager.getInstance().loadPrefabAsync(
                bundleName,
                entryPrefabPath!,
            );
            tick();
            log(`[LoadTaskManager] Entry Prefab 就緒: ${entryPrefabPath}`);
        }) : bundleTask;

        const uiTasks = uiPrefabPaths.map((path) =>
            bundleTask.then(async () => {
                await ResManager.getInstance().loadPrefabAsync(bundleName, path);
                tick();
                log(`[LoadTaskManager] UI Prefab 就緒: ${path}`);
            }),
        );

        await Promise.all(
            [entryTask, ...uiTasks].map((t) =>
                t.catch((err) => {
                    error('[LoadTaskManager] 任務失敗:', err);
                }),
            ),
        );

        onProgress?.(1);

        return entryPrefab;
    }
}
