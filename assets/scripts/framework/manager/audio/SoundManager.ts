import { Node, AudioSource, AudioClip, director, _decorator, tween, sys } from 'cc';
import { ResManager } from '../resource/ResManager';
/**
 * 音樂管理器的單例類，支援背景音樂、音效、音量控制、靜音等功能。
 */
export class SoundManager {
    /** 單例 */
    private static _instance: SoundManager;
    /** 儲存鍵(背景音樂音量) */
    private readonly _STORAGE_KEY_BGM_VOL = 'BGM_VOLUME';
    /** 儲存鍵(音效音量) */
    private readonly _STORAGE_KEY_SFX_VOL = 'SFX_VOLUME';
    /** 儲存鍵(靜音) */
    private readonly _STORAGE_KEY_MUTE = 'SOUND_MUTED';
    /** node */
    private _node: Node;
    /** 原始背景音樂音量 */
    private _originalBGMVolume: number = 1.0;
    /** 原始音效音量 */
    private _originalSFXVolume: number = 1.0;
    /** 背景音樂音源 */
    private _bgmSource: AudioSource;
    /** 音效音源 */
    private _sfxSource: AudioSource;
    /** 是否靜音 */
    private _isMuted: boolean = false;
    /** 背景音樂音量 */
    private _bgmVolume: number = 1.0;
    /** 音效音量 */
    private _sfxVolume: number = 1.0;

    /**
     * 私有構造
     */
    private constructor() {
        console.log('SoundManager 初始化');
        this._node = new Node('SoundManager');
        director.addPersistRootNode(this._node); // 設置為常駐節點
        this._bgmSource = this._node.addComponent(AudioSource);
        this._bgmSource.loop = true; // 預設循環播放

        // 音效音源
        this._sfxSource = this._node.addComponent(AudioSource);

        this._loadSettings();
    }

    /**
     * 獲取單例
     */
    public static getInstance(): SoundManager {
        if (!this._instance) {
            this._instance = new SoundManager();
        }
        return this._instance!;
    }

    /**
     * 播放背景音樂（從指定資源包）
     * @param bundle 資源包名稱
     * @param sound 音樂名稱
     */
    public playBGMFromBundle(bundle: string, sound: string): void {
        let audioClip = this._getAudioClip(bundle, sound);
        if (audioClip) {
            this._bgmSource.stop();
            this._bgmSource.clip = audioClip;
            this._bgmSource.volume = this._bgmVolume;
            this._bgmSource.play();
        }
    }

    /**
     * 是否在播放背景音樂
     */
    public isPlayingBGM(): boolean {
        return this._bgmSource.playing;
    }

    /**
     * 播放背景音樂
     * @param sound 音樂名稱
     */
    public playBGM(sound: string): void {
        let bundle = ResManager.getInstance().getDefaultBundleName(); // 獲取預設資源包名稱
        this.playBGMFromBundle(bundle, sound); // 播放預設資源包中的音樂
    }

    /**
     * 背景音樂淡入
     * @param duration 淡入持續時間（秒）
     */
    public fadeInBGM(duration: number): void {
        this._bgmSource.volume = 0;
        this._bgmSource.play();
        tween(this._bgmSource).to(duration, { volume: this._bgmVolume }).start();
    }

    /**
     * 背景音樂淡出
     * @param duration 淡出持續時間（秒）
     */
    public fadeOutBGM(duration: number): void {
        tween(this._bgmSource)
            .to(duration, { volume: 0 })
            .call(() => this._bgmSource.stop())
            .start();
    }

    /**
     * 播放音效（從指定資源包）
     * @param bundle 資源包名稱
     * @param sound 音效名稱
     */
    public playSFXFromBundle(bundle: string, sound: string): void {
        let audioClip = this._getAudioClip(bundle, sound);
        if (audioClip) {
            console.log('播放音效:', this._sfxSource, sound);
            this._sfxSource.playOneShot(audioClip, this._sfxVolume);
        } else {
            console.error('音效資源不存在:', bundle, sound);
        }
    }

