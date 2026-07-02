const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:8080/api/v1';
const isProduction = process.env.NODE_ENV === 'production';

const content = `export const environment = {
  production: ${isProduction},
  apiUrl: '${apiUrl}'
};
`;

const envFile = isProduction ? 'environment.prod.ts' : 'environment.ts';
const envPath = path.join(__dirname, '..', 'src', 'environments', envFile);

fs.writeFileSync(envPath, content, 'utf-8');
console.log(`✓ ${envFile} escrito con apiUrl: ${apiUrl}`);