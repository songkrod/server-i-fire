import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);

export const getId = () => {
  return nanoid();
}

export const sortCards = ( a: any, b: any ) => {
  if ( a.no < b.no ) {
    return -1;
  }

  if ( a.no > b.no ) {
    return 1;
  }

  return 0;
}