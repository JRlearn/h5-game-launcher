import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { C2SMessage, S2CMessage, CreateRoomMessage , JoinRoomMessage, SubmitSecretMessage, GuessMessage, LeaveMessage, RoomCreatedMessage, GameStartMessage } from './messageTypes';
import { GameRoom } from './gameRoom';

const wss = new WebSocket.Server({ port: 8082 });
const rooms = new Map<string, GameRoom>();
const players = new Map<WebSocket, Player>();

export interface Player {
    uid: string;
    ws: WebSocket;
    secret: string[];
    guesses: GuessRecord[];
    joinedAt: number; 
    ready: boolean;
    nickname: string;
  }
  
export  interface GuessRecord {
    guess: string[];
    result: string;
    time: number;
  }

function sendMessage<T extends S2CMessage>(ws: WebSocket, msg: T) {
  const data =JSON.stringify(msg)
  console.log('sendMessage',data)
  ws.send(data);
}
wss.on('connection', (ws) => {
    console.log('New client connected');
  ws.on('message', (raw) => {
    try {
        const msg: C2SMessage = JSON.parse(raw.toString());
        handleMessage(ws, msg); 
    } catch (err) {
      console.error('Invalid message:', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    handleLeave(ws);
    ws.close();
    }) 
});


function handleMessage(ws: WebSocket, msg: any) {
  const type = msg.type; 
  console.log('Received message:', msg);
  switch (type) {
    //創建房間
    case 'createRoom':  
      handleCreateRoom(ws, msg);
      break;
 
    //加入房間
    case 'joinRoom':  
      handleJoinRoom(ws, msg);
      break;
    

    // 提交密碼
    case 'submitSecret':  
      handleSubmitSecret(ws, msg);
      break; 

    // 猜數字
    case 'guess':  
      handleGuess(ws, msg);
      break; 

    // 離開房間
    case 'leave': 
        handleLeave(ws); 
        break;

    // 再玩一次
    case 'playAgain': 
        handlePlayAgain(ws);
        break; 

    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown command' }));
  }
}

function handleLeave(ws: WebSocket) {
    const player = players.get(ws);
    if (!player) return;
    const room = getRoomByPlayer(player);
    if (!room) return;
    broadcast(room, { type: 'leave', uid: player.uid });
    room.players.forEach((p)=>{
      players.delete( player.ws);
    })
    room.removePlayer(player);
    players.delete(ws);
    rooms.delete(room.id);

  }

  function handlePlayAgain(ws: WebSocket) {
    const player = players.get(ws);
    if (!player) return;
  
    const room = getRoomByPlayer(player);
    if (!room) return;
  
    // 加入該玩家的 vote
    room.rematchVotes.add(player.uid);
  
    // 通知對方此玩家已經想要 rematch
    broadcast(room, {
        type: 'rematchVoted',
        uid: player.uid,
        nickname: player.nickname,
      }, ws); // 排除自己
  
    // 若雙方都已選擇再來一局
    if (room.rematchVotes.size === 2) {
      room.reset(); // 清除狀態
      onGameStart(room); // 開始新一局
    }
  }

  function handleCreateRoom(ws: WebSocket, msg: CreateRoomMessage) {
    const roomId = uuidv4().slice(0, 3);
    const uid = uuidv4();
    const player: Player = {
      uid,
      ws,
      secret: [],
      guesses: [],
      joinedAt: Date.now(),
      ready: false,
      nickname: msg.payload.nickname,
    };
  
    const room = new GameRoom(roomId);
    room.addPlayer(player);
  
    rooms.set(roomId, room);
    players.set(ws, player);
  
    const response: RoomCreatedMessage = {
      type: 'roomCreated',
      payload: {
        roomId,
        uid,
      },
    };
    sendMessage(ws, response);
  }

// Handle Joining Room
function handleJoinRoom(ws: WebSocket, msg: JoinRoomMessage) {
  console.log('handleJoinRoom')
  const room = rooms.get(msg.payload.roomId);
  if (!room || room.started || room.players.length >= 2) {
    ws.send(JSON.stringify({ type: 'joinFailed', reason: 'Room not available' }));
    return;
  }

  const uid = uuidv4();
  const player: Player = {
    uid,
    ws,
    secret: [],
    guesses: [],
    joinedAt: Date.now(),
    ready: false,
    nickname: msg.payload.nickname,
  };

  room.players.push(player);
  players.set(ws, player);
  const response=  {
    type: 'joined',
    payload: {
      uid,
      nickname: msg.payload.nickname,
    },
  };

  ws.send( JSON.stringify(response));

  if (room.players.length === 2) {
    onGameStart(room); 
    room.started = true; 
  }
}

function onGameStart(room: GameRoom) {
  const response: GameStartMessage = {
    type: 'gameStart',
    payload: {
      players: room.players.map(p => ({
        uid: p.uid,
        nickname: p.nickname,
      })),
    },
  };
  room.started = true;
  room.broadcast(response);
}
 
function handleSubmitSecret(ws: WebSocket, msg: SubmitSecretMessage) {
  const player = players.get(ws);
  if (!player) return;

  player.secret = msg.payload.secret;
  player.ready = true;

  const room = getRoomByPlayer(player);
  if (!room) return;


  if (room.players.every(p => p.ready)) {
    broadcast(room, { type: 'readyToGuess' });
  }else{
    ws.send(JSON.stringify({
      type: 'waitSecret',
      payload:{}
    }));
  }
}

function handleGuess(ws: WebSocket, msg: GuessMessage) {
    const player = players.get(ws);
    if (!player) return;
  
    const room = getRoomByPlayer(player);
    if (!room) return;
  
    const opponent = room.players.find(p => p.uid !== player.uid);
    if (!opponent || !opponent.secret) return;
  
    const guess = msg.payload.guess;
    const result = getAB(guess, opponent.secret);
    const time = Date.now();
  
    player.guesses.push({ guess, result, time });
  
    ws.send(JSON.stringify({
      type: 'guessResult',
      payload:{     
        result,
        guess,
        count: player.guesses.length,
        opponentCount: opponent.guesses.length
      }
    }));

    opponent.ws.send(JSON.stringify({
      type: 'syncGuessCount',
      payload:{ 
      count: player.guesses.length,
      guess,
      result
    }
    }));

    if (room.isGameOver()) {
      const summary = room.getSummary();
      room.broadcast({ type: 'gameEnd',  payload:{  summary }});
    }else{
      if (result === '4A0B') {
        const data ={ 
          type: 'waitingResult',
          payload:{     
            result,
            guess,
            count: player.guesses.length
      }
      }
        ws.send(JSON.stringify(data))
    }}
  }

// Get Room by Player
function getRoomByPlayer(player: Player): GameRoom | undefined {
  return [...rooms.values()].find(room => room.players.includes(player));
}

function broadcast(room: GameRoom, message: any, excludeWs?: WebSocket) {
    for (const p of room.players) {
      if (p.ws !== excludeWs) {
        const data=JSON.stringify(message)
        console.log('broadcast',data)
        p.ws.send(data);
      }
    }
  }
  
// Get result of guess ('4A0B' style)
function getAB(guess: string[], answer: string[]): string {
  let a = 0, b = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === answer[i]) a++;
    else if (answer.includes(guess[i])) b++;
  }
  return `${a}A${b}B`;
}
