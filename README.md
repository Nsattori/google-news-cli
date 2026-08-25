# Google News CLI 📰

A Node.js command-line application to fetch, search, and read the latest news headlines from **Google News** directly inside your terminal.

## ✨ Features

- 🔥 **Top Headlines**: Instant access to trending world & regional news.
- 📂 **Topic Categorization**: Browse categories such as Tech, Business, World, Science, Health, Sports, and Entertainment.
- 🔍 **Real-time Search**: Search across millions of articles by keyword or phrase.
- 🖥️ **Interactive Terminal Reader**: Browse headlines with arrow keys, view relative timestamps & publishers, and press Enter to open any article in your default browser.
- 📦 **Zero Config & Free**: Built directly on top of Google News RSS feeds with no API keys or setup required.
- 🛠️ **Developer Friendly**: Supports `--json` output for shell scripts and pipelines (`jq`, `fzf`, etc.).

---

## 🚀 Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Nsattori/google-news-cli.git
cd google-news-cli
npm install
```

To use `google-news` globally from any directory:

```bash
npm link
```

---

## 💻 Usage Guide

### 1. Interactive Mode (Default)

Simply run `google-news` (or `npm start`) with no arguments to launch the interactive prompt menu:

```bash
google-news
```

*From the menu, you can pick a category, search for a topic, browse article titles, and select one to open immediately in your web browser.*

---

### 2. Command Line Commands

#### 🔹 Fetch Top Headlines
```bash
google-news top
google-news top --limit 5
```

#### 🔹 Fetch News by Topic
Supported topics: `tech`, `business`, `world`, `science`, `health`, `sports`, `entertainment`, `nation`.

```bash
google-news topic tech
google-news topic business --limit 8
google-news topic science
```

#### 🔹 Search News by Keyword
```bash
google-news search "artificial intelligence"
google-news search "space exploration" --limit 5
```

---

### 3. Global Options & Flags

| Flag | Description | Default | Example |
| :--- | :--- | :--- | :--- |
| `-l, --limit <n>` | Max number of articles to return | `10` | `google-news top -l 5` |
| `-o, --open` | Automatically opens top article in default browser | `false` | `google-news top -o` |
| `--json` | Output response as raw JSON | `false` | `google-news top --json` |
| `--lang <lang>` | Language code | `en-US` | `google-news top --lang es-ES` |
| `--country <c>` | Country code | `US` | `google-news top --country GB` |
| `-v, --version` | Output the version number | - | `google-news -v` |
| `-h, --help` | Display CLI help menu | - | `google-news --help` |

---

### 4. Unix Piping & Scripting Examples

Extract headline titles with `jq`:
```bash
node bin/cli.js top --limit 5 --json | jq '.[].title'
```

Find news and filter with grep:
```bash
node bin/cli.js search "crypto" --json | jq '.[] | {title, source, link}'
```

---

## 🧪 Running Tests

```bash
npm test
```

---

## 📄 License
MIT
