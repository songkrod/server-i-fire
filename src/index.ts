import { createServer } from "http";
import { Server, Socket} from 'socket.io';
import UserHandlers from './handlers/UserHandlers';
import LobbyHandlers from './handlers/LobbyHandlers';
import GameHandlers from './handlers/GameHandlers';
import ChatHandlers from './handlers/ChatHandlers';
import { UserStore } from "./store/UserStore";
import User from "./models/UserModel";

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onConnection = (socket: Socket) => {
  console.log(`User: ${socket.id} is connected.`);

  const user = new User(socket);
  UserStore.addUser(user);

  UserHandlers(io, socket);
  LobbyHandlers(io, socket);
  GameHandlers(io, socket);
  ChatHandlers(io, socket);
}

io.on('connection', onConnection);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});