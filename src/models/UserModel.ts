import { Socket } from "socket.io";
import { getId } from "../utils/commonUtils";

class User {
  private socket: Socket;
  private _name = '';

  constructor(socket: Socket) {
    this.socket = socket;
    this._name = getId();
  }

  set name (_name: string) {
    this._name = _name;
  }

  get name () {
    return this._name;
  }

  get id () {
    return this.socket.id;
  }

  get toObject () {
    return { id: this.id, name: this._name };
  }
}

export default User;