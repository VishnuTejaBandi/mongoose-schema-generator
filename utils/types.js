export const types = {
  ObjectId: 0,
  Array: 1,
  Binary: 2,
  Boolean: 3,
  Code: 4,
  Date: 5,
  Decimal128: 6,
  Number: 7,
  Long: 8,
  MaxKey: 9,
  MinKey: 10,
  Object: 11,
  RegExp: 12,
  String: 13,
  Timestamp: 14,
  Mixed: 15,
};

export const typeNumberToString = Object.assign({}, ...Object.keys(types).map((x) => ({ [types[x]]: x })));

export function getTypeOfElement(element) {
  return types[element.constructor.name];
}
