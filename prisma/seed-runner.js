// prisma/seed-runner.js
import { execSync } from 'child_process';

try {
  execSync(
    // 'node --loader ts-node/esm prisma/seed.ts',
    // 'node --loader ts-node/esm --experimental-specifier-resolution=node -r tsconfig-paths/register prisma/seed.ts',
    'cross-env NODE_OPTIONS="--loader ts-node/esm --experimental-specifier-resolution=node" node -r tsconfig-paths/register prisma/seed.ts',
    {
        stdio: 'inherit', // This ensures console.log from seed.ts is visible
        shell: true       // Required for Windows to handle cross-env properly
    }
  );
} catch (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}
