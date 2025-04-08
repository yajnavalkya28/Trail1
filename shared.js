// --- LocalStorage Helper Functions ---

const BOOKS_KEY = 'digitalLibrary_books';
const ERESOURCES_KEY = 'digitalLibrary_eResources';
const ANNOUNCEMENTS_KEY = 'digitalLibrary_announcements';
const FEEDBACK_KEY = 'digitalLibrary_feedback';

// -- Books --
function getBooks() {
    return JSON.parse(localStorage.getItem(BOOKS_KEY)) || [];
}

function saveBooks(books) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

// -- E-Resources --
function getEResources() {
    return JSON.parse(localStorage.getItem(ERESOURCES_KEY)) || [];
}

function saveEResources(eResources) {
    localStorage.setItem(ERESOURCES_KEY, JSON.stringify(eResources));
}

// -- Announcements --
function getAnnouncements() {
    // Ensure announcements are sorted newest first if needed upon retrieval
    const announcements = JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)) || [];
    return announcements.sort((a, b) => b.id - a.id); // Sort by ID (timestamp) descending
}

function saveAnnouncements(announcements) {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
}

// -- Feedback --
function getFeedback() {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
}

function saveFeedback(feedbackItems) {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackItems));
}