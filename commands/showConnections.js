import { getConnections } from '../utils/index.js';

function chunkString(str, length) {
  return str.match(new RegExp(`.{1,${length}}`, 'g'));
}

export function consoleTableNewline(data) {
  const tmp = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of data) {
    const { name, url } = item;
    const urlChunks = url.split('\n');
    const nameChunks = name.split('\n');
    const maxChunkSize = Math.max(urlChunks.length, nameChunks.length);
    for (let index = 0; index < maxChunkSize; index += 1) {
      tmp.push({ name: nameChunks[index] || '', url: urlChunks[index] || '' });
    }
    tmp.push({ name: '', url: '' });
  }
  console.table(tmp);
}

export function showConnections() {
  const connections = getConnections();
  if (connections[0]) {
    const columnSize = process.stdout.columns;
    const maxSizeOfname = Math.max(connections.map((item) => item.name.length));

    const sizeForName = Math.min(maxSizeOfname, parseInt(columnSize / 4, 10));
    let sizeForUrl = parseInt(columnSize - sizeForName, 10);

    sizeForUrl -= 4;

    connections.forEach((item) => {
      let { name, url } = item;

      name = chunkString(name, sizeForName);
      url = chunkString(url, sizeForUrl);

      item.name = name.join('\n');
      item.url = url.join('\n');
    });
    consoleTableNewline(connections);
  } else {
    console.log('No Connections found!');
  }
}
