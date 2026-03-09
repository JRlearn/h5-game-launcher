import { GameControllerBase } from '../../../../../scripts/framework/mvc/controller/GameControllerBase';
import { GameView } from '../view/GameView';
import { GameModel } from '../model/GameModel';
import { EventManager } from '../../../../../scripts/manager/system/EventManager';
import { StateMachine } from '../../../../../scripts/framework/stateMachine/StateMachine';
import { IdelState } from '../states/IdelState';
import { SetupState } from '../states/SetupState';
import { GuessState } from '../states/GuessingState';
import { ResultState } from '../states/ResultState';
import { SoundManager } from '../../../../../scripts/manager/system/SoundManager';
import { WebSocketManager } from '../../../../../scripts/manager/network/WebSocketManager';
import {
    CreateRoomMessage,
    JoinRoomMessage,
    SubmitSecretMessage,
    GuessMessage,
    LeaveMessage,
    WSMessage,
    MessageType,
    PlayAgainMessage,
} from '../net/MessageTypes';
import { IWebSocketHandler } from '../../../../../scripts/manager/network/WebSocketConnector';

enum GameState {
    Idle = 0, // 等待狀態
    Setup = 1, // 設定狀態
    Guessing = 2, // 猜數字狀態
    Result = 3, // 結算狀態
}

