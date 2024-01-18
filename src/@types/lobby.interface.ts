export type UserReadyStateType = {
  state: boolean;
}

export type LobbyIdType<T> = {
  id: string;
} & T;