import { MongoClient } from 'mongodb';
import ora from 'ora';
import { errorWrapper, getConnections } from '../utils/index.js';

async function handler(name) {
  let spinner;
  let client;
  try {
    spinner = ora('Loading...').start();
    const connection = getConnections().find((item) => item.name === name);
    if (!connection) throw new Error(`Connection with name ${name} not found`);

    client = new MongoClient(connection.url);
    await client.connect();
    const admin = client.db().admin();
    const dbInfo = await admin.listDatabases();

    spinner.stop();
    console.table(dbInfo.databases);
  } finally {
    spinner?.stop();
    await client?.close();
  }
}

export const showDbs = errorWrapper(handler);
