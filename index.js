#!/usr/bin/env node
/* eslint-disable no-extend-native */

import { program } from 'commander';
import { LocalStorage } from 'node-localstorage';
// eslint-disable-next-line no-unused-vars
import cTable from 'console.table';
import os from 'os';
import path from 'path';
import {
  addConnection,
  editConnection,
  generateSchema,
  removeConnection,
  searchCollections,
  showConnections,
  showDbs,
} from './commands/index.js';

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function replaceAll(str, newStr) {
    // If a regex pattern
    if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
      return this.replace(str, newStr);
    }

    // If a string
    return this.replace(new RegExp(str, 'g'), newStr);
  };
}

String.prototype.capitalize = function capitalize() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

global.localStorage = new LocalStorage(path.resolve(os.homedir(), '.mongoose-schema-generator/.local-storage'));

program
  .name('mongoose-schema-generator')
  .description('cli that generates mongoose schema by scanning the data in a collection.')
  .version('0.0.1');

program
  .command('add-connection')
  .description('Add a connection to mongoose-schema-generator.')
  .argument('<name>', 'name of the connection')
  .requiredOption('-URL, --url <url>', 'URL of the connection')
  .action(addConnection);

program
  .command('show-connections')
  .description('Shows all connections added to mongoose schema generator')
  .action(showConnections);

program
  .command('remove-connection')
  .description('removes a connection from mongoose-schema-generator.')
  .argument('<name>', 'name of the connection')
  .action(removeConnection);

program
  .command('edit-connection')
  .description('edit a connection in mongoose-schema-generator.')
  .argument('<name>', 'name of the connection')
  .option('-N, --name <name>', 'name of the connection')
  .option('-URL, --url <url>', 'url of the connection')
  .action(editConnection);

program
  .command('show-dbs')
  .description('show dbs in a connection')
  .argument('<name>', 'name of the connection')
  .action(showDbs);

program
  .command('search-collections')
  .description('search for a collection')
  .argument('<connection>', 'name of the connection')
  .requiredOption('-DB, --db <db>', 'name of the db')
  .option('-S, --search <search>', 'search term')
  .option('-C, --count <count>', 'number of items', '10')
  .action(searchCollections);

program
  .command('generate-schema')
  .description('generate schema for a collection')
  .argument('<connection>', 'name of the connection')
  .requiredOption('-DB, --db <db>', 'name of the db')
  .requiredOption('-C, --collection <collection>', 'name of the collection')
  .option('-S, --sampleSize <sampleSize>', 'sample size', '500')
  .option('-P, --pageSize <pageSize>', 'page size for each worker', '100')
  .option('-R, --raw', 'displays raw schema instead of mongoose schema')
  .action(generateSchema);

program.parse();
