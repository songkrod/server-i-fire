import User from './UserModel';
import { getId } from '../utils/commonUtils';
import type { DynamicObjectValueType } from '../@types/common.interface';

export const MAX_MEMBER_PER_LOBBY = 10;

class Lobby {
  private _id = '';
  private _members: User[];
  private readyStates: DynamicObjectValueType<boolean> = {};

  constructor() {
    this._id = getId();
    this._members = [];
  }

  set id (_id: string) {
    this._id = _id;
  }

  get id () {
    return this._id;
  }

  join(user: User) {
    this._members.push(user);
    this.readyStates[user.id] = false;
  }

  leave(userId: string) {
    const updatedMembers = this._members.filter((member) => member.id !== userId);

    this._members = updatedMembers;
    delete this.readyStates[userId];
  }

  setUserReadyState(userId: string, status: boolean) {
    if (this.readyStates[userId] === undefined) return;

    this.readyStates[userId] = status;
  }

  get members () {
    return this._members;
  }

  get membersObject () {
    return this._members.map((member) => member.toObject)
  }

  get owner () {
    return this._members[0];
  }

  get readyStatus () {
    return this.readyStates;
  }

  getLobbyStatus() {
    return Object.values(this.readyStates).every((status) => status === true);
  }
}

export default Lobby;
