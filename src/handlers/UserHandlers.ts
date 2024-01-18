import { Server, Socket } from 'socket.io';
import { UserStore } from '../store/UserStore';
import { UserType } from '../@types/user.interface';
import { forceLeaveLobby } from './LobbyHandlers';
import { forceLeaveGame } from './GameHandlers';

export default (io: Server, socket: Socket) => {
  const onDisconnect = () => {
    console.log(`User: ${socket.id} disconnected`);
    forceLeaveLobby(io, socket);
    forceLeaveGame(io, socket);
    UserStore.removeUser(socket.id);
  }

  const onForceDisconnect = () => {
    console.log(`User: ${socket.id} disconnected`);
    forceLeaveLobby(io, socket);
    forceLeaveGame(io, socket);
    socket.disconnect();
    UserStore.removeUser(socket.id);
  }

  const onUserUpdate = (payload: string) => {
    const { name } = JSON.parse(payload) as UserType;
    
    const user = UserStore.getUserById(socket.id);
    user.name = name;
  }

  socket.on('user:update', onUserUpdate);
  socket.on('user:disconnected', onForceDisconnect);
  socket.on('disconnect', onDisconnect);
}