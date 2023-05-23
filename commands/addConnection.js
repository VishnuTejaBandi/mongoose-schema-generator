import { errorWrapper, getConnections } from '../utils/index.js';

function handler(name, options) {
  const { url } = options;
  const connections = getConnections();
  const connectionAlreadyPresent = connections.some((item) => item.name === name);
  if (connectionAlreadyPresent) throw new Error(`Connection name '${name}' is already used`);

  connections.push({ name, url });
  localStorage.setItem('connections', JSON.stringify(connections));
  console.log(`Added connection ${name} successfully!`);
}

export const addConnection = errorWrapper(handler);
