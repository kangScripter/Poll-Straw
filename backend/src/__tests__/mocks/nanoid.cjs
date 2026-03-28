/**
 * CJS mock for nanoid (ESM-only) so Jest can load helpers.ts
 */
const customAlphabet = (alphabet, size) => {
  return () => {
    let id = '';
    for (let i = 0; i < size; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
  };
};
module.exports = { customAlphabet };
