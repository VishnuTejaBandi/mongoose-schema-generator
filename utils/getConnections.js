export function getConnections() {
  return JSON.parse(localStorage.getItem('connections')) || [];
}
