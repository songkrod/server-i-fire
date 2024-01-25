import { Server, Socket } from "socket.io";
import { ReceiveMessageType } from "../@types/chat.interface";
import { UserStore } from "../store/UserStore";

const getGameChannel = (gameId: string) => {
  return `game:${gameId}`;
};

export default (io: Server, socket: Socket) => {
  const onReceiveMessage = (payload: string) => {
    const { roomId, message } = JSON.parse(payload) as ReceiveMessageType;

    if (!roomId) return;

    const user = UserStore.getUserById(socket.id);
    if (!user) return;

    if (!message || message.trim().length === 0) return;

    broadcastMessage(roomId, user.name, message);
  };

  const broadcastMessage = (
    roomId: string,
    senderName: string,
    message: string
  ) => {
    const _message = { name: senderName, message };

    io.to(getGameChannel(roomId)).emit(
      `chat:feed:message`,
      JSON.stringify(_message)
    );
  };

  const onReceiveAnimateMessage = (payload: string) => {
    const { roomId, message } = JSON.parse(payload) as ReceiveMessageType;

    if (!roomId) return;

    const user = UserStore.getUserById(socket.id);
    if (!user) return;

    if (!message || message.trim().length === 0) return;

    broadcastAnimateMessage(roomId, user.id, message);
  };

  const broadcastAnimateMessage = (
    roomId: string,
    senderId: string,
    message: string
  ) => {
    const _message = { id: senderId, message };

    io.to(getGameChannel(roomId)).emit(
      `chat:feed:message:animate`,
      JSON.stringify(_message)
    );
  };

  socket.on(`chat:send:message`, onReceiveMessage);
  socket.on(`chat:send:message:animate`, onReceiveAnimateMessage);
};
