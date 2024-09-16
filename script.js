// API URLs
const apiBaseURL = 'https://hacker-news.firebaseio.com/v0/';
const getStoriesURL = (type) => `${apiBaseURL}${type}.json`;
const itemURL = (id) => `${apiBaseURL}item/${id}.json`;
const pollsURL = 'https://hn.algolia.com/api/v1/search_by_date?tags=poll';

let currentStoriesType = 'newstories';
let storiesIds = [];
let jobsIds = [];
let storiesIndex = 0;
let jobsIndex = 0;
const storiesPerBatch = 10;
const jobsPerBatch = 5;

// Cache for stories and comments
const cache = new Map();

// Fetch polls data
async function fetchPolls() {
    try {
        const response = await fetch(pollsURL);
        const pollData = await response.json();
        document.getElementById('polls-container').innerHTML = '';
        pollData.hits.forEach(poll => {
            displayPoll(poll);
        });
    } catch (error) {
        console.error('Error fetching polls:', error);
    }
}

// Display a poll in the polls container
function displayPoll(poll) {
    const pollDiv = document.createElement('div');
    pollDiv.classList.add('poll');
    pollDiv.innerHTML = `
        <h3>${poll.title}</h3>
        <p>by ${poll.author} | ${new Date(poll.created_at_i * 1000).toLocaleString()}</p>
        <p>Comments: ${poll.num_comments || 0}</p>
    `;
    document.getElementById('polls-container').appendChild(pollDiv);
}

// Initialize polls fetching
fetchPolls();

// Live update function for polls
function liveUpdatePolls() {
    fetchPolls();
}

// Set interval for live polling update every 5 seconds
setInterval(liveUpdatePolls, 5000);

// Fetch the stories IDs based on type
async function fetchStoriesIds(type) {
    try {
        const response = await fetch(getStoriesURL(type));
        storiesIds = await response.json();
        storiesIndex = 0;
        document.getElementById('stories-container').innerHTML = '';
        loadNextStories();
    } catch (error) {
        console.error('Error fetching stories IDs:', error);
    }
}

// Fetch job stories
async function fetchJobsIds() {
    try {
        const response = await fetch(getStoriesURL('jobstories'));
        jobsIds = await response.json();
        jobsIndex = 0;
        document.getElementById('jobs-container').innerHTML = '';
        loadNextJobs();
    } catch (error) {
        console.error('Error fetching job IDs:', error);
    }
}

// Fetch an item by ID and cache it
async function fetchItemById(id) {
    if (cache.has(id)) {
        return cache.get(id);
    }
    try {
        const response = await fetch(itemURL(id));
        const itemData = await response.json();
        cache.set(id, itemData);
        return itemData;
    } catch (error) {
        console.error(`Error fetching item ${id}:`, error);
    }
}

// Display a story in the stories container
function displayStory(story) {
    const storyDiv = document.createElement('div');
    storyDiv.classList.add('story');
    storyDiv.innerHTML = `
        <h3><a href="${story.url || '#'}" target="_blank">${story.title}</a></h3>
        <p>by ${story.by} | Score: ${story.score} | ${new Date(story.time * 1000).toLocaleString()} | Comments: ${story.descendants || 0}</p>
    `;
    storyDiv.addEventListener('click', () => showStoryDetails(story));
    document.getElementById('stories-container').appendChild(storyDiv);
}

// Display a job in the jobs container
function displayJob(job) {
    const jobDiv = document.createElement('div');
    jobDiv.classList.add('job');
    jobDiv.innerHTML = `
        <h3><a href="${job.url || '#'}" target="_blank">${job.title}</a></h3>
        <p>${new Date(job.time * 1000).toLocaleString()}</p>
    `;
    document.getElementById('jobs-container').appendChild(jobDiv);
}

// Show story details and comments in a popup
async function showStoryDetails(story) {
    const popup = document.getElementById('story-popup');
    const details = document.getElementById('story-details');
    const commentsContainer = document.getElementById('comments-container');
    
    details.innerHTML = `
        <h2>${story.title}</h2>
        <p>by ${story.by} | Score: ${story.score} | ${new Date(story.time * 1000).toLocaleString()}</p>
        ${story.text ? `<p>${story.text}</p>` : ''}
        ${story.url ? `<p><a href="${story.url}" target="_blank">Read more</a></p>` : ''}
    `;
    
    commentsContainer.innerHTML = '<h3>Comments</h3>';
    if (story.kids) {
        await fetchComments(story.kids, commentsContainer);
    }
    
    popup.style.display = 'block';
}

// Fetch and display comments
async function fetchComments(commentIds, container, depth = 0) {
    for (const commentId of commentIds) {
        const comment = await fetchItemById(commentId);
        if (comment && !comment.deleted && !comment.dead) {
            displayComment(comment, container, depth);
            if (comment.kids) {
                await fetchComments(comment.kids, container, depth + 1);
            }
        }
    }
}

// Display a single comment
function displayComment(comment, container, depth) {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment');
    commentDiv.style.marginLeft = `${depth * 20}px`;
    commentDiv.innerHTML = `
        <p><strong>${comment.by}</strong> | ${new Date(comment.time * 1000).toLocaleString()}</p>
        <p>${comment.text}</p>
    `;
    container.appendChild(commentDiv);
}

// Load next batch of stories
function loadNextStories() {
    const nextBatch = storiesIds.slice(storiesIndex, storiesIndex + storiesPerBatch);
    storiesIndex += storiesPerBatch;
    nextBatch.forEach(id => fetchItemById(id).then(displayStory));
}

// Load next batch of jobs
function loadNextJobs() {
    const nextBatch = jobsIds.slice(jobsIndex, jobsIndex + jobsPerBatch);
    jobsIndex += jobsPerBatch;
    nextBatch.forEach(id => fetchItemById(id).then(displayJob));
}

// Live update function for stories
function liveUpdateStories() {
    const lastStoryId = storiesIds[0];
    fetchStoriesIds(currentStoriesType).then(() => {
        const newStories = storiesIds.filter(id => id > lastStoryId);
        if (newStories.length > 0) {
            updateLiveUpdateIndicator('stories', newStories.length);
        }
    });
}

// Live update function for jobs
function liveUpdateJobs() {
    const lastJobId = jobsIds[0];
    fetchJobsIds().then(() => {
        const newJobs = jobsIds.filter(id => id > lastJobId);
        if (newJobs.length > 0) {
            updateLiveUpdateIndicator('jobs', newJobs.length);
        }
    });
}

// Update live update indicator
function updateLiveUpdateIndicator(type, count) {
    const indicator = document.getElementById(`${type}-live-update`);
    indicator.textContent = `${count} new ${type}`;
    indicator.classList.add('active');
    setTimeout(() => {
        indicator.classList.remove('active');
    }, 3000);
}

// Debounce function
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

// Event listeners
document.getElementById('story-filter').addEventListener('change', (event) => {
    currentStoriesType = event.target.value;
    fetchStoriesIds(currentStoriesType);
});

document.getElementById('show-more').addEventListener('click', loadNextStories);

document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('story-popup').style.display = 'none';
});

window.addEventListener('scroll', debounce(() => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadNextStories();
        loadNextJobs();
    }
}, 250));

// Initialize
fetchStoriesIds(currentStoriesType);
fetchJobsIds();
setInterval(liveUpdateStories, 5000);
setInterval(liveUpdateJobs, 5000);

// Event delegation for menu items
document.querySelector('.menu-items').addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        event.preventDefault();
        currentStoriesType = event.target.getAttribute('data-type');
        fetchStoriesIds(currentStoriesType);
    }
});