const { randomBytes, secretbox } = require('tweetnacl');
const { encodeBase64 } = require('tweetnacl-util');

const generateKey = () => encodeBase64(randomBytes(secretbox.keyLength));
console.log('=======================================\n');
console.log('Encryption Key:');
console.log(generateKey());
