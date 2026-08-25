import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { fetchTopHeadlines, fetchTopicHeadlines, fetchSearchHeadlines } from './api.js';
import { renderHeader, renderArticleList, renderJson } from './formatter.js';
import { startInteractiveSession } from './interactive.js';
import { TOPICS } from './constants.js';

export function createCli() {
  const program = new Command();

  program
    .name('google-news')
    .description('CLI tool to fetch, browse, and search the latest news from Google News')
    .version('1.0.0')
    .option('-l, --limit <number>', 'Number of news items to fetch', (val) => parseInt(val, 10), 10)
    .option('--lang <string>', 'Language code (e.g., en-US, es-ES, fr-FR)', 'en-US')
    .option('--country <string>', 'Country code (e.g., US, GB, CA, IN)', 'US')
    .option('--json', 'Output results as raw JSON format', false)
    .option('-o, --open', 'Open the first / top article in your default browser', false);

  // Default action when run without subcommands
  program.action(async (options) => {
    // If user passed specific flags like --json, run top headlines in direct mode, else launch interactive
    if (process.argv.length <= 2) {
      await startInteractiveSession(options);
    } else {
      await executeFetch(
        'Top Headlines',
        () => fetchTopHeadlines(options),
        options
      );
    }
  });

  // Top command
  program
    .command('top')
    .description('Fetch the latest top news headlines')
    .action(async (cmdOptions, cmd) => {
      const options = { ...cmd.optsWithGlobals(), ...cmdOptions };
      await executeFetch(
        'Top Headlines',
        () => fetchTopHeadlines(options),
        options
      );
    });

  // Topic command
  program
    .command('topic <category>')
    .description(`Fetch news for a specific topic (${Object.keys(TOPICS).join(', ')})`)
    .action(async (category, cmdOptions, cmd) => {
      const options = { ...cmd.optsWithGlobals(), ...cmdOptions };
      await executeFetch(
        `Category: ${category.toUpperCase()}`,
        () => fetchTopicHeadlines(category, options),
        options
      );
    });

  // Search command
  program
    .command('search <query...>')
    .description('Search Google News for headlines matching a keyword or phrase')
    .action(async (queryParts, cmdOptions, cmd) => {
      const query = queryParts.join(' ');
      const options = { ...cmd.optsWithGlobals(), ...cmdOptions };
      await executeFetch(
        `Search: "${query}"`,
        () => fetchSearchHeadlines(query, options),
        options
      );
    });

  // Interactive command
  program
    .command('interactive')
    .alias('i')
    .description('Launch the interactive terminal news reader')
    .action(async (cmdOptions, cmd) => {
      const options = { ...cmd.optsWithGlobals(), ...cmdOptions };
      await startInteractiveSession(options);
    });

  return program;
}

async function executeFetch(title, fetchFn, options) {
  let spinner;
  if (!options.json) {
    spinner = ora(`Fetching ${title}...`).start();
  }

  try {
    const articles = await fetchFn();

    if (spinner) {
      spinner.stop();
    }

    if (options.json) {
      console.log(renderJson(articles));
      return;
    }

    console.log(renderHeader(title, `Showing ${articles.length} latest articles`));
    console.log(renderArticleList(articles));

    if (options.open && articles.length > 0) {
      console.log(chalk.green(`Opening top story in browser: ${articles[0].title}`));
      await open(articles[0].link);
    }
  } catch (error) {
    if (spinner) {
      spinner.fail(`Failed to load news: ${error.message}`);
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    process.exit(1);
  }
}
