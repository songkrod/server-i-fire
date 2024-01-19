import { DynamicObjectValueType } from "../@types/common.interface";
import { ActivityType, PlayerScoreType, PlayerType, StacksType } from "../@types/game.interface";
import { sortCards } from "../utils/commonUtils";
import Card from "./CardModel";
import Lobby from "./LobbyModel";
import Player from "./PlayerModel";
import User from "./UserModel";

const MAX_TURN = 10;
const MAX_CARD_IN_STACK = 5;
const MAX_CARD = 104;
const STACK_LOOP = [1, 2, 3, 4];

class Game {
  private _id: string;
  private _turn: number = 0;
  private _ownerId: string;
  private playerJoined: DynamicObjectValueType<boolean> = {};
  private playerReadyForNewTurn: string[] = [];
  private _players: DynamicObjectValueType<Player> = {};
  private cards: Card[] = [];
  private _stacks: StacksType = {
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
  }

  constructor (lobby: Lobby) {
    this._turn = 0;
    this._players = {};
    this.cards = [];
    this._ownerId = lobby.owner.id;
    this.playerReadyForNewTurn = [];
    this._id = lobby.id;
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
      this._players[user.id] = player;
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
    Object.keys(this._players).forEach((id) => {
      this.cards = this.shuffleCards(this.cards);
      const _cards = this.cards.splice(0, 10);
      const _sorted = _cards.sort(sortCards);
      this._players[id].hands = _sorted;
    });
  }

  private shuffleCards(cards: Card[]) {
    const array = [...cards];
    let currentIndex = array.length, randomIndex;

    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  standby(playerId: string) {
    this.playerJoined[playerId] = true;
  }

  leave(playerId: string) {
    delete this.playerJoined[playerId];
    delete this._players[playerId];
  }

  get id () {
    return this._id;
  }

  get stacks () {
    return this._stacks;
  }

  get stackObject() {
    return {
      stack1: this.getStackObject(this.stacks.stack1),
      stack2: this.getStackObject(this.stacks.stack2),
      stack3: this.getStackObject(this.stacks.stack3),
      stack4: this.getStackObject(this.stacks.stack4),
    }
  }

  private getStackObject(stack: Card[]) {
    return stack.map((card) => card.toObject);
  }

  get allPlayerJoined() {
    return Object.values(this.playerJoined).every((state) => state === true);
  }

  get playerJoinedStatus() {
    return this.playerJoined;
  }

  getPlayerHandsById(id: string) {
    return this._players[id].toObject;
  }

  get players () {
    return Object.values(this._players).map((player) => player.userObject);
  }

  playerPickCard(playerId: string, cardNo: number) {
    this._players[playerId].pickCard(cardNo);
  }

  get allPlayerPicked() {
    return Object.values(this._players).every((player) => player.pickedCard !== null);
  }

  get playersPicked() {
    return Object.values(this._players).filter((player) => player.pickedCard !== null).map((player) => player.id);
  }

  get playersPickedResult() {
    const picked: DynamicObjectValueType<{ no: number, score: number }> = {};
    
    Object.values(this._players).forEach((player) => {
      picked[player.id] = player.pickedCard!.toObject;
    });

    return picked;
  }

  getSortedPickedCards() {
    return Object.values(this._players).filter((player) => player.pickedCard !== null).map((player) => ({...player.pickedCard!.toObject, playerId: player.id})).sort(sortCards);
  }

  calculateActivityResult() {
    const activities: ActivityType[] = [];
    const sorted = this.getSortedPickedCards();

    const stacks = {
      stack1: [...this._stacks.stack1],
      stack2: [...this._stacks.stack2],
      stack3: [...this._stacks.stack3],
      stack4: [...this._stacks.stack4],
    };

    sorted.forEach((cardInfo) => {
      const lastOfStack: number[] = [
        stacks.stack1.at(-1)!.no, 
        stacks.stack2.at(-1)!.no, 
        stacks.stack3.at(-1)!.no, 
        stacks.stack4.at(-1)!.no
      ];

      const cardOwner = this._players[cardInfo.playerId];
      const card = cardOwner.pickedCard!;

      const _stackIndex = lastOfStack.findIndex((value) => value > card.no);
      const stackIndex = _stackIndex === -1 ? 4 : _stackIndex;
      const stackKey = `stack${stackIndex}` as keyof StacksType;

      if (stacks[stackKey].length >= MAX_CARD_IN_STACK) {
        // take all
        cardOwner.addScore(stacks[stackKey]);
        const score = stacks[stackKey].reduce((previous, current) => (previous + current.score), 0);
        stacks[stackKey] = [];
        activities.push({ 
          player: cardOwner.userObject, 
          action: 'TAKEAll', 
          detail: { 
            stackNo: stackIndex, 
            score: score 
          }, 
          stacks: {
            stack1: stacks.stack1.map((card) => card.toObject),
            stack2: stacks.stack2.map((card) => card.toObject),
            stack3: stacks.stack3.map((card) => card.toObject),
            stack4: stacks.stack4.map((card) => card.toObject),
          }
        });
      }

      // append in stack
      stacks[stackKey].push(card);
      activities.push({ 
        player: cardOwner.userObject, 
        action: 'PUSH', 
        detail: { 
          stackNo: stackIndex, 
          cardNo: card.no 
        }, 
        stacks: {
          stack1: stacks.stack1.map((card) => card.toObject),
          stack2: stacks.stack2.map((card) => card.toObject),
          stack3: stacks.stack3.map((card) => card.toObject),
          stack4: stacks.stack4.map((card) => card.toObject),
        }
      });
      cardOwner.clearPickCard();
    });

    this._stacks = stacks;

    return activities;
  }

  isShouldBuy() {
    const sorted = this.getSortedPickedCards();
    if (sorted.length === 0) return false;
    
    const card = sorted[0];
    return this._stacks.stack1.at(-1)!.no > card.no;
  }

  buyStack(playerId: string, stackNo: number) {
    const player = this._players[playerId];
    const stackKey = `stack${stackNo}` as keyof StacksType;
    const cards = this._stacks[stackKey];

    player.addScore(cards);

    const stacks: StacksType = {
      stack1: [],
      stack2: [],
      stack3: [],
      stack4: [],
    };

    stacks.stack4 = (stackNo > 3) ? this._stacks.stack3 : this._stacks.stack4;
    stacks.stack3 = (stackNo > 2) ? this._stacks.stack2 : this._stacks.stack3;
    stacks.stack2 = (stackNo > 1) ? this._stacks.stack1 : this._stacks.stack2;
    stacks.stack1 = [player.pickedCard!];

    
    player.clearPickCard();
    this._stacks = stacks;
  }

  get turn() {
    return this._turn;
  }

  startTurn() {
    this._turn += 1;
    this.playerReadyForNewTurn = [];
    Object.values((this._players)).forEach((player) => player.clearPickCard());
  }

  get isLastTurn () {
    return this._turn === MAX_TURN;
  }

  getPlayerScore() {
    const result: PlayerScoreType[] = Object.values(this._players).map((player) => ({
      ...player.userObject,
      score: player.score,
      owner: player.id === this._ownerId,
    }));

    return result;
  }

  isAllPlayerEndTurn() {
    return this.playerReadyForNewTurn.length === Object.keys(this._players).length;
  }

  playerEndTurn(playerId: string) {
    this.playerReadyForNewTurn.push(playerId);
  }
}

export default Game;