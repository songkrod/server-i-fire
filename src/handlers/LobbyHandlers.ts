import { Server, Socket } from 'socket.io';
import { LobbyStore } from '../store/LobbyStore';
import Lobby, { MAX_MEMBER_PER_LOBBY } from '../models/LobbyModel';
import { UserStore } from '../store/UserStore';
import { LobbyIdType, UserReadyStateType } from '../@types/lobby.interface';
import Game from '../models/GameModel';
import { GameStore } from '../store/GameStore';
import { GameIdType } from '../@types/game.interface';

const getLobbyChannel = (lobbyId: string) => {
  return `lobby:${lobbyId}`;
}

export const forceLeaveLobby = (io: Server, socket: Socket) => {
  LobbyStore.forceUserLeaveLobby(socket.id);
  
  Object.keys(LobbyStore.lobbies).forEach((lobbyId) => {
    const lobbyChannel = getLobbyChannel(lobbyId);
    const lobby = LobbyStore.lobbies[lobbyId];

    socket.leave(lobbyChannel);
    
    io.to(lobbyChannel).emit('lobby:members', JSON.stringify(lobby.membersObject));
    if (lobby.owner) {
      io.to(lobbyChannel).emit('lobby:owner', JSON.stringify(lobby.owner.toObject));
    }
    io.to(lobbyChannel).emit('lobby:members:status', JSON.stringify(lobby.readyStatus));
  })
}

export default (io: Server, socket: Socket) => {
  const onCreateLobby = () => {
    const lobby = new Lobby();
    LobbyStore.addLobby(lobby);

    onJoinLobby(JSON.stringify({ id: lobby.id }));
  }

  const onJoinLobby = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;

    let lobby = LobbyStore.getLobbyById(id);
    const user = UserStore.getUserById(socket.id);

    if (!lobby) {
      io.to(socket.id).emit('lobby:join:failed');
      return;
    }

    if (lobby.members.length >= MAX_MEMBER_PER_LOBBY) {
      io.to(socket.id).emit('lobby:join:failed');
      return;
    }

    lobby.join(user);
    socket.join(`lobby:${lobby.id}`);
    io.to(socket.id).emit('lobby:join:success', JSON.stringify({ id: lobby.id }));
    
    onBoastcastLobby(id);
  }

  const onEnterLobby = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;
    let lobby = LobbyStore.getLobbyById(id);
    if (!lobby) return;

    onBoastcastLobby(id);
  }

  const onUpdateState = (payload: string) => {
    const {id, state} = JSON.parse(payload) as LobbyIdType<UserReadyStateType>;

    let lobby = LobbyStore.getLobbyById(id);
    lobby.setUserReadyState(socket.id, state);

    onBoastcastLobby(id);
  }

  const onLeaveLobby = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;
    let lobby = LobbyStore.getLobbyById(id);
    if (!lobby) return;
    
    const lobbyChannel = getLobbyChannel(id);
    lobby.leave(socket.id);
    socket.leave(lobbyChannel);

    onBoastcastLobby(id);
    if (lobby.members.length > 0) return;

    LobbyStore.removeLobby(lobby.id);
  }

  const onBoastcastLobby = (id: string) => {
    let lobby = LobbyStore.getLobbyById(id);
    if (!lobby) return;

    const lobbyChannel = getLobbyChannel(id);
    io.to(lobbyChannel).emit('lobby:members', JSON.stringify(lobby.membersObject));
    if (lobby.owner) {
      io.to(lobbyChannel).emit('lobby:owner', JSON.stringify(lobby.owner.toObject));
    }
    io.to(lobbyChannel).emit('lobby:members:status', JSON.stringify(lobby.readyStatus));
  }

  const onStartGame = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;
    let lobby = LobbyStore.getLobbyById(id);
    if (!lobby) return;

    const currentGame = GameStore.getGameById(lobby.id);
    if (currentGame) return;

    const game = new Game(lobby);
    GameStore.addGame(game);

    const lobbyChannel = getLobbyChannel(id);
    const gameChannel = `game:${game.id}`;
    lobby.members.forEach((member) => {
      lobby.leave(member.id);
      member.socket.leave(lobbyChannel);
      member.socket.join(gameChannel);
    })

    LobbyStore.removeLobby(lobby.id);

    io.to(gameChannel).emit('lobby:start:game');
  }

  socket.on('lobby:create', onCreateLobby);
  socket.on('lobby:join', onJoinLobby);
  socket.on('lobby:leave', onLeaveLobby);
  socket.on('lobby:ready', onUpdateState);
  socket.on('lobby:start', onStartGame);
  socket.on('lobby:enter', onEnterLobby);
}