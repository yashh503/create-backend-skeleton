#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');

const packageJson = require('../package.json');

program
  .name('create-backend-skeleton')
  .description('Scaffold a production-ready Node.js + Express backend')
  .version(packageJson.version)
  .argument('[project-name]', 'Name of your project')
  .action(async (projectName) => {
    console.log(chalk.bold.cyan('\n🚀 Create Backend Skeleton\n'));

    // Get project name if not provided
    if (!projectName) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: 'my-backend',
          validate: (input) => {
            if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
            return 'Project name can only contain letters, numbers, dashes, and underscores';
          },
        },
      ]);
      projectName = name;
    }

    // Prompt for options
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'Select language:',
        choices: [
          { name: 'JavaScript', value: 'js' },
          { name: 'TypeScript', value: 'ts' },
        ],
      },
      {
        type: 'list',
        name: 'database',
        message: 'Select database:',
        choices: [
          { name: 'MongoDB (with Mongoose)', value: 'mongodb' },
          { name: 'PostgreSQL (with Prisma)', value: 'postgresql' },
          { name: 'None (in-memory store)', value: 'none' },
        ],
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Select package manager:',
        choices: [
          { name: 'npm', value: 'npm' },
          { name: 'yarn', value: 'yarn' },
          { name: 'pnpm', value: 'pnpm' },
        ],
        default: 'npm',
      },
    ]);

    const { language, database, packageManager } = answers;
    const templateName = `${language}-${database}`;
    const templateDir = path.join(__dirname, '..', 'templates', templateName);
    const targetDir = path.join(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Directory ${projectName} already exists. Overwrite?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('\nOperation cancelled.'));
        process.exit(0);
      }

      fs.removeSync(targetDir);
    }

    // Copy template
    const spinner = ora('Creating project...').start();

    try {
      // Copy template files
      await fs.copy(templateDir, targetDir);

      // Update package.json with project name
      const pkgPath = path.join(targetDir, 'package.json');
      const pkg = await fs.readJson(pkgPath);
      pkg.name = projectName;
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });

      spinner.succeed(chalk.green('Project created successfully!'));

      // Print next steps
      console.log(chalk.bold('\n📋 Next steps:\n'));
      console.log(chalk.cyan(`  cd ${projectName}`));

      const installCmd = packageManager === 'npm' ? 'npm install' : `${packageManager} install`;
      console.log(chalk.cyan(`  ${installCmd}`));

      if (database === 'postgresql') {
        console.log(chalk.cyan(`  npx prisma generate`));
        console.log(chalk.cyan(`  npx prisma db push`));
      }

      console.log(chalk.cyan('  cp .env.example .env'));
      console.log(chalk.cyan(`  ${packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`}`));

      console.log(chalk.bold('\n📁 Project structure:\n'));
      console.log(chalk.gray(`  ${projectName}/`));
      console.log(chalk.gray('  ├── src/'));
      console.log(chalk.gray('  │   ├── app.' + (language === 'ts' ? 'ts' : 'js')));
      console.log(chalk.gray('  │   ├── server.' + (language === 'ts' ? 'ts' : 'js')));
      console.log(chalk.gray('  │   ├── config/'));
      console.log(chalk.gray('  │   ├── loaders/'));
      console.log(chalk.gray('  │   ├── modules/'));
      console.log(chalk.gray('  │   ├── middlewares/'));
      console.log(chalk.gray('  │   └── utils/'));
      console.log(chalk.gray('  ├── .env.example'));
      console.log(chalk.gray('  └── README.md'));

      console.log(chalk.bold.green('\n✅ Happy coding!\n'));
      console.log(chalk.bold.green('કોડિંગ માં કાઈ નથી રાખ્યુ ભાઈ, ધંધો કરો!!'));
      
    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse();
