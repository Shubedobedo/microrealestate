const chalk = require('chalk');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const {
  status,
  dev,
  stop,
  start,
  build,
  displayHelp,
  displayHeader,
  askRunMode,
  config,
  askForEnvironmentVariables,
  writeDotEnv,
  restoreDB,
  dumpDB,
  askBackupFile,
} = require('./commands');
const { parseEnv } = require('./utils');

const argv = minimist(process.argv.slice(2));

const Main = async () => {
  process.on('SIGINT', () => {
    // do nothing on SIGINT to let the child process (docker-compose) to handle the signal
  });

  const command = argv._.length ? argv._[0] : '';
  const helpArg = argv.h || argv.help;
  const ciArg = !!argv.ci;

  displayHeader({ ci: ciArg });

  if (
    ![
      'build',
      'start',
      'stop',
      'dev',
      'status',
      'config',
      'restoredb',
      'dumpdb',
    ].includes(command) ||
    helpArg
  ) {
    displayHelp();
    return process.exit(helpArg ? 0 : 1);
  }

  if (!ciArg) {
    let envConfig = null;
    if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
      console.log('Found .env file and rely on it to run\n');
      envConfig = parseEnv();

      // for backward compatibility
      if (envConfig?.NGINX_PORT) {
        envConfig.GATEWAY_PORT = envConfig.NGINX_PORT;
        delete envConfig.NGINX_PORT;
      }
    }
    const promptsConfig = await askForEnvironmentVariables(envConfig);
    writeDotEnv(promptsConfig, envConfig);
  }

  try {
    switch (command) {
      case 'build':
        await stop({ ci: ciArg });
        await build({ ci: ciArg });
        break;
      case 'start':
        await start({ ci: ciArg });
        break;
      case 'stop':
        await stop({ ci: ciArg });
        break;
      case 'dev':
        await stop({ ci: false, runMode: 'dev' });
        await dev();
        break;
      case 'status':
        await status();
        break;
      case 'config': {
        const { runMode = 'prod' } = await askRunMode();
        await config(runMode);
        break;
      }
      case 'restoredb': {
        const { backupFile } = await askBackupFile();
        await restoreDB(backupFile);
        break;
      }
      case 'dumpdb':
        await dumpDB();
        break;
      default: // do nothing
    }
  } catch (error) {
    console.error(chalk.red(error.stack || error));
    process.exit(1);
  }
  process.exit(0);
};

Main();