    /**
     * 播放音效
     * @param sound 音效名稱
     */
    public playSFX(sound: string): void {
        let bundle = ResManager.getInstance().getDefaultBundleName(); // 獲取預設資源包名稱
        this.playSFXFromBundle(bundle, sound); // 播放預設資源包中的音效
    }

    /** 停止背景音樂 */
    public stopBGM(): void {
        this._bgmSource.stop();
    }

    /** 暫停背景音樂 */
    public pauseBGM(): void {
        this._bgmSource.pause();
    }

    /** 恢復背景音樂播放 */
    public resumeBGM(): void {
        this._bgmSource.play();
    }

    /** 確認背景音樂是否正在播放 */
    public isMusicPlaying(): boolean {
        return this._bgmSource.playing;
    }

    /**
     * 設定背景音樂音量
     * @param volume 音量 (0 ~ 1)
     */
    public setBGMVolume(volume: number): void {
        this._bgmVolume = volume;
        if (!this._isMuted) {
            this._bgmSource.volume = volume;
        }
        sys.localStorage.setItem(this._STORAGE_KEY_BGM_VOL, volume.toString());
    }

    /**
     * 設定音效音量
     * @param volume 音量 (0 ~ 1)
     */
    public setSFXVolume(volume: number): void {
        this._sfxVolume = volume;
        sys.localStorage.setItem(this._STORAGE_KEY_SFX_VOL, volume.toString());
    }

    /**
     * 靜音或取消靜音
     * @param mute 是否靜音
     */
    public setMute(mute: boolean): void {
        this._isMuted = mute;
        if (mute) {
            this._originalBGMVolume = this._bgmVolume;
            this._originalSFXVolume = this._sfxVolume;
            this._bgmSource.volume = 0;
            // sfxVolume controls playOneShot multiplier, so we don't nullify the source
        } else {
            this._bgmVolume = this._originalBGMVolume;
            this._sfxVolume = this._originalSFXVolume;
            this._bgmSource.volume = this._bgmVolume;
        }
        sys.localStorage.setItem(this._STORAGE_KEY_MUTE, mute.toString());
    }

    /** 確認是否靜音 */
    public checkMuted(): boolean {
        return this._isMuted;
    }

    /**
     * 釋放音效資源
     * @param sound 音效名稱或 AudioClip
     */
    public release(sound: string | AudioClip): void {}

    /** 釋放所有音效資源 */
    public releaseAll(): void {
        console.log('釋放所有音效資源');
    }

    /**
     * 取得音效資源
     * @param bundle 資源包名稱
     * @param sound 音效名稱
     */
    private _getAudioClip(bundle: string, sound: string): AudioClip | null {
        let audioClip = ResManager.getInstance().getAudioClipFromBundle(bundle, sound);
        if (!audioClip) {
            console.error('音效資源不存在:', bundle, sound);
            return null;
        }
        return audioClip;
    }

    /**
     * 加載設定
     */
    private _loadSettings() {
        let savedBgmVol = sys.localStorage.getItem(this._STORAGE_KEY_BGM_VOL);
        let savedSfxVol = sys.localStorage.getItem(this._STORAGE_KEY_SFX_VOL);
        let savedMuted = sys.localStorage.getItem(this._STORAGE_KEY_MUTE);

        if (savedBgmVol !== null) this._bgmVolume = parseFloat(savedBgmVol);
        if (savedSfxVol !== null) this._sfxVolume = parseFloat(savedSfxVol);

        this._originalBGMVolume = this._bgmVolume;
        this._originalSFXVolume = this._sfxVolume;

        if (savedMuted === 'true') {
            this.setMute(true);
        } else {
            this._bgmSource.volume = this._bgmVolume;
        }
    }
}
