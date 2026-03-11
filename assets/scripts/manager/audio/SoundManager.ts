import { Node, AudioSource, AudioClip, director, _decorator, tween, sys } from 'cc';
import { ResManager } from '../resource/ResManager';
/**
 * 音樂管理器的單例類，支援背景音樂、音效、音量控制、靜音等功能。
 */
export class SoundManager {
    private static instance: SoundManager;
    private node: Node;
    private originalBGMVolume: number = 1.0;
    private originalSFXVolume: number = 1.0;
    private bgmSource: AudioSource; // 背景音樂音源
    private sfxSource: AudioSource; // 音效音源
    private isMuted: boolean = false; // 是否靜音
    private bgmVolume: number = 1.0; // 背景音樂音量
    private sfxVolume: number = 1.0; // 音效音量

    private readonly STORAGE_KEY_BGM_VOL = 'BGM_VOLUME';
    private readonly STORAGE_KEY_SFX_VOL = 'SFX_VOLUME';
    private readonly STORAGE_KEY_MUTE = 'SOUND_MUTED';

    private constructor() {
        console.log('SoundManager 初始化');
        this.node = new Node('SoundManager');
        director.addPersistRootNode(this.node); // 設置為常駐節點
        this.bgmSource = this.node.addComponent(AudioSource);
        this.bgmSource.loop = true; // 預設循環播放

        // 音效音源
        this.sfxSource = this.node.addComponent(AudioSource);

        this.loadSettings();
    }

    private loadSettings() {
        let savedBgmVol = sys.localStorage.getItem(this.STORAGE_KEY_BGM_VOL);
        let savedSfxVol = sys.localStorage.getItem(this.STORAGE_KEY_SFX_VOL);
        let savedMuted = sys.localStorage.getItem(this.STORAGE_KEY_MUTE);

        if (savedBgmVol !== null) this.bgmVolume = parseFloat(savedBgmVol);
        if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);

        this.originalBGMVolume = this.bgmVolume;
        this.originalSFXVolume = this.sfxVolume;

        if (savedMuted === 'true') {
            this.setMute(true);
        } else {
            this.bgmSource.volume = this.bgmVolume;
        }
    }

    public static getInstance(): SoundManager {
        if (!this.instance) {
            this.instance = new SoundManager();
        }
        return this.instance;
    }

    /**
     * 播放背景音樂（從指定資源包）
     * @param bundle 資源包名稱
     * @param sound 音樂名稱
     */
    public playBGMFromBundle(bundle: string, sound: string): void {
        let audioClip = this.getAudioClip(bundle, sound);
        if (audioClip) {
            this.bgmSource.stop();
            this.bgmSource.clip = audioClip;
            this.bgmSource.volume = this.bgmVolume;
            this.bgmSource.play();
        }
    }

    /**
     * 是否在播放背景音樂
     */
    public isPlayingBGM(): boolean {
        return this.bgmSource.playing;
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
        this.bgmSource.volume = 0;
        this.bgmSource.play();
        tween(this.bgmSource).to(duration, { volume: this.bgmVolume }).start();
    }

    /**
     * 背景音樂淡出
     * @param duration 淡出持續時間（秒）
     */
    public fadeOutBGM(duration: number): void {
        tween(this.bgmSource)
            .to(duration, { volume: 0 })
            .call(() => this.bgmSource.stop())
            .start();
    }

    /**
     * 播放音效（從指定資源包）
     * @param bundle 資源包名稱
     * @param sound 音效名稱
     */
    public playSFXFromBundle(bundle: string, sound: string): void {
        let audioClip = this.getAudioClip(bundle, sound);
        if (audioClip) {
            console.log('播放音效:', this.sfxSource, sound);
            this.sfxSource.playOneShot(audioClip, this.sfxVolume);
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
        this.bgmSource.stop();
    }

    /** 暫停背景音樂 */
    public pauseBGM(): void {
        this.bgmSource.pause();
    }

    /** 恢復背景音樂播放 */
    public resumeBGM(): void {
        this.bgmSource.play();
    }

    /** 確認背景音樂是否正在播放 */
    public isMusicPlaying(): boolean {
        return this.bgmSource.playing;
    }

    /**
     * 設定背景音樂音量
     * @param volume 音量 (0 ~ 1)
     */
    public setBGMVolume(volume: number): void {
        this.bgmVolume = volume;
        if (!this.isMuted) {
            this.bgmSource.volume = volume;
        }
        sys.localStorage.setItem(this.STORAGE_KEY_BGM_VOL, volume.toString());
    }

    /**
     * 設定音效音量
     * @param volume 音量 (0 ~ 1)
     */
    public setSFXVolume(volume: number): void {
        this.sfxVolume = volume;
        sys.localStorage.setItem(this.STORAGE_KEY_SFX_VOL, volume.toString());
    }

    /**
     * 靜音或取消靜音
     * @param mute 是否靜音
     */
    public setMute(mute: boolean): void {
        this.isMuted = mute;
        if (mute) {
            this.originalBGMVolume = this.bgmVolume;
            this.originalSFXVolume = this.sfxVolume;
            this.bgmSource.volume = 0;
            // sfxVolume controls playOneShot multiplier, so we don't nullify the source
        } else {
            this.bgmVolume = this.originalBGMVolume;
            this.sfxVolume = this.originalSFXVolume;
            this.bgmSource.volume = this.bgmVolume;
        }
        sys.localStorage.setItem(this.STORAGE_KEY_MUTE, mute.toString());
    }

    /** 確認是否靜音 */
    public checkMuted(): boolean {
        return this.isMuted;
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
    private getAudioClip(bundle: string, sound: string): AudioClip | null {
        let audioClip = ResManager.getInstance().getAudioClipFromBundle(bundle, sound);
        if (!audioClip) {
            console.error('音效資源不存在:', bundle, sound);
            return null;
        }
        return audioClip;
    }
}
