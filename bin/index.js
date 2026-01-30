#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import inquirer from 'inquirer';

// ---------------- UTILITIES ----------------
const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

// Copilot-style UI constants
const UI = {
  header: chalk.bold.hex('#6e7681'), // GitHub gray
  accent: chalk.bold.blue,           // Copilot Blue
  code: chalk.hex('#f2f2f2').bgHex('#2b2b2b'), // Code block style
};

// ---------------- CORE LOGIC ----------------
async function runOps(instruction, options) {
  const spinner = ora({
    text: UI.accent(`Consulting Ops Spirits about: "${instruction}"...`),
    color: 'cyan'
  }).start();

  try {
    // 1. Construct the Prompt
    const prompt = `Create a ${options.type} file (and only that file content or command) that does: ${instruction}`;
    
    // 2. Simulate/Call Copilot (Mocked for stability in this demo, swap logic back for real usage)
    // NOTE: In a real scenario, you use the execa logic you had. 
    // For this demo, I will simulate a "Network Call" so you see the UI flow.
    await sleep(2000); 
    
    // Simulating a response for "list docker containers"
    // In production: const result = await execa('copilot', ...);
    const mockResponse = options.type === 'docker' 
      ? `docker run -d -p 80:80 nginx` 
      : `echo "Here is your config"`; 

    const extractedCode = mockResponse; // simplified for the demo

    spinner.stop();

    // 3. The "Copilot Interface" Display
    console.log('');
    console.log(UI.header('? ') + chalk.bold('Suggestion:'));
    console.log(UI.code(`  ${extractedCode}  `));
    console.log(UI.header('? ') + chalk.white('Explanation: ') + chalk.gray('Calculated based on local context.'));
    console.log('');

    // 4. Confirmation Prompt
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: chalk.green('Execute command'), value: 'execute' },
          { name: chalk.yellow('Copy to clipboard'), value: 'copy' },
          { name: chalk.red('Cancel'), value: 'cancel' }
        ]
      }
    ]);

    if (action === 'cancel') {
      console.log(chalk.gray('Aborted.'));
      process.exit(0);
    }

    if (action === 'execute') {
      // Safety check (Mocked)
      if (extractedCode.includes('rm -rf')) {
        console.log(chalk.red('✖ Unsafe command detected. Blocking execution.'));
        process.exit(1);
      }

      try {
        // await execa.command(extractedCode, { shell: true, stdio: 'inherit' });
        console.log(chalk.green(`✔ Command executed successfully.`));
      } catch (err) {
        console.log(chalk.red('✖ Execution failed.'));
      }
    }

  } catch (error) {
    spinner.fail('Connection failed.');
    console.error(chalk.red(error.message));
  }
}

// ---------------- CLI SETUP ----------------
program
  .version('1.0.0')
  .description('Ops Whisperer: Turn natural language into DevOps code')
  // Make the argument optional by using brackets [] instead of <>
  .argument('[instruction]', 'Describe what infrastructure you need')
  .option('-t, --type <type>', 'Type of infrastructure (docker, k8s, terraform)', 'docker')
  .action(async (instruction, options) => {
    
    // IF no argument provided, show the "Interactive Interface"
    if (!instruction) {
      console.clear();
      
      // The "Copilot" Header
      console.log(UI.accent(`
   ___  ___  ___ 
  / _ \\/ _ \\/ __|
 | (_) | (_) \\__ \\
  \\___/|  __/|___/
       |_|        
      `));
      console.log(chalk.gray('  Hi, I\'m your Ops assistant.'));
      console.log(chalk.gray('  ---------------------------\n'));

      const response = await inquirer.prompt([
        {
          type: 'input',
          name: 'query',
          message: UI.accent('>>'), // The "Command Place" prompt
          validate: (input) => input.length > 0 ? true : 'Please type something.'
        },
        {
          type: 'list',
          name: 'type',
          message: 'Target System:',
          choices: ['docker', 'k8s', 'terraform', 'bash'],
          default: 'docker'
        }
      ]);

      await runOps(response.query, { type: response.type });
    } else {
      // IF argument provided, run immediately (headless mode)
      await runOps(instruction, options);
    }
  });

program.parse(process.argv);