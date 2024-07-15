import { writeFileSync } from 'fs';

const file = './dist/package.json';
const data = '{ "type": "" }'; // to override ESM in main package.json

writeFileSync(file, data);