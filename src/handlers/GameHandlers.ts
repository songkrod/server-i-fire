import { Server, Socket } from 'socket.io';
import { GameStore } from '../store/GameStore';
import { BuyStackType, GameIdType, PlayerPickCardType } from '../@types/game.interface';
import { UserStore } from '../store/UserStore';
import Game from '../models/GameModel';
import Lobby from '../models/LobbyModel';
import { LobbyStore } from '../store/LobbyStore';

const getGameChannel = (gameId: string) => {
  return `game:${gameId}`
}

export const forceLeaveGame = (io: Server, socket: Socket) => {
  GameStore.forceUserLeaveGame(socket.id);
  
  Object.keys(GameStore.games).forEach((gameId) => {
    const gameChannel = getGameChannel(gameId);
    const game = GameStore.games[gameId];

    socket.leave(gameChannel);
    
    io.to(gameChannel).emit('game:players', JSON.stringify(game.players));
  })
}

export default (io: Server, socket: Socket) => {
  const onJoinGame = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;
    const game = GameStore.getGameById(id);
    if (!game) {
      io.to(socket.id).emit('game:join:failed');
      return;
    }

    game.standby(socket.id);
    const playerHands = game.getPlayerHandsById(socket.id);
    io.to(socket.id).emit('game:join:success');
    io.to(socket.id).emit('game:stacks', JSON.stringify(game.stackObject));
    io.to(socket.id).emit('game:players', JSON.stringify(game.players));
    io.to(socket.id).emit('game:hands', JSON.stringify(playerHands));

    if (!game.allPlayerJoined) return;
    io.to(getGameChannel(game.id)).emit('game:members:ready');
    onStartTurn(game);
  }

  const onLeaveGame = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;
    
    const game = GameStore.getGameById(id);
    if (!game) return;
    const gameChannel = getGameChannel(game.id);
    
    game.leave(socket.id);
    socket.leave(gameChannel);
    
    io.to(gameChannel).emit('game:players', JSON.stringify(game.players));
    if (game.players.length > 0) return;

    GameStore.removeGame(game.id);
  }

  const onPlayerPickCard = (payload: string) => {
    const { id, cardNo } = JSON.parse(payload) as PlayerPickCardType;
    
    const game = GameStore.getGameById(id);
    if (!game) return;

    game.playerPickCard(socket.id, cardNo);
    const playerHands = game.getPlayerHandsById(socket.id);
    
    io.to(socket.id).emit('game:hands', JSON.stringify(playerHands));
    io.to(getGameChannel(game.id)).emit('game:player:picked', JSON.stringify(game.playersPicked));

    if (game.allPlayerPicked) {
      io.to(getGameChannel(game.id)).emit('game:player:picked:result', JSON.stringify(game.playersPickedResult));

      if (game.isShouldBuy()) {
        const cards = game.getSortedPickedCards();
        const buyerId = cards[0]!.playerId;

        const buyer = UserStore.getUserById(buyerId);
        io.to(getGameChannel(game.id)).except(buyerId).emit('game:player:buy', JSON.stringify({ buyer: buyer.toObject }));
        io.to(buyerId).emit('game:player:buyer');
      } else {
        calculateTurnResult(game);
      }
    }
  }

  const onPlayerBuyStack = (payload: string) => {
    const { id, stack } = JSON.parse(payload) as BuyStackType;

    const game = GameStore.getGameById(id);
    if (!game) return;
    
    const gameChannel = getGameChannel(game.id);
    const buyer = UserStore.getUserById(socket.id);
    game.buyStack(socket.id, stack);

    io.to(gameChannel).emit('game:player:bought', JSON.stringify({ buyer: buyer.toObject, stack: stack, stacks: game.stackObject }));

    setTimeout(() => calculateTurnResult(game), 1000);
  }

  const calculateTurnResult = (game: Game) => {
    const activities = game.calculateActivityResult();

    io.to(getGameChannel(game.id)).emit('game:activity', JSON.stringify(activities));
  }

  const onStartTurn = (game: Game) => {
    game.startTurn();
    Object.values(game.players).forEach((player) => {
      const playerHands = game.getPlayerHandsById(player.id);
      io.to(player.id).emit('game:hands', JSON.stringify(playerHands));
    })

    io.to(getGameChannel(game.id)).emit('game:stacks', JSON.stringify(game.stackObject));
    io.to(getGameChannel(game.id)).emit('game:start:turn');
  }

  const onEndTurn = (payload: string) => {
    const { id } = JSON.parse(payload) as GameIdType;
    
    const game = GameStore.getGameById(id);
    if (!game) return;
    game.playerEndTurn(socket.id);

    if (game.isLastTurn) {
      io.to(getGameChannel(game.id)).emit('game:result', JSON.stringify(game.getPlayerScore()));
      return;
    }

    if (!game.isAllPlayerEndTurn()) return;
    onStartTurn(game);
  }

  socket.on('game:join', onJoinGame);
  socket.on('game:leave', onLeaveGame);
  socket.on('game:player:pick', onPlayerPickCard);
  socket.on('game:player:buy:stack', onPlayerBuyStack);
  socket.on('game:end:turn', onEndTurn);
}