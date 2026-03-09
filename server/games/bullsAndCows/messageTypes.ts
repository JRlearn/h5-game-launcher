// C2S（Client To Server）

//C2S 創建房間
export interface CreateRoomMessage {
    type: 'createRoom';
    payload: {
      nickname: string;
    };
  }
  
  // C2S 加入房間
  export interface JoinRoomMessage {
    type: 'joinRoom';
    payload: {
      roomId: string;
      nickname: string;
    };
  }
  
  // C2S 提交密碼
  export interface SubmitSecretMessage {
    type: 'submitSecret';
    payload: {
      secret: string[];
    };
  }
  
  // C2S 猜數字
  export interface GuessMessage {
    type: 'guess';
    payload: {
      guess: string[];
    };
  }
  
  export interface LeaveMessage {
    type: 'leave';
    payload: {};
  }


  
  export type C2SMessage =
    | CreateRoomMessage
    | JoinRoomMessage
    | SubmitSecretMessage
    | GuessMessage
    | LeaveMessage 



  // S2C（Server To Client）
  export interface RoomCreatedMessage {
    type: 'roomCreated';
    payload: {
      roomId: string;
      uid: string;
    };
  }
  
  export interface JoinFailedMessage {
    type: 'joinFailed';
    payload: {
      reason: string;
    };
  }
  
  export interface GameStartMessage {
    type: 'gameStart';
    payload: {
      players: { uid: string; nickname: string }[];
    };
  }
  
  export interface GuessResultMessage {
    type: 'guessResult';
    payload: {
      correct: boolean;
      guess: string;
    };
  }
  
  export interface GameEndMessage {
    type: 'gameEnd';
    payload: {
      winnerUid: string;
    };
  }
  
  export interface PlayerLeaveMessage {
    type: 'playerLeave';
    payload: {
      uid: string;
    };
  }

  // 遊戲開始前雙方都輸入完秘密數字後，伺服器通知可以開始猜
export interface ReadyToGuessMessage {
  type: 'readyToGuess';
}

// 猜中密碼後，伺服器通知你贏了
export interface WinMessage {
  type: 'win';
}

// // 遊戲結束，伺服器回傳雙方猜的統計資料
// export interface GameEndMessage {
//   type: 'gameEnd';
//   summary: {
//     uid: string;
//     guesses: number;
//     duration: number; // 遊戲時間（毫秒）
//   }[];
// }

  export interface OpponentGuessedMessage {
    type: 'opponentGuessed';
      payload: {    
        uid: string;   // 對方的 uid
        count: number; // 他目前猜了幾次
      };
  }
  
  
  export type S2CMessage =
    | RoomCreatedMessage
    | JoinFailedMessage
    | GameStartMessage
    | GuessResultMessage
    | GameEndMessage
    | PlayerLeaveMessage;
  