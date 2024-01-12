import { Server, Socket } from 'socket.io';
import { GameStore } from '../store/GameStore';
import Game from '../models/GameModel';
import { GameIdType } from '../@types/game.interface';

export default (io: Server, socket: Socket) => {
  const onJoinGame = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;

    const game = GameStore.getGameById(id);
    if (!game) {
      io.to(socket.id).emit('game:join:failed');
      return;
    }

    game.join(socket.id);
    io.to(socket.id).emit('game:join:success');

    if (!game.allPlayerJoined) return;
    io.to(game.id).emit('game:members:update');
  }

  socket.on('game:join', onJoinGame);
}