/* eslint-disable no-use-before-define */
import { getTypeOfElement, typeNumberToString, types } from '../../utils/index.js';

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

export function mergeSchemas(schemaA, schemaB) {
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

function getSchemaOfObject(obj) {
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

function getSchemaOfArray(arr) {
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

export async function mergeSchemasByPage({ collection, pageSize = 100, sampleSize }) {
  if (sampleSize < pageSize) pageSize = sampleSize;
  const promises = [];
  const totalPages = Math.ceil(sampleSize / pageSize);
  for (let page = 0; page < totalPages; page += 1) {
    const limit = page === totalPages - 1 ? sampleSize - pageSize * page : pageSize;
    promises.push(
      collection
        .find()
        .skip(page * pageSize)
        .limit(limit)
        .toArray()
        .then((docs) => {
          const [schema] = getSchemaOfArray(docs);
          return schema;
        })
    );
  }

  const schemas = await Promise.all(promises);
  let result = schemas[0];
  schemas.slice(1).forEach((schema) => {
    result = mergeSchemas(result, schema);
  });
  return result;
}

function generatePrettySchemaForArray([value]) {
  const type = getTypeOfElement(value);
  if (type === types.Array) return [generatePrettySchemaForArray(value)];
  if (type === types.Object) return [generatePrettySchemaForObject(value)];
  return [typeNumberToString[value]];
}

export function generatePrettySchemaForObject(obj) {
  const schema = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const type = getTypeOfElement(value);
      if (type === types.Array) schema[key] = generatePrettySchemaForArray(value);
      else if (type === types.Object) schema[key] = generatePrettySchemaForObject(value);
      else schema[key] = typeNumberToString[value];
    }
  }

  return schema;
}
