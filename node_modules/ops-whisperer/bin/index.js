#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import inquirer from 'inquirer';

// ---------------- CLI SETUP ----------------
program
  .version('1.0.0')
  .description('Ops Whisperer: Turn natural language into DevOps code');

program
  .argument('<instruction>', 'Describe what infrastructure you need')
  .option('-t, --type <type>', 'Type of infrastructure (docker, k8s, terraform)', 'docker')
  .action(async (instruction, options) => {
    const spinner = ora(
      `Consulting the Ops Spirits about "${instruction}"...`
    ).start();

    try {
      // -------- PROMPT --------
      const prompt = `Create a ${options.type} file that does: ${instruction}`;
      spinner.stop();

      // -------- CALL COPILOT --------
      let result;
      try {
        // Use execa to call the copilot CLI with the generated prompt
        result = await execa('copilot', ['-p', prompt], {
          input: 'n\n' // Automatically deny permissions
        });
      } catch (err) {
        spinner.fail('Copilot execution failed.');
        throw new Error(
          'Copilot CLI not found. Install it from https://github.com/github/copilot-cli'
        );
      }

      spinner.start();

      const fullOutput = (result.stdout + result.stderr).trim();

      // -------- HARD STOP: QUOTA / EMPTY --------
      if (
        !fullOutput ||
        fullOutput.toLowerCase().includes('quota exceeded') ||
        fullOutput.toLowerCase().includes('upgrade') ||
        fullOutput.toLowerCase().includes('total code changes')
      ) {
        spinner.fail('Copilot did not return usable code.');
        console.error(
          chalk.red('\nCopilot quota exceeded or no code generated.')
        );
        console.error(
          chalk.yellow(
            'Check your plan: https://github.com/features/copilot/plans\n'
          )
        );
        process.exit(1);
      }

      // -------- EXTRACT CODE --------
      let extractedCode = '';

      const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
      const matches = [...fullOutput.matchAll(codeBlockRegex)];

      if (matches.length) {
        extractedCode = matches[matches.length - 1][1].trim();
      } else {
        extractedCode = fullOutput;
      }

      // -------- CLEAN AI TEXT --------
      extractedCode = extractedCode
        .split('\n')
        .filter(line => {
          const t = line.trim().toLowerCase();
          return (
            t &&
            !t.includes('quota') &&
            !t.includes('upgrade') &&
            !t.includes('total code') &&
            !t.includes('i will') &&
            !t.includes('here is') &&
            !t.startsWith('$')
          );
        })
        .join('\n')
        .trim();

      // -------- SAFETY CHECK --------
      const allowedPrefixes = [
        'docker',
        'kubectl',
        'terraform',
        'cat',
        'echo',
        'printf'
      ];

      const isSafe = allowedPrefixes.some(p =>
        extractedCode.startsWith(p)
      );

      if (!isSafe || extractedCode.length < 10) {
        spinner.fail('Unsafe or invalid command detected.');
        console.log(chalk.red('\nBlocked unsafe execution.'));
        console.log(chalk.gray(extractedCode));
        process.exit(1);
      }

      spinner.succeed(chalk.green('Blueprint generated!'));

      // -------- DISPLAY --------
      console.log('\n' + chalk.yellow('--- Suggested Operation ---'));
      console.log(extractedCode);
      console.log(chalk.yellow('---------------------------\n'));

      // -------- CONFIRM --------
      const { execute } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'execute',
          message: 'Do you want to run this command and generate the file?',
          default: false
        }
      ]);

      if (!execute) {
        console.log(chalk.gray('Aborted.'));
        return;
      }

      // -------- EXECUTE --------
      try {
        await execa.command(extractedCode, { shell: true });
        console.log(
          chalk.green(`✔ Success! Your ${options.type} file is ready.`)
        );
      } catch {
        console.log(
          chalk.yellow(
            'Command generated but not executed automatically.'
          )
        );
        console.log(chalk.gray(extractedCode));
      }
    } catch (error) {
      spinner.fail('The spirits are silent.');

      if (error.message.toLowerCase().includes('auth')) {
        console.error(chalk.red('GitHub authentication failed.'));
        console.error(chalk.yellow('Run: gh auth login'));
      } else {
        console.error(chalk.red(error.message));
      }
    }
  });

program.parse(process.argv);
