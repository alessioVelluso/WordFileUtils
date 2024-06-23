const exec = require('child_process')

const args = process.argv.slice(2);
if (args.includes('--excel')) {
  console.log('Installing optional dependency...');
  exec('npm install exceljs', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error installing optional dependency: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
} else {
  console.log('Skipping optional dependency installation.');
}
