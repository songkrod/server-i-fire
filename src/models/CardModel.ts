const CARD_SOCRE = {
  b2: [5, 15, 25, 35, 45, 65, 75, 85, 95],
  b3: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  b5: [11, 22, 33, 44, 66, 77, 88, 99],
  b7: [55]
}

class Card {
  private _no: number;
  private _score: number;

  constructor(no: number) {
    this._no = no;
    
    let score = 1;
    if (CARD_SOCRE.b2.includes(no)) {
      score = 2;
    } else if (CARD_SOCRE.b3.includes(no)) {
      score = 3;
    } else if (CARD_SOCRE.b5.includes(no)) {
      score = 5;
    } else if (CARD_SOCRE.b7.includes(no)) {
      score = 7;
    }

    this._score = score;
  }

  get no () {
    return this._no;
  }

  get score (): number {
    return this._score;
  }

  get toObject () {
    return { no: this._no, score: this._score };
  }
}

export default Card;