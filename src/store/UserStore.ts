import { DynamicObjectValueType } from "../@types/common.interface";
import User from "../models/UserModel";

class UserProvider {
  private _users: DynamicObjectValueType<User> = {};

  addUser(user: User) {
    this._users[user.id] = user;
  }

  removeUser(userId: string) {
    delete this._users[userId];
  }

  get users () {
    return this._users;
  }

  getUserById(id: string) {
    return this._users[id];
  }
}

export const UserStore: UserProvider = new UserProvider();