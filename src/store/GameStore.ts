import { DynamicObjectValueType } from "../@types/common.interface";
import Game from "../models/GameModel";

class GameProvider {
  private _games: DynamicObjectValueType<Game> = {};

  get games() {
    return this._games;
  }

  addGame(game: Game) {
    this._games[game.id] = game;
  }

  removeGame(id: string) {
    delete this._games[id];
  }

  getGameById(id: string) {
    return this._games[id];
  }

  forceUserLeaveGame(userId: string) {
    Object.values(this._games).forEach((game) => game.leave(userId));
  }
}

export const GameStore: GameProvider = new GameProvider();