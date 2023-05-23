import { errorWrapper, getConnections } from '../utils/index.js';
import { showConnections } from './showConnections.js';

function handler(name, options) {
  let { name: newName, url: newUrl } = options;
  if (!newName && !newUrl) {
    throw new Error('Atleast one of <name>, <url> is required');
  }

  const connections = getConnections();

  const connectionPresent = connections.some((item) => item.name === name);
  if (!connectionPresent) throw new Error(`Cannot find connection - ${name}`);

  const connection = connections.find((item) => item.name === name);
  if (!newName) newName = connection.name;
  if (!newUrl) newUrl = connection.url;

  const cannotUseNewName = connections.some((item) => item.name === newName && item.name !== name);
  if (cannotUseNewName) throw new Error(`Cannot use new name ${newName} as it is already used for other connection`);

  connection.name = newName;
  connection.url = newUrl;
  localStorage.setItem('connections', JSON.stringify(connections));

  console.log(`Edited connection ${name} -> ${newName} successfully!`);
  showConnections();
}

export const editConnection = errorWrapper(handler);
