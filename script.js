
const newStoriesColumn = document.getElementById('stories-column');

// API URLS

const newStoriesURL = 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty';
const storyURL = (id) =>`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`;

let storiesIds = [];
let currentStoryIndex = 0;
const storiesPerBatch = 10; // Load 10 stories per scroll

// Fetch the new stories IDs
async function fetchStoriesIds() {
    try {
        const response = await fetch(newStoriesURL);
        storiesIds = await response.json();
        loadNextStories(); // Load initial batch of stories
    } catch (error) {
        console.error('Error fetching stories IDs:', error);
    }
}

// Fetch a story by ID and append it to the DOM
async function fetchStoryById(id) {
    try {
        const res = await fetch(storyURL(id))
        const storyData = await res.json()
        if (storyData && storyData.type === 'story') {
            displayStory(storyData);
        }
    } catch (error) {
        console.error('Error fetching story:', error)
    }
}


// Display a story in the middle column
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


// Load the next batch of stories for infinite scroll
function loadNextStories() {
    const nextBatch = storiesIds.slice(currentStoryIndex, currentStoryIndex + storiesPerBatch);
    nextBatch.forEach(id => fetchStoryById(id));
    currentStoryIndex += storiesPerBatch;
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