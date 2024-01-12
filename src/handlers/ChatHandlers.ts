import { Server, Socket } from "socket.io";
import { MessageType } from "../@types/messageType.interface";
import { UserStore } from "../store/UserStore";

export default (io: Server, socket: Socket) => {
  const onReceiveMessage = (payload: MessageType) => {
    const user = UserStore.getUserById(socket.id);

    console.log(`onReceiveMessage ${user.name} - ${payload.message}`);

    socket.broadcast.emit("chat:message", {
      sender: user.name,
      message: payload.message,
    });
  };

  socket.on("chat:message", onReceiveMessage);
};
