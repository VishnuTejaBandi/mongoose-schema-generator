/* eslint-disable no-use-before-define */
import ora from 'ora';
import clipboard from 'clipboardy';
import { MongoClient } from 'mongodb';
import { errorWrapper, getConnections } from '../../utils/index.js';
import { generateRawSchemaForObject, mergeSchemasByPage } from './schemaUtils.js';
import { MongooseSchemaGenerator } from './generateMongooseSchema.js';

async function handler(name, { collection: collectionName, db, sampleSize, pageSize, raw }) {
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

    const schema = await mergeSchemasByPage({ collection, pageSize, sampleSize });

    let result;
    if (raw) {
      result = JSON.stringify(generateRawSchemaForObject(schema), null, 2);
    } else {
      const mongooseSchemaGenerator = new MongooseSchemaGenerator(schema);
      mongooseSchemaGenerator.generate();
      result = mongooseSchemaGenerator.schema;
    }
    spinner.stop();
    clipboard.writeSync(result);
    console.log(
      '---------------------------------------------------------\n\n!!! Generated schema has been copied to clipboard !!!\n\n---------------------------------------------------------\n'
    );
    console.log(result);
  } finally {
    spinner?.stop();
    client?.close();
  }
}

export const generateSchema = errorWrapper(handler);
