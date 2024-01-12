import { DynamicObjectValueType } from "../@types/common.interface";
import { StacksType } from "../@types/game.interface";
import { sortCards } from "../utils/commonUtils";
import Card from "./CardModel";
import Lobby from "./LobbyModel";
import Player from "./PlayerModel";
import User from "./UserModel";

const MAX_TURN = 10;
const MAX_CARD = 104;
const STACK_LOOP = [1, 2, 3, 4];

class Game {
  private turn: number = 0;
  private lobby: Lobby;
  private playerJoined: DynamicObjectValueType<boolean> = {};
  private players: DynamicObjectValueType<Player> = {};
  private cards: Card[] = [];
  private _stacks: StacksType = {
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
  }

  constructor (lobby: Lobby) {
    this.turn = 1;
    this.players = {};
    this.cards = [];
    this._stacks = {
      stack1: [],
      stack2: [],
      stack3: [],
      stack4: [],
    };
    
    this.initPlayers(lobby.members);
    this.createCards();
    this.drawCards();
  }

  private initPlayers(users: User[]) {
    users.map((user) => {
      const player = new Player(user);
      this.playerJoined[user.id] = false;
      this.players[user.id] = player;
    });
  }

  private createCards() {
    const cards = Array.apply(null, Array(MAX_CARD)).map((_, index) => {
      const no = index + 1;

      return new Card(no);
    });

    this.cards = this.shuffleCards(cards);
  }

  private drawCards() {
    // draw stack
    const pick: Card[] = [];
    STACK_LOOP.map(() => {
      let index = Math.round(Math.random() * (this.cards.length - 1));
  
      const picked = this.cards.splice(index, 1);
  
      pick.push(picked[0]);
    });
  
    const sorted = pick.sort(sortCards);
  
    this.stacks.stack1.push(sorted[0]);
    this.stacks.stack2.push(sorted[1]);
    this.stacks.stack3.push(sorted[2]);
    this.stacks.stack4.push(sorted[3]);

    // draw player hands
    Object.keys(this.players).forEach((id) => {
      this.cards = this.shuffleCards(this.cards);
      const _cards = [...this.cards.splice(0, 10)];

      this.players[id].hands = _cards.sort(sortCards);
    });
  }

  private shuffleCards(cards: Card[]) {
    const array = [...cards];
    let currentIndex = array.length,  randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  join(playerId: string) {
    this.playerJoined[playerId] = true;
  }

  get id () {
    return this.lobby.id;
  }

  get stacks () {
    return this._stacks;
  }

  get stackObject() {
    return {
      stack1: this.stacks.stack1.map((card) => card.toObject),
      stack2: this.stacks.stack1.map((card) => card.toObject),
      stack3: this.stacks.stack1.map((card) => card.toObject),
      stack4: this.stacks.stack1.map((card) => card.toObject),
    }
  }

  get allPlayerJoined() {
    return Object.values(this.playerJoined).every((state) => state === true);
  }

  getPlayerHandsById(id: string) {
    return this.players[id].toObject;
  }
}

export default Game;