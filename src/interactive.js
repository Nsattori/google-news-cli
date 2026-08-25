import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import open from 'open';
import { fetchTopHeadlines, fetchTopicHeadlines, fetchSearchHeadlines } from './api.js';
import { TOPIC_DISPLAY } from './constants.js';
import { renderHeader, formatRelativeTime } from './formatter.js';

/**
 * Runs the interactive news browser experience.
 */
export async function startInteractiveSession(options = {}) {
  console.clear();
  console.log(renderHeader('Interactive Reader', 'Navigate latest news in your terminal'));

  let running = true;

  while (running) {
    try {
      const action = await select({
        message: 'What would you like to explore?',
        choices: [
          { name: '🔥 Top Headlines', value: 'top' },
          { name: '📂 Browse by Category', value: 'category' },
          { name: '🔍 Search News by Keyword', value: 'search' },
          { name: '🚪 Exit', value: 'exit' }
        ]
      });

      if (action === 'exit') {
        console.log(chalk.cyan('\nThank you for using Google News CLI. Stay informed!\n'));
        break;
      }

      if (action === 'top') {
        await handleArticleBrowsing('Top Headlines', () => fetchTopHeadlines(options));
      } else if (action === 'category') {
        const topic = await select({
          message: 'Select a category:',
          choices: TOPIC_DISPLAY
        });
        const topicLabel = TOPIC_DISPLAY.find(t => t.value === topic)?.name || topic;
        await handleArticleBrowsing(`Category: ${topicLabel}`, () => fetchTopicHeadlines(topic, options));
      } else if (action === 'search') {
        const query = await input({
          message: 'Enter search keyword(s):',
          validate: (val) => val.trim().length > 0 || 'Please enter at least one word'
        });
        await handleArticleBrowsing(`Search: "${query}"`, () => fetchSearchHeadlines(query, options));
      }
    } catch (err) {
      if (err.name === 'ExitPromptError') {
        console.log(chalk.dim('\nExited session.\n'));
        break;
      }
      console.error(chalk.red(`\nError: ${err.message}\n`));
    }
  }
}

/**
 * Fetches and presents a list of articles for user selection / opening.
 */
async function handleArticleBrowsing(title, fetchFn) {
  const spinner = ora(`Fetching ${title}...`).start();
  let articles = [];

  try {
    articles = await fetchFn();
    spinner.succeed(`Loaded ${articles.length} stories for ${title}`);
  } catch (error) {
    spinner.fail(`Failed to fetch articles: ${error.message}`);
    return;
  }

  if (articles.length === 0) {
    console.log(chalk.yellow('No articles found.\n'));
    return;
  }

  let viewing = true;

  while (viewing) {
    const articleChoices = articles.map((article, idx) => ({
      name: `${chalk.bold.cyan(`[${idx + 1}]`)} ${article.title} ${chalk.dim(`(${article.source} • ${formatRelativeTime(article.pubDate)})`)}`,
      value: article
    }));

    articleChoices.push({
      name: chalk.yellow('🔄 Refresh feed'),
      value: 'REFRESH'
    });
    articleChoices.push({
      name: chalk.gray('⬅️  Back to main menu'),
      value: 'BACK'
    });

    const chosen = await select({
      message: `Select an article to open in your browser (or go back):`,
      choices: articleChoices,
      pageSize: 15
    });

    if (chosen === 'BACK') {
      viewing = false;
    } else if (chosen === 'REFRESH') {
      const refreshSpinner = ora(`Refreshing...`).start();
      try {
        articles = await fetchFn();
        refreshSpinner.succeed(`Refreshed ${articles.length} stories.`);
      } catch (err) {
        refreshSpinner.fail(`Refresh failed: ${err.message}`);
      }
    } else {
      console.log(chalk.green(`\nOpening in browser: ${chosen.title}`));
      console.log(chalk.dim(`Link: ${chosen.link}\n`));
      try {
        await open(chosen.link);
      } catch (err) {
        console.error(chalk.red(`Could not open browser automatically: ${err.message}`));
      }
    }
  }
}
