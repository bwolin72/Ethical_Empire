const fs = require('fs-extra');
const path = require('path');

const buildPath = path.join(__dirname, 'build');
const targetPath = path.join(__dirname, '..', 'backend', 'frontend');

(async () => {
  try {
    await fs.remove(targetPath);
    await fs.copy(buildPath, targetPath);
    console.log('✅ Build moved to backend/frontend successfully.');
  } catch (err) {
    console.error('❌ Failed to move build:', err);
    process.exit(1);
  }
})();
