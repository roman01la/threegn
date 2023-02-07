export function log(...args) {
  if (_DEBUG_) {
    console.log(...args);
  }
}
