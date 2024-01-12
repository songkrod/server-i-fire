import { customAlphabet } from 'nanoid';
import Card from '../models/CardModel';
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);

export const getId = () => {
  return nanoid();
}

export const sortCards = ( a: Card, b: Card ) => {
  if ( a.no < b.no ) {
    return -1;
  }

  if ( a.no > b.no ) {
    return 1;
  }

  return 0;
}