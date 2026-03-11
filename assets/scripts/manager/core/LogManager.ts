import { log, warn, error, _decorator } from 'cc';

/**
 * LogLevel - 日誌等級
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4,
}

/**
 * LogManager - 統一日誌管理工具
 */
export class LogManager {
    private static instance: LogManager;
    private level: LogLevel = LogLevel.DEBUG;
    private enabledTags: Set<string> = new Set();

    private constructor() {}

    public static getInstance(): LogManager {
        if (!this.instance) {
            this.instance = new LogManager();
        }
        return this.instance;
    }

    /**
     * 設定輸出等級
     */
    public setLevel(level: LogLevel) {
        this.level = level;
    }

    /**
     * 打印 DEBUG 等級日誌 (通常用於開發時的詳細資訊)
     */
    public debug(tag: string, message: any, ...args: any[]) {
        if (this.level <= LogLevel.DEBUG) {
            log(
                `%c[DEBUG][%s]%c ${message}`,
                'color: #7f8c8d; font-weight: bold;',
                tag,
                'color: inherit;',
                ...args,
            );
        }
    }

    /**
     * 打印 INFO 等級日誌 (常用於關鍵流程記錄)
     */
    public info(tag: string, message: any, ...args: any[]) {
        if (this.level <= LogLevel.INFO) {
            log(
                `%c[INFO][%s]%c ${message}`,
                'color: #2ecc71; font-weight: bold;',
                tag,
                'color: inherit;',
                ...args,
            );
        }
    }

    /**
     * 打印網絡封包專用
     */
    public net(tag: string, type: 'SEND' | 'RECV', cmd: string | number, data: any) {
        if (this.level <= LogLevel.INFO) {
            const color = type === 'SEND' ? '#3498db' : '#e67e22';
            log(
                `%c[NET][%s][%s][%s]%c`,
                `color: ${color}; font-weight: bold;`,
                tag,
                type,
                cmd,
                'color: inherit;',
                data,
            );
        }
    }

    /**
     * 打印警告日誌
     */
    public warn(tag: string, message: any, ...args: any[]) {
        if (this.level <= LogLevel.WARN) {
            warn(`[WARN][${tag}] ${message}`, ...args);
        }
    }

    /**
     * 打印錯誤日誌
     */
    public error(tag: string, message: any, ...args: any[]) {
        if (this.level <= LogLevel.ERROR) {
            error(`[ERROR][${tag}] ${message}`, ...args);
        }
    }
}
