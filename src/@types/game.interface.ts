import Card from "../models/CardModel"
import { DynamicObjectValueType } from "./common.interface";

export type CardType = {
  no: number;
  score: number;
}

export type PlayerType = {
  id: string;
  name: string;
}

export type StacksType<T = Card> = {
  stack1: T[];
  stack2: T[];
  stack3: T[];
  stack4: T[];
}

export type GameIdType = {
  id: string;
}

export type PlayerPickCardType = GameIdType & {
  cardNo: number;
};

export type BuyStackType = GameIdType & { 
  stack: number;
};

type ActivityTakeAllType = {
  stackNo: number;
  score: number;
}

type ActivitPushType = {
  stackNo: number;
  cardNo: number;
}

export type ActivityType = {
  player: PlayerType;
  action: 'PUSH' | 'TAKEAll';
  detail: ActivityTakeAllType | ActivitPushType;
  stacks: StacksType<CardType>;
}

export type PlayerScoreType = PlayerType & {
  score: number;
  owner: boolean;
};