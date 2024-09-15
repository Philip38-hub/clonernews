// Constants
const NEW_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/newstories.json';
const JOB_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/jobstories.json';
const POLL_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/pollstories.json';
const ITEM_URL = 'https://hacker-news.firebaseio.com/v0/item/';

const newStoriesColumn = document.getElementById('stories-column');
const jobsColumn = document.getElementById('jobs-column');
const pollsColumn = document.getElementById('polls-column');

const STORIES_PER_BATCH = 10;
const UPDATE_INTERVAL = 5000; // 5 seconds

let storiesIds = [];
let currentStoryIndex = 0;
let latestStoryId = null;

// Debounce function to limit the rate of API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fetch data from API
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Load stories
async function loadStories() {
    try {
        storiesIds = await fetchData(NEW_STORIES_URL);
        latestStoryId = storiesIds[0];
        loadNextStories();
    } catch (error) {
        console.error('Error fetching stories:', error);
    }
}

// Load next batch of stories
async function loadNextStories() {
    const nextBatch = storiesIds.slice(currentStoryIndex, currentStoryIndex + STORIES_PER_BATCH);
    for (const id of nextBatch) {
        await fetchAndDisplayStory(id);
    }
    currentStoryIndex += STORIES_PER_BATCH;
}

// Fetch and display a story
async function fetchAndDisplayStory(id) {
    try {
        const storyData = await fetchData(`${ITEM_URL}${id}.json`);
        if (storyData && storyData.type === 'story') {
            displayStory(storyData);
        }
    } catch (error) {
        console.error('Error fetching story:', error);
    }
}

// Display a story
function displayStory(story) {
    const storyDiv = document.createElement('div');
    storyDiv.classList.add('story');
    storyDiv.innerHTML = `
        <h3><a href="${story.url}" target="_blank">${story.title}</a></h3>
        <p>by ${story.by} | Score: ${story.score} | Comments: ${story.descendants || 0}</p>
    `;
    newStoriesColumn.appendChild(storyDiv);
}

// Load jobs
async function loadJobs() {
    try {
        const jobIds = await fetchData(JOB_STORIES_URL);
        for (const id of jobIds.slice(0, 10)) {
            await fetchAndDisplayJob(id);
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

// Fetch and display a job
async function fetchAndDisplayJob(id) {
    try {
        const jobData = await fetchData(`${ITEM_URL}${id}.json`);
        if (jobData && jobData.type === 'job') {
            displayJob(jobData);
        }
    } catch (error) {
        console.error('Error fetching job:', error);
    }
}

// Display a job
function displayJob(job) {
    const jobDiv = document.createElement('div');
    jobDiv.classList.add('job');
    jobDiv.innerHTML = `
        <h3><a href="${job.url}" target="_blank">${job.title}</a></h3>
        <p>by ${job.by}</p>
    `;
    jobsColumn.appendChild(jobDiv);
}

// Load polls
async function loadPolls() {
    try {
        const pollIds = await fetchData(POLL_STORIES_URL);
        for (const id of pollIds.slice(0, 10)) {
            await fetchAndDisplayPoll(id);
        }
    } catch (error) {
        console.error('Error fetching polls:', error);
    }
}

// Fetch and display a poll
async function fetchAndDisplayPoll(id) {
    try {
        const pollData = await fetchData(`${ITEM_URL}${id}.json`);
        if (pollData && pollData.type === 'poll') {
            displayPoll(pollData);
        }
    } catch (error) {
        console.error('Error fetching poll:', error);
    }
}

// Display a poll
function displayPoll(poll) {
    const pollDiv = document.createElement('div');
    pollDiv.classList.add('poll');
    pollDiv.innerHTML = `
        <h3>${poll.title}</h3>
        <p>by ${poll.by} | Score: ${poll.score}</p>
    `;
    pollsColumn.appendChild(pollDiv);
}

// Check for new stories
async function checkForNewStories() {
    try {
        const newStoryIds = await fetchData(NEW_STORIES_URL);
        if (newStoryIds[0] !== latestStoryId) {
            latestStoryId = newStoryIds[0];
            alertUserOfNewStories();
        }
    } catch (error) {
        console.error('Error checking for new stories:', error);
    }
}

// Alert user of new stories
function alertUserOfNewStories() {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('new-stories-alert');
    alertDiv.textContent = 'New stories are available! Click to refresh.';
    document.body.prepend(alertDiv);

    alertDiv.addEventListener('click', () => {
        location.reload();
    });
}

// Infinite scroll
const debouncedLoadNextStories = debounce(() => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadNextStories();
    }
}, 200);

window.addEventListener('scroll', debouncedLoadNextStories);

// Initialize
loadStories();
loadJobs();
loadPolls();

// Set interval for live updates
setInterval(checkForNewStories, UPDATE_INTERVAL);