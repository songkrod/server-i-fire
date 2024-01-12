import { DynamicObjectValueType } from "../@types/common.interface";
import Lobby from "../models/LobbyModel";

class LobbyProvider {
  private _lobbies: DynamicObjectValueType<Lobby> = {};

  addLobby(lobby: Lobby) {
    this._lobbies[lobby.id] = lobby;
  }

  removeLobby(lobby: Lobby) {
    delete this._lobbies[lobby.id];
  }

  get lobbies () {
    return this._lobbies;
  }

  get lobby () {
    const lobbies = Object.values(this._lobbies);

    return lobbies[0] || null;
  }

  getUserById(id: string) {
    return this._lobbies[id];
  }
}

export const LobbyStore: LobbyProvider = new LobbyProvider();