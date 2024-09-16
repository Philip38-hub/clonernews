import { jest } from '@jest/globals';

global.fetch = jest.fn();

document.getElementById = jest.fn();
document.createElement = jest.fn();

describe('Hacker News Clone', () => {
});
test('Should fetch and display polls correctly', async () => {
  const mockPollData = {
    hits: [
      {
        objectID: '123456',
        title: 'Test Poll',
        author: 'testuser',
        created_at_i: 1620000000,
        num_comments: 10
      }
    ]
  };

  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue(mockPollData)
  });

  const mockPollsContainer = document.createElement('div');
  mockPollsContainer.id = 'polls-container';
  document.body.appendChild(mockPollsContainer);

  await fetchPolls();

  expect(global.fetch).toHaveBeenCalledWith('https://hn.algolia.com/api/v1/search_by_date?tags=poll');
  expect(document.getElementById('polls-container').innerHTML).toContain('Test Poll');
  expect(document.getElementById('polls-container').innerHTML).toContain('testuser');
  expect(document.getElementById('polls-container').innerHTML).toContain('Comments: 10');

  const pollLink = document.querySelector('#polls-container a');
  expect(pollLink.href).toBe('https://news.ycombinator.com/item?id=123456');
  expect(pollLink.target).toBe('_blank');
});
test('Should handle live updates for stories and jobs', async () => {
  // Mock fetch and global functions
  global.fetch = jest.fn();
  global.setTimeout = jest.fn();
  document.getElementById = jest.fn(() => ({
    textContent: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    }
  }));

  // Mock initial data
  storiesIds = [100, 99, 98];
  jobsIds = [200, 199, 198];

  // Mock fetch responses
  global.fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve([101, 100, 99, 98]) })
    .mockResolvedValueOnce({ json: () => Promise.resolve([201, 200, 199, 198]) });

  // Call live update functions
  await liveUpdateStories();
  await liveUpdateJobs();

  // Assert that fetch was called with correct URLs
  expect(global.fetch).toHaveBeenCalledWith(getStoriesURL(currentStoriesType));
  expect(global.fetch).toHaveBeenCalledWith(getStoriesURL('jobstories'));

  // Assert that updateLiveUpdateIndicator was called with correct parameters
  expect(document.getElementById).toHaveBeenCalledWith('stories-live-update');
  expect(document.getElementById).toHaveBeenCalledWith('jobs-live-update');
  expect(document.getElementById('stories-live-update').textContent).toBe('1 new stories');
  expect(document.getElementById('jobs-live-update').textContent).toBe('1 new jobs');

  // Assert that classList.add and setTimeout were called
  expect(document.getElementById('stories-live-update').classList.add).toHaveBeenCalledWith('active');
  expect(document.getElementById('jobs-live-update').classList.add).toHaveBeenCalledWith('active');
  expect(setTimeout).toHaveBeenCalledTimes(2);
});
test('debounce and throttle functions work correctly', (done) => {
  jest.useFakeTimers();
  
  const mockFn = jest.fn();
  const debouncedFn = debounce(mockFn, 1000);
  const throttledFn = throttle(mockFn, 1000);

  // Test debounce
  debouncedFn();
  debouncedFn();
  debouncedFn();
  
  expect(mockFn).not.toBeCalled();
  
  jest.advanceTimersByTime(1000);
  
  expect(mockFn).toHaveBeenCalledTimes(1);

  // Test throttle
  throttledFn();
  throttledFn();
  throttledFn();
  
  expect(mockFn).toHaveBeenCalledTimes(2);
  
  jest.advanceTimersByTime(1000);
  
  throttledFn();
  expect(mockFn).toHaveBeenCalledTimes(3);

  done();
});
test('Should handle scroll events and load more stories/jobs', async () => {
  // Mock window.innerHeight and window.scrollY
  Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  Object.defineProperty(window, 'scrollY', { value: 700, writable: true });

  // Mock document.body.offsetHeight
  Object.defineProperty(document.body, 'offsetHeight', { value: 1500, writable: true });

  // Mock loadNextStories and loadNextJobs functions
  const mockLoadNextStories = jest.fn();
  const mockLoadNextJobs = jest.fn();
  global.loadNextStories = mockLoadNextStories;
  global.loadNextJobs = mockLoadNextJobs;

  // Trigger scroll event
  window.dispatchEvent(new Event('scroll'));

  // Wait for debounce
  await new Promise(resolve => setTimeout(resolve, 250));

  // Assert that loadNextStories and loadNextJobs were called
  expect(mockLoadNextStories).toHaveBeenCalled();
  expect(mockLoadNextJobs).toHaveBeenCalled();
});
