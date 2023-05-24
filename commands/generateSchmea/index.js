/* eslint-disable no-use-before-define */
import ora from 'ora';
import clipboard from 'clipboardy';
import { MongoClient } from 'mongodb';
import { errorWrapper, getConnections } from '../../utils/index.js';
import { generatePrettySchemaForObject, mergeSchemasByPage } from './schemaUtils.js';

async function handler(name, { collection: collectionName, db, sampleSize, pageSize }) {
  sampleSize = parseInt(sampleSize, 10) || 500;
  pageSize = parseInt(pageSize, 10) || 100;

  let client;
  let spinner;
  try {
    spinner = ora('Loading...').start();
    const connection = getConnections().find((item) => item.name === name);
    if (!connection) throw new Error(`Connection with name ${name} not found`);

    client = new MongoClient(connection.url);
    const database = client.db(db);
    const collection = database.collection(collectionName);

    const schema = generatePrettySchemaForObject(await mergeSchemasByPage({ collection, pageSize, sampleSize }));

    spinner.stop();
    clipboard.writeSync(JSON.stringify(schema));
    console.log(JSON.stringify(schema, null, 2));
  } finally {
    spinner?.stop();
    client?.close();
  }
}

export const generateSchema = errorWrapper(handler);
