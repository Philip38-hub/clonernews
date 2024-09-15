const newStoriesColumn = document.getElementById('stories-column');
const jobsColumn = document.getElementById('jobs-column');
const pollsColumn = document.getElementById('polls-column');

// API URLs
const newStoriesURL = 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty';
const jobsURL = 'https://hacker-news.firebaseio.com/v0/jobstories.json?print=pretty';
const pollsURL = 'https://hacker-news.firebaseio.com/v0/pollstories.json?print=pretty';
const storyURL = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`;

let storiesIds = [];
let currentStoryIndex = 0;
const storiesPerBatch = 10; // Load 10 stories per scroll
let latestStoryId = null; // Track the latest story ID for live update

// Throttling scroll event to avoid excessive requests
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                loadNextStories();
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Fetch the new stories, jobs, and polls
async function fetchStoriesIds() {
    try {
        const response = await fetch(newStoriesURL);
        storiesIds = await response.json();
        latestStoryId = storiesIds[0];
        loadNextStories(); // Load initial batch of stories
    } catch (error) {
        console.error('Error fetching stories IDs:', error);
    }
}

async function fetchJobStoriesIds() {
    try {
        const response = await fetch(jobsURL);
        const jobIds = await response.json();
        loadNextJobs(jobIds);
    } catch (error) {
        console.error('Error fetching job stories:', error);
    }
}

async function fetchPollStoriesIds() {
    try {
        const response = await fetch(pollsURL);
        const pollIds = await response.json();
        loadNextPolls(pollIds);
    } catch (error) {
        console.error('Error fetching poll stories:', error);
    }
}

// Fetch and display stories, jobs, and polls
function loadNextStories() {
    const nextBatch = storiesIds.slice(currentStoryIndex, currentStoryIndex + storiesPerBatch);
    nextBatch.forEach(id => fetchStoryById(id));
    currentStoryIndex += storiesPerBatch;
}

function loadNextJobs(jobIds) {
    jobIds.slice(0, 10).forEach(id => fetchJobById(id));
}

function loadNextPolls(pollIds) {
    pollIds.slice(0, 10).forEach(id => fetchPollById(id));
}

// Fetch a story by ID and append it to the DOM
async function fetchStoryById(id) {
    try {
        const res = await fetch(storyURL(id));
        const storyData = await res.json();
        if (storyData && storyData.type === 'story') {
            displayStory(storyData);
            if (storyData.kids) {
                fetchCommentsByIds(storyData.kids, storyData.id);
            }
        }
    } catch (error) {
        console.error('Error fetching story:', error);
    }
}

async function fetchJobById(id) {
    try {
        const res = await fetch(storyURL(id));
        const jobData = await res.json();
        if (jobData && jobData.type === 'job') {
            displayJob(jobData);
        }
    } catch (error) {
        console.error('Error fetching job:', error);
    }
}

async function fetchPollById(id) {
    try {
        const res = await fetch(storyURL(id));
        const pollData = await res.json();
        if (pollData && pollData.type === 'poll') {
            displayPoll(pollData);
        }
    } catch (error) {
        console.error('Error fetching poll:', error);
    }
}

// Display elements
function displayStory(story) {
    const storyDiv = document.createElement('div');
    storyDiv.classList.add('story');

    const storyTitle = document.createElement('h3');
    const storyLink = document.createElement('a');
    storyLink.href = story.url;
    storyLink.textContent = story.title;
    storyTitle.appendChild(storyLink);

    const storyDetails = document.createElement('p');
    storyDetails.innerHTML = `by ${story.by} | Score: ${story.score} | Comments: ${story.descendants}`;

    storyDiv.appendChild(storyTitle);
    storyDiv.appendChild(storyDetails);

    newStoriesColumn.appendChild(storyDiv);
}

function displayJob(job) {
    const jobDiv = document.createElement('div');
    jobDiv.classList.add('job');

    const jobTitle = document.createElement('h3');
    jobTitle.textContent = job.title;

    const jobDetails = document.createElement('p');
    jobDetails.textContent = `by ${job.by} | Score: ${job.score}`;

    jobDiv.appendChild(jobTitle);
    jobDiv.appendChild(jobDetails);

    jobsColumn.appendChild(jobDiv);
}

function displayPoll(poll) {
    const pollDiv = document.createElement('div');
    pollDiv.classList.add('poll');

    const pollTitle = document.createElement('h3');
    pollTitle.textContent = poll.title;

    const pollDetails = document.createElement('p');
    pollDetails.textContent = `by ${poll.by} | Score: ${poll.score}`;

    pollDiv.appendChild(pollTitle);
    pollDiv.appendChild(pollDetails);

    pollsColumn.appendChild(pollDiv);
}

// Fetch comments by ID
async function fetchCommentsByIds(commentIds, parentId) {
    const parentDiv = document.getElementById(parentId);
    for (let id of commentIds) {
        try {
            const res = await fetch(storyURL(id));
            const commentData = await res.json();
            if (commentData && commentData.type === 'comment') {
                displayComment(commentData, parentDiv);
                if (commentData.kids) {
                    fetchCommentsByIds(commentData.kids, parentDiv);
                }
            }
        } catch (error) {
            console.error('Error fetching comment:', error);
        }
    }
}

function displayComment(comment, parentElement) {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment');

    const commentText = document.createElement('p');
    commentText.innerHTML = `<strong>${comment.by}:</strong> ${comment.text}`;

    commentDiv.appendChild(commentText);
    parentElement.appendChild(commentDiv);
}

// Live update for new stories
async function checkForNewStories() {
    try {
        const response = await fetch(newStoriesURL);
        const newStoryIds = await response.json();
        if (newStoryIds[0] !== latestStoryId) {
            latestStoryId = newStoryIds[0];
            alertUserOfNewStories();
        }
    } catch (error) {
        console.error('Error checking for new stories:', error);
    }
}

function alertUserOfNewStories() {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('new-stories-alert');
    alertDiv.textContent = 'New stories are available! Click to refresh.';
    document.body.appendChild(alertDiv);

    alertDiv.addEventListener('click', () => {
        location.reload();
    });
}

// Set interval for live updates
setInterval(checkForNewStories, 5000);

// Initialize
fetchStoriesIds();
fetchJobStoriesIds();
fetchPollStoriesIds();
