import Card from "./CardModel";
import User from "./UserModel";

class Player {
  private _user: User;
  private _hands: Card[] = [];
  private _score: Card[] = [];
  private _pickedCard: Card | null = null;

  constructor(user: User) {
    this._user = user;
    this.reset();
  }

  get id () {
    return this._user.id;
  }

  set hands (cards: Card[]) {
    this._hands = cards;
  }

  get hands () {
    return this._hands;
  }

  get toObject() {
    return this._hands.map((card) => card.toObject);
  }

  get pickedCard() {
    return this._pickedCard || null;
  }

  pickCard(no: number) {
    const target = this._hands.find((card) => card.no === no);
    this._hands = this._hands.filter((card) => card.no !== no);

    if (!target) return;

    this._pickedCard = target;
  }

  clearPickCard() {
    this._pickedCard = null;
  }

  addScore(cards: Card[]) {
    this._score = [...this._score, ...cards];
  }

  get score (): number {
    return this._score.reduce((prev, current) => {
      return prev + current.score;
    }, 0);
  }

  get userObject() {
    return this._user.toObject;
  }

  reset() {
    this._hands = [];
    this._score = [];
    this._pickedCard = null;
  }
}

export default Player;