export class GameController
    extends GameControllerBase<GameView, GameModel>
    implements IWebSocketHandler
{
    public onOpen(): void {
        console.log('WebSocket 連接成功');
        this.view.toast.playFadeInAndOut('伺服器連接成功'); // 顯示提示訊息
        this.changeState(GameState.Idle); // 開始時進入 Idle 狀態
    }
    public onClose(): void {
        console.log('WebSocket 連接關閉');
        this.view.toast.playFadeInAndOut('伺服器連接關閉，請檢查網路連接'); // 顯示提示訊息
    }
    /** 處理 WebSocket 接收的訊息 */
    public onMessage(msg: WSMessage): void {
        const { type, payload } = msg;
        switch (type) {
            case 'roomCreated':
                this.onReciveRoomCreatedMessage(payload);
                break;
            case 'joinFailed':
                this.onReciveJoinFailedMessage(payload);
                break;
            case 'joined':
                this.onReciveJoinedMessage(payload);
                break;
            case 'leave':
                this.onReciveLeaveMessage(payload);
                break;
            case 'gameStart':
                this.onReciveStartGameMessage(payload);
                break;
            case 'readyToGuess':
                this.onReciveStartGuessMessage(payload);
                break;
            case 'waitSecret':
                this.onReciveWaitSecretMessage(payload);
                break;
            case 'guessResult':
                this.onReciveGuessResultMessage(payload);
                break;
            case 'syncGuessCount':
                this.onReciveSyncGuessCountMessage(payload);
                break;
            case 'waitingResult':
                this.onReciveWaitingResultMessage(payload);
                break;
            case 'gameEnd':
                this.onReciveGameEndMessage(payload);
                break;

            default:
                console.warn('未知的訊息類型:', msg);
        }
    }

    /** 處理 WebSocket 錯誤事件 */
    public onError(event: Event): void {
        console.error('WebSocket 發生錯誤:', event);
    }

    public onReciveRoomCreatedMessage(data: any): void {
        console.log('收到創建房間的訊息:', data);
        this.model.setUid(data.uid); // 設置用戶ID
        this.view.createGamePanel.setRoomID(data.roomId); // 設置房間ID
        this.view.createGamePanel.playShowAnim(); // 顯示創建遊戲面板
    }

    public onReciveJoinedMessage(data: any): void {
        console.log('收到加入房間的訊息:', data);
        this.model.setUid(data.uid);
    }

    public onReciveJoinFailedMessage(data: any): void {
        console.log('收到加入失敗房間的訊息:', data);
        this.view.toast.playFadeInAndOut('加入房間失敗，請檢查房間ID'); // 顯示提示訊息
    }

    public onReciveLeaveMessage(data: any): void {
        console.log('收到離開房間的訊息:', data);
        this.changeStateToIdle(data); // 進入空閒狀態
    }

    public onReciveStartGameMessage(data: any): void {
        this.changeStateToSetup(data); // 進入猜數字狀態
    }

    public onReciveStartGuessMessage(data: any): void {
        console.log('收到開始猜數字的訊息:', data);
        this.changeStateToGuessing(data); // 進入猜數字狀態
    }

    public onReciveWaitSecretMessage(data: any): void {
        this.view.waitingMask.setText('等待對方...');
        this.view.waitingMask.show();
    }

    public onReciveGuessResultMessage(data: any): void {
        console.log('收到猜數字結果的訊息:', data);
        const result = data.result;
        const guess = data.guess.join('');
        this.view.guessNumberPanel.addScrollViewItem({ result, guess });
    }

    public onReciveGameEndMessage(data: any): void {
        console.log('收到遊戲結束的訊息:', data);
        this.changeStateToResult(data); // 進入結算狀態
    }

    public onReciveSyncGuessCountMessage(data: any): void {
        console.log('onReciveSyncGuessCountMessage:', data);
        const result = data.result;
        const guess = data.guess.join('');
        this.view.guessNumberPanel.showTost(`對手猜第${data.count}次! [${guess} >> ${result} ] `);
    }

    public onReciveWaitingResultMessage(data: any): void {
        console.log('onReciveWaitingResultMessage:', data);
        this.view.waitingMask.setText('等待對方猜完');
        this.view.waitingMask.show();
    }

    //創建房間
    public sendCreateRoomMessage(nickname: string) {
        const data: CreateRoomMessage = {
            type: 'createRoom',
            payload: {
                nickname,
            },
        };
        this.setData(data);
    }

    //加入房間
    public sendJoinRoomMessage(roomId: string, nickname: string) {
        const data: JoinRoomMessage = {
            type: 'joinRoom',
            payload: {
                roomId,
                nickname,
            },
        };
        this.setData(data);
    }

    //提交密碼
    public sendSubmitSecretMessage(secret: string[]) {
        const data: SubmitSecretMessage = {
            type: 'submitSecret',
            payload: {
                secret,
            },
        };
        this.setData(data);
    }

    //猜數字
    public sendGuessMessage(guess: string[]) {
        const data: GuessMessage = {
            type: 'guess',
            payload: {
                guess,
            },
        };
        this.setData(data);
    }

    //離開房間
    public sendLeaveMessage() {
        const data: LeaveMessage = {
            type: 'leave',
            payload: {},
        };
        this.setData(data);
    }

    //再玩一次
    public sendAgainMessage() {
        const data: PlayAgainMessage = {
            type: 'playAgain',
            payload: {},
        };
        this.setData(data);
    }

    public setData<T = any>(msg: WSMessage<T>) {
        console.log('發送訊息,', msg);
        WebSocketManager.getInstance().send('robotClash', msg);
    }

    /** 狀態機 */
    private stateMachine: StateMachine<GameState> = new StateMachine<GameState>();

    //處理ws事件

    /** 初始化 */
    public init() {
        console.log('GameController 初始化');
        this.model.init();
        this.view.init();
        this.initStateMachine();
        this.registerViewCallback();
    }

    public start() {
        console.log('GameController 開始');
        SoundManager.getInstance().playBGM('game_bgm');
        SoundManager.getInstance().fadeInBGM(3); // 播放背景音樂
        this.changeStateToIdle();
    }

    private initStateMachine() {
        this.stateMachine.setupState(GameState.Idle, new IdelState(this.model, this.view, this));
        this.stateMachine.setupState(GameState.Setup, new SetupState(this.model, this.view, this));
        this.stateMachine.setupState(
            GameState.Guessing,
            new GuessState(this.model, this.view, this),
        );
        this.stateMachine.setupState(
            GameState.Result,
            new ResultState(this.model, this.view, this),
        );
    }

    // 狀態機的狀態轉換
    public changeState(newState: GameState, data?: any) {
        this.stateMachine.changeState(newState, data);
        console.log(`狀態轉換: ${newState}`);
    }

    public changeStateToIdle(data?: any) {
        this.changeState(GameState.Idle, data);
    }

    public changeStateToSetup(data?: any) {
        this.changeState(GameState.Setup, data);
    }

    public changeStateToGuessing(data?: any) {
        this.changeState(GameState.Guessing, data);
    }

    public changeStateToResult(data?: any) {
        this.changeState(GameState.Result, data);
    }

    private registerViewCallback() {
        //主目錄面板的回調
        this.view.menuPanel.setOnChangeTextCallback((value: string) => {
            this.model.setNickName(value);
        });

        this.view.menuPanel.setOnClickCreateGameBtnCallback(() => {
            console.log('創建遊戲按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            if (this.model.hasNickName()) {
                this.sendCreateRoomMessage(this.model.getNickName()); // 發送創建房間的訊息
            } else {
                this.view.toast.playFadeInAndOut('請先設置暱稱');
            }
        });

        this.view.menuPanel.setOnClickJoinGameBtnCallback(() => {
            console.log('加入遊戲按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            if (this.model.hasNickName()) {
                console.log(`玩家暱稱: ${this.model.getNickName()}`);
                this.view.joinGamePanel.playShowAnim();
            } else {
                this.view.toast.playFadeInAndOut('請先設置暱稱');
            }
        });

        this.view.menuPanel.setOnClickSettingBtnCallback(() => {
            console.log('設置按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            // const elem = document.documentElement as any;
            // if (elem.requestFullscreen) {
            //     elem.requestFullscreen();
            // } else if (elem.webkitRequestFullscreen) {
            //     elem.webkitRequestFullscreen();
            // } else if (elem.msRequestFullscreen) {
            //     elem.msRequestFullscreen();
            // }
            if (SoundManager.getInstance().isPlayingBGM()) {
                SoundManager.getInstance().stopBGM();
            } else {
                SoundManager.getInstance().playBGM('game_bgm');
                SoundManager.getInstance().fadeInBGM(3);
            }
            this.view.toast.playFadeInAndOut('設置功能尚未實現');
        });

        // 創建遊戲面板的確定按鈕回調
        this.view.createGamePanel.setOnClickCancelBtnCallback(() => {
            console.log('createGamePanel取消按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.sendLeaveMessage(); // 發送離開房間的訊息
            this.view.createGamePanel.hide(); // 隱藏創建遊戲面板
        });

        // 加入遊戲面板的取消按鈕回調
        this.view.joinGamePanel.setOnClickConfirmBtnCallback(() => {
            SoundManager.getInstance().playSFX('click_button');
            const roomId = this.model.getJoinRoomId(); // 獲取房間ID
            const nickname = this.model.getNickName(); // 獲取玩家暱稱
            this.sendJoinRoomMessage(roomId, nickname); // 發送加入房間的訊息
        });

        // 加入遊戲面板的確定按鈕回調
        this.view.joinGamePanel.setOnClickCancelBtnCallback(() => {
            console.log('joinGamePanel確定按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.view.joinGamePanel.hide(); // 隱藏加入遊戲面板
        });

        this.view.joinGamePanel.setOnChangeTextCallbackCallback((value: string) => {
            this.model.setJoinRoomId(value);
        });

        // 設置猜數字面板的回調
        this.view.setupGuessPanel.setOnClickGuessNumBtnCallback((index) => {
            console.log('設置猜數字按鈕被點擊', index);
            SoundManager.getInstance().playSFX('click_button');
            this.model.setupNumIndex = index;
            this.view.setupGuessPanel.setFrameSelected(this.model.setupNumIndex);
        });

        this.view.setupGuessPanel.setOnClickConfirmBtnCallback(() => {
            console.log('設置猜數字確定按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            if (this.checkGuess(this.model.getSetupGuessNums())) {
                this.sendSubmitSecretMessage(this.model.getSetupGuessNums());
            } else {
                this.view.toast.playFadeInAndOut('請輸入四個不同號碼');
            }
        });

        this.view.setupGuessPanel.setOnClearBtnCallback(() => {
            console.log('設置猜數字取消按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.model.resetSetupGuessNums(); // 清空玩家輸入的數字
            const nums = this.model.getSetupGuessNums();
            this.view.setupGuessPanel.setGuessNumbers(nums);
        });

        this.view.setupGuessPanel.setOnClickKeyboardNumBtnCallback((num) => {
            console.log('設置鍵盤按鈕被點擊', num);
            SoundManager.getInstance().playSFX('click_button');
            this.model.updateSetupNumber(this.model.setupNumIndex, num.toString());
            this.view.setupGuessPanel.setGuessNumberByIndex(
                this.model.setupNumIndex,
                num.toString(),
            );
        });

        // 猜數字遊戲版面的回調
        this.view.guessNumberPanel.setOnClickNumBtnCallback((index: number) => {
            if (!this.view.keyboardPanel.node.active) {
                this.view.keyboardPanel.playFadeIn();
            }
            console.log(`按鈕 ${index} 被點擊`);
            SoundManager.getInstance().playSFX('click_button');
            this.model.inputIndex = index;
            this.view.guessNumberPanel.setFrameSelected(this.model.inputIndex);
        });

        this.view.guessNumberPanel.setOnClickLeaveBtnCallback(() => {
            console.log('離開按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.sendLeaveMessage();
        });

        // 數字鍵盤面板的回調
        this.view.keyboardPanel.setOnClickNumBtnCallback((num) => {
            console.log(`數字 ${num} 被點擊`);
            SoundManager.getInstance().playSFX('click_button');
            this.model.updateInputNumber(this.model.inputIndex, num.toString());
            this.view.guessNumberPanel.setGuessNumberByIndex(this.model.inputIndex, num.toString());
        });

        this.view.keyboardPanel.setOnClearBtnCallback(() => {
            console.log('清除按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.model.resetInputNumber(); // 清空玩家輸入的數字
            const inputNumbers = this.model.getInputNumbers();
            this.view.guessNumberPanel.setGuessNumbers(inputNumbers);
        });

        this.view.keyboardPanel.setOnClickConfirmBtnCallback(() => {
            console.log('確定按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            if (this.checkGuess(this.model.getInputNumbers())) {
                this.sendGuessMessage(this.model.getInputNumbers());
                this.view.keyboardPanel.playFadeOut();
            } else {
                this.view.toast.playFadeInAndOut('請輸入四個不同號碼');
            }
        });

        this.view.keyboardPanel.setOnClickCloseBtnCallback(() => {
            console.log('關閉按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.view.keyboardPanel.playFadeOut();
        });

        //結算面板的回調
        this.view.resultPanel.setonClickAgainBtnCallback(() => {
            console.log('resultPanel再玩一次按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.sendAgainMessage();
            this.view.waitingMask.setText('等待對方同意');
            this.view.waitingMask.show();
        });

        this.view.resultPanel.setonClickLeaveBtnCallback(() => {
            console.log('resultPanel退出按鈕被點擊');
            SoundManager.getInstance().playSFX('click_button');
            this.sendLeaveMessage();
        });
    }

    private checkGuess(nums: string[]) {
        return new Set(nums).size === nums.length;
    }
}
