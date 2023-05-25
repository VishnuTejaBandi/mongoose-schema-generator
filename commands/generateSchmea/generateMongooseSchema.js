/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
import prettier from 'prettier';
import { getTypeOfElement, types } from '../../utils/index.js';

const typesToMongooseTypes = {
  [types.ObjectId]: 'Schema.Types.ObjectId',
  [types.Binary]: 'Schema.Types.Mixed',
  [types.Boolean]: 'Boolean',
  [types.Code]: 'Schema.Types.Mixed',
  [types.Date]: 'Date',
  [types.Decimal128]: 'Schema.Types.Decimal128',
  [types.Number]: 'Number',
  [types.Long]: 'Schema.Types.BigInt',
  [types.MaxKey]: 'Schema.Types.Mixed',
  [types.MinKey]: 'Schema.Types.Mixed',
  [types.RegExp]: 'RegExp',
  [types.String]: 'String',
  [types.Timestamp]: 'Schema.Types.Mixed',
  [types.Mixed]: 'Schema.Types.Mixed',
};

function objectToString(obj) {
  let result = `{`;
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      let value = obj[key];
      if (getTypeOfElement(value) === types.Number) value = typesToMongooseTypes[value];
      else if (getTypeOfElement(value) === types.Array) value = JSON.stringify(value).replaceAll('"', '');
      result += `'${key}': ${value},`;
    }
  }
  return `${result}}`;
}

function newSchemaString({ variableName, jsObjectAsString, hasId }) {
  const idOption = hasId ? '' : `, {id: false}`;
  return `const ${variableName} = new Schema(${jsObjectAsString}${idOption})`;
}

export class MongooseSchemaGenerator {
  constructor(baseSchema) {
    this.baseSchema = baseSchema;
    this.__newSchemas = ["import {Schema} from 'mongoose' \n"];
    this.schema = null;
  }

  generate() {
    for (const key in this.baseSchema) {
      if (Object.hasOwnProperty.call(this.baseSchema, key)) {
        const value = this.baseSchema[key];
        const type = getTypeOfElement(value);
        if (type === types.Object) this.baseSchema[key] = this.convertObjectsToSchemas({ obj: value, property: key });
        if (type === types.Array) this.baseSchema[key] = this.convertArrayToSchemas({ arr: value, property: key });
      }
    }

    let schema = `${this.__newSchemas.join('\n\n')}\n\n`;
    schema += `\n  export default ${objectToString(this.baseSchema)}`;

    this.schema = prettier.format(schema, { parser: 'babel', semi: true });
  }

  convertArrayToSchemas({ arr: [value], property }) {
    if (value == null) return [];
    const type = getTypeOfElement(value);
    if (type === types.Array) return [this.convertArrayToSchemas({ arr: value, property })];
    if (type === types.Object) return [this.convertObjectsToSchemas({ obj: value, property })];
    return [typesToMongooseTypes[value]];
  }

  convertObjectsToSchemas({ obj, property }) {
    const schemaName = `${property}Schema`;
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const type = getTypeOfElement(value);
        if (type === types.Object)
          obj[key] = this.convertObjectsToSchemas({ obj: value, property: `${property}${key.capitalize()}` });
        if (type === types.Array) obj[key] = this.convertArrayToSchemas({ arr: value, property: key });
      }
    }
    this.__newSchemas.push(
      newSchemaString({
        variableName: schemaName,
        jsObjectAsString: objectToString(obj),
        hasId: Object.keys(obj).includes('_id'),
      })
    );

    return schemaName;
  }
}
