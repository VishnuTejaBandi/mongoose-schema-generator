import { MongoClient } from 'mongodb';
import ora from 'ora';
import { matchSorter } from 'match-sorter';
import { errorWrapper, getConnections } from '../utils/index.js';

async function handler(name, { db, count, search }) {
  let spinner;
  let client;
  try {
    spinner = ora('Loading...').start();
    const connection = getConnections().find((item) => item.name === name);
    if (!connection) throw new Error(`Connection with name ${name} not found`);

    client = new MongoClient(connection.url);
    await client.connect();
    const database = client.db(db);
    let collections = await database.collections({ nameOnly: true });

    collections = collections.map((x) => x.collectionName);
    if (search) collections = matchSorter(collections, search);
    collections = collections.slice(0, parseInt(count, 10) || 10);

    const result = [];
    for (let i = 0; i < collections.length; i += 1) {
      const collectionName = collections[i];
      result.push({
        name,
        // eslint-disable-next-line no-await-in-loop
        'Count of documents': await database.collection(collectionName).countDocuments(),
      });
    }

    spinner.stop();
    console.table(result);
  } finally {
    spinner?.stop();
    await client?.close();
  }
}

export const searchCollections = errorWrapper(handler);
