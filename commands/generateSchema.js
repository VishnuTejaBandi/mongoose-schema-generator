/* eslint-disable no-use-before-define */
import ora from 'ora';
import { MongoClient } from 'mongodb';
import clipboard from 'clipboardy';
import { errorWrapper, getConnections, getTypeOfElement, types } from '../utils/index.js';

function mergeObjectSchemas(schemaA, schemaB) {
  const keys = new Set([...Object.keys(schemaA), ...Object.keys(schemaB)]);
  const schema = {};
  keys.forEach((key) => {
    schema[key] = mergeSchemas(schemaA[key], schemaB[key]);
  });
  return schema;
}

function mergeArraySchemas(schemaA, schemaB) {
  return [mergeSchemas(schemaA[0], schemaB[0])];
}

function mergeSchemas(schemaA, schemaB) {
  if (!schemaB) return schemaA;
  if (!schemaA) return schemaB;

  const type = getTypeOfElement(schemaA);
  if (type === getTypeOfElement(schemaB)) {
    if (type === types.Object) {
      return mergeObjectSchemas(schemaA, schemaB);
    }
    if (type === types.Array) {
      return mergeArraySchemas(schemaA, schemaB);
    }

    return schemaA === schemaB ? schemaA : types.Mixed;
  }

  return types.Mixed;
}

export function getSchemaOfObject(obj) {
  const schema = {};
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    const value = obj[key];

    if (value == null) return;

    const type = getTypeOfElement(value);
    if (type === types.Object) {
      schema[key] = getSchemaOfObject(value);
    } else if (type === types.Array) {
      schema[key] = getSchemaOfArray(value);
    } else {
      schema[key] = type;
    }
  });

  return schema;
}

export function getSchemaOfArray(arr) {
  if (!arr[0]) return [];

  const predictedType = getTypeOfElement(arr[0]);
  const allElementsHaveSameType = arr.slice(1).every((schema) => getTypeOfElement(schema) === predictedType);

  if (allElementsHaveSameType) {
    if (predictedType === types.Object) {
      let schema = getSchemaOfObject(arr[0]);
      arr.slice(1).forEach((e) => {
        schema = mergeSchemas(schema, getSchemaOfObject(e));
      });
      return [schema];
    }
    if (predictedType === types.Array) {
      let schema = getSchemaOfArray(arr[0]);
      arr.slice(1).forEach((e) => {
        schema = mergeSchemas(schema, getSchemaOfArray(e));
      });
      return [schema];
    }

    return [predictedType];
  }
  return [types.Mixed];
}

async function handler(name, { collection, db, sampleSize, workers }) {
  let spinner;
  let client;
  try {
    spinner = ora('Loading...').start();
    const connection = getConnections().find((item) => item.name === name);
    if (!connection) throw new Error(`Connection with name ${name} not found`);

    client = new MongoClient(connection.url);
    await client.connect();
    const database = client.db(db);

    spinner.stop();
    const documents = await database.collection(collection).find().limit(1000).toArray();
    clipboard.writeSync(JSON.stringify(getSchemaOfArray(documents)[0]));
    console.log(JSON.stringify(getSchemaOfArray(documents)[0], null, 2));
  } finally {
    spinner?.stop();
    await client?.close();
  }
}

export const generateSchema = errorWrapper(handler);
