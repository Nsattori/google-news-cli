import chalk from 'chalk';
import boxen from 'boxen';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

/**
 * Returns a styled header banner.
 */
export function renderHeader(title, subtitle = '') {
  const content = subtitle
    ? `${chalk.bold.hex('#4285F4')('Google')} ${chalk.bold.hex('#EA4335')('News')} ${chalk.bold.hex('#FBBC05')('CLI')} - ${chalk.cyan(title)}\n${chalk.dim(subtitle)}`
    : `${chalk.bold.hex('#4285F4')('Google')} ${chalk.bold.hex('#EA4335')('News')} ${chalk.bold.hex('#FBBC05')('CLI')} - ${chalk.cyan(title)}`;

  return boxen(content, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: 'cyan'
  });
}

/**
 * Formats a relative timestamp (e.g., '10 minutes ago').
 */
export function formatRelativeTime(date) {
  return dayjs(date).fromNow();
}

/**
 * Renders a list of articles to the terminal.
 */
export function renderArticleList(articles) {
  if (!articles || articles.length === 0) {
    return chalk.yellow('No news stories found.');
  }

  const output = [];

  articles.forEach((item, index) => {
    const num = chalk.bold.cyan(`[${index + 1}]`);
    const title = chalk.bold.white(item.title);
    const source = chalk.green(item.source);
    const time = chalk.dim(`(${formatRelativeTime(item.pubDate)})`);
    const link = chalk.underline.dim(item.link);

    output.push(`${num} ${title}`);
    output.push(`    ${chalk.dim('Source:')} ${source}  ${time}`);
    output.push(`    ${chalk.dim('Link:')}   ${link}`);
    output.push('');
  });

  return output.join('\n');
}

/**
 * Renders articles as formatted JSON.
 */
export function renderJson(articles) {
  return JSON.stringify(articles, null, 2);
}
