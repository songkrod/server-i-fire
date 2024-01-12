import { DynamicObjectValueType } from "../@types/common.interface";
import Lobby from "../models/LobbyModel";

class PlayerProvider {
  _lobbies: DynamicObjectValueType<Lobby> = {};

  addLobby(lobby: Lobby) {
    this._lobbies[lobby.id] = lobby;
  }

  removeLobby(lobby: Lobby) {
    delete this._lobbies[lobby.id];
  }

  get lobbies () {
    return this._lobbies;
  }

  getUserById(id: string) {
    return this._lobbies[id];
  }
}

export const PlayerStore: PlayerProvider = new PlayerProvider();