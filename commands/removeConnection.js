import { errorWrapper, getConnections } from '../utils/index.js';

function handler(name) {
  let connections = getConnections();
  const connectionPresent = connections.some((item) => item.name === name);
  if (!connectionPresent) throw new Error(`Connection name '${name}' is not present`);

  connections = connections.filter((item) => item.name !== name);
  localStorage.setItem('connections', JSON.stringify(connections));
  console.log(`Removed connection ${name} successfully!`);
}

export const removeConnection = errorWrapper(handler);
