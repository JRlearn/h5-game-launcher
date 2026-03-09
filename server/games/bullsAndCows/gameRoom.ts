import { Player } from "./server";

export class GameRoom {
  id: string;
  players: Player[];
  started: boolean;
  rematchVotes: Set<string> = new Set();

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.started = false;
  }



  resetVotes() {
    this.rematchVotes.clear();
  }

  addPlayer(player: Player): boolean {
    if (this.players.length >= 2 || this.started) return false;
    this.players.push(player);
    return true;
  }

  removePlayer(player: Player): void {
    this.players = this.players.filter(p => p !== player);
  }

  reset(): void {
    this.started = false;
    for (const player of this.players) {
      player.secret = [];
      player.guesses = [];
      player.ready = false;
    }
    this.resetVotes()
  }

  broadcast(message: any): void {
    for (const player of this.players) {
      player.ws.send(JSON.stringify(message));
    }
  }

  isReadyToStart(): boolean {
    return this.players.length === 2 && this.players.every(p => p.ready);
  }

  isGameOver(): boolean {
    return this.players.every(p => p.guesses.some(g => g.result === '4A0B'));
  }

  getSummary(): any {
    const winner = this.checkWinner();
    return this.players.map(p => ({
      uid: p.uid,
      guesses: p.guesses.length,
      duration: Date.now() - p.joinedAt,
      winner: p.uid === winner?.uid,
    }));
  }

  checkWinner() {
    if (this.players.length === 0) return null;
  
    return this.players.reduce((best, current) => {
      const currentGuesses = current.guesses.length;
      const bestGuesses = best.guesses.length;
      const currentDuration = current.guesses[current.guesses.length-1].time
      const bestDuration = best.guesses[best.guesses.length-1].time;
  
      if (
        currentGuesses < bestGuesses ||
        (currentGuesses === bestGuesses && currentDuration < bestDuration)
      ) {
        return current;
      }
      return best;
    }, this.players[0]);
  }

}