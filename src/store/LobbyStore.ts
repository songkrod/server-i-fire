import { DynamicObjectValueType } from "../@types/common.interface";
import Lobby from "../models/LobbyModel";

class LobbyProvider {
  private _lobbies: DynamicObjectValueType<Lobby> = {};

  addLobby(lobby: Lobby) {
    this._lobbies[lobby.id] = lobby;
  }

  removeLobby(lobbyId: string) {
    delete this._lobbies[lobbyId];
  }

  get lobbies () {
    return this._lobbies;
  }

  getLobbyById(id: string) {
    return this._lobbies[id];
  }

  forceUserLeaveLobby(userId: string) {
    Object.values(this._lobbies).forEach((lobby) => lobby.leave(userId));
  }
}

export const LobbyStore: LobbyProvider = new LobbyProvider();