import { Server, Socket } from 'socket.io';
import { LobbyStore } from '../store/LobbyStore';
import Lobby, { MAX_MEMBER_PER_LOBBY } from '../models/LobbyModel';
import { UserStore } from '../store/UserStore';
import { UserReadyStateType } from '../@types/lobby.interface';
import Game from '../models/GameModel';
import { GameStore } from '../store/GameStore';

export default (io: Server, socket: Socket) => {
  const onJoinLobby = () => {
    let lobby = LobbyStore.lobby;
    const user = UserStore.getUserById(socket.id);

    if (!lobby) {
      lobby = new Lobby(user);
      LobbyStore.addLobby(lobby);
    }

    if (lobby.members.length >= MAX_MEMBER_PER_LOBBY) {
      io.to(socket.id).emit('lobby:join:failed');
      return;
    }

    lobby.join(user);
    socket.join(lobby.id);
    io.to(socket.id).emit('lobby:join:success');
    
    onBoastcastLobby();
  }

  const onUpdateState = (payload: string) => {
    const status = JSON.parse(payload) as UserReadyStateType;

    const lobby = LobbyStore.lobby;
    lobby.setUserReadyState(socket.id, status.state);

    onBoastcastLobby();
  }

  const onLeaveLobby = () => {
    const lobby = LobbyStore.lobby;
    if (!lobby) return;
    
    lobby.leave(socket.id);
    socket.leave(lobby.id);
    
    onBoastcastLobby();
  }

  const onBoastcastLobby = () => {
    const lobby = LobbyStore.lobby;
    if (!lobby) return;

    io.to(lobby.id).emit('lobby:members', JSON.stringify(lobby.membersObject));
    io.to(lobby.id).emit('lobby:owner', JSON.stringify(lobby.membersObject[0]));
    io.to(lobby.id).emit('lobby:members:status', JSON.stringify(lobby.readyStatus));
  }

  const onStartGame = () => {
    const lobby = LobbyStore.lobby;
    if (!lobby) return;

    const currentGame = GameStore.getGameById(lobby.id);
    if (currentGame) return;

    const game = new Game(lobby);
    GameStore.addGame(game);
    
    io.to(lobby.id).emit('lobby:start:game', JSON.stringify({ id: game.id }));
  }

  socket.on('lobby:join', onJoinLobby);
  socket.on('lobby:leave', onLeaveLobby);
  socket.on('lobby:ready', onUpdateState);
  socket.on('lobby:start', onStartGame);
  socket.on('lobby:members:get', onBoastcastLobby);

  socket.on('user:disconnected', onLeaveLobby);
  socket.on('disconnect', onLeaveLobby);
}