# CLONERNEWS


## Overview
This project is a user interface built for the [HackerNews API](https://github.com/HackerNews/API), aimed at displaying tech news, stories, jobs, and polls, as well as handling user comments. The goal is to provide users with an intuitive and appealing way to consume HackerNews content, while keeping them updated on the latest posts and comments in real time.

## Features
- **Posts (Stories, Jobs, Polls)**: Displays the latest stories, jobs, and polls from HackerNews.
- **Comments**: Each post's comments are displayed with proper nesting, allowing users to see sub-comments.
- **Real-time Updates**: The UI notifies users every 5 seconds with the newest posts or updates.
- **Infinite Scroll**: Posts are loaded dynamically as the user scrolls, preventing unnecessary loading.
- **Throttling/Debouncing**: Reduces unnecessary API requests, optimizing performance and preventing potential rate limits.

## Technology Stack
- **Frontend**: JavaScript, HTML, CSS
- **Backend (Optional)**: Node.js (for proxying requests if needed)
- **API**: [HackerNews API](https://github.com/HackerNews/API)
- **Live Updates**: JavaScript event handling with set intervals for live data fetching

## Installation
1. Clone the repository:
   ```bash
   git clone https://learn.zone01kisumu.ke/git/pochieng/clonernews.git
   cd clonernews
   ```
2. Install dependencies(if applicable)
    ```bash
    npm install
    ```
3. Open the index.html file in your browser, or run a local server if you have backend code:
    ```bash
    npm start
    ```

## Usage
- **Loading Posts**: Posts are ordered from newest to oldest and include categories like stories, jobs, and polls. The UI will load more posts as you scroll.
- **Viewing Comments**: Each post's comments are displayed underneath the post, including nested sub-comments for stories, jobs, and polls.
- **Live Data**: Every 5 seconds, the app checks for new posts or comments and notifies users if updates are available.
- **Optimizing API Requests**: The app uses throttling/debouncing techniques to prevent unnecessary API requests and improve performance.

## API Endpoints Used
The following HackerNews API endpoints are utilized:

- `/v0/topstories.json`: Fetch top stories
- `/v0/item/{id}.json`: Fetch details for a post or comment
- `/v0/jobstories.json`: Fetch job posts
- `/v0/pollstories.json`: Fetch polls

For full documentation, visit the [HackerNews API documentation](https://github.com/HackerNews/API).

## Future Enhancements
- **Nested Comments**: Currently, sub-comments are supported, but additional UI improvements can be made for better viewing.
- **Dark Mode**: A toggleable dark mode for improved user experience.
- **Search Feature**: Add the ability to search for specific posts or keywords within the posts.

## Contributing

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes and commit:
    ```bash
    git commit -m "Description of your changes"
    ```
4. Push to your fork:
    ```bash
    git push origin feature-branch
    ```
5. Open a pull request!

## Authors

- **[X - @vinomondi_1](https://x.com/vinomondi_1)**
- **[X - @oumaphilip01](https://x.com/oumaphilip01)**
- **[Github - Vincent](https://github.com/Vincent-Omondi/)**
- **[Github - Philip38](https://github.com/Philip38-hub)**
- **[Gitea - Pochieng](https://learn.zone01kisumu.ke/git/pochieng)**
- **[Gitea - vinomondi](https://learn.zone01kisumu.ke/git/vinomondi)**
- **[Gitea - hilaokello](https://learn.zone01kisumu.ke/git/hilaokello)**


<p align="right">(<a href="#clonernews">back to top</a>)</p>