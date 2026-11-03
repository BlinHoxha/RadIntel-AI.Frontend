import { readFile, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';

const schema = new URL('../api/openapi.json', import.meta.url);
const target = new URL('../src/shared/api/generated.ts', import.meta.url);
const result = astToString(await openapiTS(schema));
if (process.argv.includes('--check')) {
  const existing = await readFile(target, 'utf8').catch(() => '');
  if (existing.replaceAll('\r\n', '\n') !== result.replaceAll('\r\n', '\n'))
    throw new Error(
      'Generated API types are stale. Run npm run contracts:generate and review the changes.',
    );
  console.log('Generated API types match the checked-in OpenAPI schema.');
} else {
  await writeFile(target, result);
  console.log('Generated API types from api/openapi.json.');
}
