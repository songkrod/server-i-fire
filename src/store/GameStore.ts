import Game from "../models/GameModel";

class GameProvider {
  private _games: Game[] = [];

  get games() {
    return this._games;
  }

  addGame(game: Game) {
    this._games = this._games.filter((_game) => _game.id === game.id);

    this._games.push(game);
  }

  getGameById(id: string) {
    const target = this._games.find((_game) => _game.id === id);

    return target || null;
  }
}

export const GameStore: GameProvider = new GameProvider();