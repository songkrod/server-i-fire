import { Server, Socket } from 'socket.io';
import { UserStore } from '../store/UserStore';
import { UserType } from '../@types/user.interface';

export default (io: Server, socket: Socket) => {
  const onDisconnect = () => {
    console.log(`User: ${socket.id} disconnected`);
    UserStore.removeUser(socket.id);
  }

  const onForceDisconnect = () => {
    console.log(`User: ${socket.id} disconnected`);
    socket.disconnect();
    UserStore.removeUser(socket.id);
  }

  const onUserUpdate = (payload: string) => {
    const _user = JSON.parse(payload) as UserType;
    
    const user = UserStore.getUserById(_user.id);
    user.name = _user.name;
  }

  socket.on('user:update', onUserUpdate);
  socket.on('user:disconnected', onForceDisconnect);
  socket.on('disconnect', onDisconnect);
}