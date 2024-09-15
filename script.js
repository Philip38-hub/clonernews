// API URLS

const newStoriesURL = 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty';
const itemURL = (id) =>`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`;
const jobStoriesURL = `https://hacker-news.firebaseio.com/v0/jobstories.json?print=pretty`;
const maxItemURL = 'https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty';

let maxItemId = null;

const storiesPerBatch = 10; // Load 10 stories per scroll

// Fetch the new stories IDs
async function fetchStoriesIds() {
    try {
        const response = await fetch(newStoriesURL);
        const storiesIds = await response.json();
        loadNextStories(storiesIds); // Load initial batch of stories
    } catch (error) {
        console.error('Error fetching stories IDs:', error);
    }
}

async function fetchJobs() {
    try {
        const response = await fetch(jobStoriesURL);
        const jobIds = await response.json();
        loadNextJobs(jobIds);
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}


// Fetch a story by ID and append it to the DOM
// Reusable function to fetch any item by ID (story or job)
async function fetchItemById(id, type) {
    try {
        const response = await fetch(itemURL(id));
        const itemData = await response.json();
        if (itemData && itemData.type === type) {
            if (type === 'story') {
                displayStory(itemData);
            } else if (type === 'job') {
                displayJob(itemData);
            }
        }
    } catch (error) {
        console.error(`Error fetching ${type}:`, error);
    }
}

async function fetchMaxItemId() {
    try {
        const response = await fetch(maxItemURL);
        maxItemId = await response.json();
        fetchAllPolls(maxItemId); // Start fetching polls from the max item ID
    } catch (error) {
        console.error('Error fetching max item ID:', error);
    }
}

// Fetch all polls and display them
async function fetchAllPolls(startId) {
    let currentId = startId;
    let count = 0;

    while (currentId > 0 && count < 10) { // Adjust the limit based on how many items you want to fetch
        try {
            const response = await fetch(itemURL(currentId));
            const itemData = await response.json();

            if (itemData && itemData.type === 'poll') {
                displayPoll(itemData);
                count++;
            }
            currentId--;
        } catch (error) {
            console.error('Error fetching item:', error);
            currentId--;
        }
    }
}

// Function to display a story in the middle column with a text preview
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
    
    // Add text preview if available
    const storyPreview = document.createElement('p');
    storyPreview.classList.add('preview');
    storyPreview.textContent = story.text ? truncateText(story.text, 200) : 'No preview available';

    storyDiv.appendChild(storyTitle);
    storyDiv.appendChild(storyDetails);
    storyDiv.appendChild(storyPreview);

    const newStoriesColumn = document.getElementById('stories-column');
    newStoriesColumn.appendChild(storyDiv);
}

// Function to display a poll in the polls column with a text preview
function displayPoll(poll) {
    const pollDiv = document.createElement('div');
    pollDiv.classList.add('poll');

    const pollTitle = document.createElement('h3');
    pollTitle.textContent = poll.title;

    const pollDetails = document.createElement('p');
    pollDetails.innerHTML = `by ${poll.by} | Score: ${poll.score || 0} | ${new Date(poll.time * 1000).toLocaleString()}`;
    
    // Add text preview if available
    const pollPreview = document.createElement('p');
    pollPreview.classList.add('preview');
    pollPreview.textContent = poll.text ? truncateText(poll.text, 200) : 'No preview available';

    pollDiv.appendChild(pollTitle);
    pollDiv.appendChild(pollDetails);
    pollDiv.appendChild(pollPreview);

    const pollsColumn = document.getElementById('polls-column');
    pollsColumn.appendChild(pollDiv);
}

function displayJob(job) {
    const jobDiv = document.createElement('div');
    jobDiv.classList.add('job');

    const jobTitle = document.createElement('h3');
    const jobLink = document.createElement('a');
    jobLink.href = job.url || '#'; // Jobs might not always have a URL
    jobLink.textContent = job.title; // Job title
    jobTitle.appendChild(jobLink);

    const jobDetails = document.createElement('p');
    jobDetails.innerHTML = `by ${job.by} | Score: ${job.score || 0} | ${new Date(job.time * 1000).toLocaleString()}`;
    
    // Add text preview if available
    const jobPreview = document.createElement('p');
    jobPreview.classList.add('preview');
    jobPreview.textContent = job.text ? truncateText(job.text, 200) : 'No preview available';

    jobDiv.appendChild(jobTitle);
    jobDiv.appendChild(jobDetails);
    jobDiv.appendChild(jobPreview);

    document.getElementById('jobs-column').appendChild(jobDiv); // Append to jobs column
}

// Helper function to truncate text to a specified length
function truncateText(text, length) {
    if (text.length > length) {
        return text.substring(0, length) + '...';
    }
    return text;
}


function loadNextStories(storiesIds) {
    const nextBatch = storiesIds.slice(0, storiesPerBatch);
    nextBatch.forEach((id) => fetchItemById(id, 'story')); // Fetch stories
}

function loadNextJobs(jobIds) {
    const nextBatch = jobIds.slice(0, storiesPerBatch);
    nextBatch.forEach((id) => fetchItemById(id, 'job')); // Fetch jobs
}

// Handle infinite scroll event
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadNextStories();
    }
});

// Live update - refresh every 5 seconds
setInterval(() => {
    fetchStoriesIds(); // Fetch new stories every 5 seconds
}, 5000);

// Initialize by fetching the first batch of stories
fetchStoriesIds();
fetchJobs();
fetchMaxItemId();