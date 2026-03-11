import { LogManager } from '../../manager/core/LogManager';

export type Task = () => Promise<void>;

/**
 * 任務項目結構定義
 */
export interface ITaskItem {
    /** 異步任務函數 */
    task: Task;
    /** 任務權重（影響進度百分比） */
    weight: number;
    /** 任務說明文字，會列印在日誌中 */
    description: string;
}

/**
 * 任務群組型別。
 * 若為單一 ITaskItem，將會循序執行；若為 ITaskItem 陣列，則陣列內的任務會並行執行。
 */
export type TaskGroup = ITaskItem | ITaskItem[];

/**
 * 載入任務鏈 (TaskChain) 工具類
 *
 * 負責管理遊戲啟動或場景切換時的各種異步準備工作。
 * 支援「循序執行」與「並行執行」，並能精確換算為總體 0~1 的進度百分比。
 */
export class TaskChain {
    private groups: TaskGroup[] = [];
    private totalWeight: number = 0;
    private completedWeight: number = 0;

    /**
     * 新增「單一循序任務」
     * @param task 異步任務函數 (回傳 Promise)
     * @param weight 該任務佔整體的權重比例 (預設 1)
     * @param description 任務的文字描述 (預設空字串)
     * @returns 返回自身的實例，以支援鏈式呼叫 (Chaining)
     */
    public addTask(task: Task, weight: number = 1, description: string = ''): this {
        this.groups.push({ task, weight, description });
        this.totalWeight += weight;
        return this;
    }

    /**
     * 新增「並行任務群組」
     * 傳入的任務陣列將會透過 Promise.all 同時發起，最大化網路使用率。
     * @param tasks 包含多個 ITaskItem 的陣列
     * @returns 返回自身的實例，以支援鏈式呼叫 (Chaining)
     */
    public addParallelTasks(tasks: ITaskItem[]): this {
        if (tasks.length === 0) return this;
        this.groups.push(tasks);
        tasks.forEach((t) => {
            this.totalWeight += t.weight;
        });
        return this;
    }

    /**
     * 啟動任務鏈執行
     * 依據加入的順序依序處理任務，若遇到陣列則等候所有並行任務完成。
     * @param onProgress 進度回報回調函數，參數 progress 介於 0 到 1 之間
     * @returns Promise 當所有任務順利完成時 resolve
     */
    public async run(onProgress?: (progress: number) => void): Promise<void> {
        this.completedWeight = 0;

        for (const group of this.groups) {
            if (Array.isArray(group)) {
                // =============== 並行執行 (Parallel) ===============
                LogManager.getInstance().debug(
                    'TaskChain',
                    `[Parallel Group] Starting ${group.length} tasks concurrently.`,
                );

                const promises = group.map(async (item) => {
                    if (item.description) {
                        LogManager.getInstance().debug(
                            'TaskChain',
                            `  -> Parallel Task: ${item.description}`,
                        );
                    }
                    try {
                        await item.task();
                    } catch (err) {
                        LogManager.getInstance().error(
                            'TaskChain',
                            `Parallel Task failed: ${item.description}`,
                            err,
                        );
                        throw err;
                    }
                    // 單個平行任務完成後，推進整體權重
                    this.completedWeight += item.weight;
                    if (onProgress) {
                        onProgress(this.completedWeight / this.totalWeight);
                    }
                });

                // 等待這群平行任務全部完成才繼續下一個 Group
                await Promise.all(promises);
            } else {
                // =============== 循序執行 (Sequential) ===============
                if (group.description) {
                    LogManager.getInstance().debug(
                        'TaskChain',
                        `[Sequential Task] Running: ${group.description}`,
                    );
                }

                try {
                    await group.task();
                } catch (err) {
                    LogManager.getInstance().error(
                        'TaskChain',
                        `Task failed: ${group.description}`,
                        err,
                    );
                    throw err;
                }

                // 完成後推進權重
                this.completedWeight += group.weight;
                if (onProgress) {
                    onProgress(this.completedWeight / this.totalWeight);
                }
            }
        }

        LogManager.getInstance().info('TaskChain', 'All tasks completed successfully.');
    }
}
