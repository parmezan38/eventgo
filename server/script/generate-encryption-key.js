const { randomBytes, secretbox } = require('tweetnacl');
const { encodeBase64 } = require('tweetnacl-util');

const generateKey = () => encodeBase64(randomBytes(secretbox.keyLength));

console.log('Encryption key:');
console.log(generateKey());
