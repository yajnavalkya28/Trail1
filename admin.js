// Ensure user is logged in as admin, otherwise redirect
if (sessionStorage.getItem('userRole') !== 'admin') {
    window.location.href = 'login.html';
} else {
    document.getElementById('adminUsername').textContent = sessionStorage.getItem('loggedInUser');
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    displayBooksAdmin();
    displayFeedback();
    // Optional: Display E-resources or Announcements for admin management if needed
});

// --- Announcement Functions ---
function postAnnouncement() {
    const textInput = document.getElementById('announcementText');
    const statusDiv = document.getElementById('announcementStatus');
    const text = textInput.value.trim();

    if (!text) {
        statusDiv.textContent = "Announcement text cannot be empty.";
        statusDiv.className = 'text-red-400 text-sm mt-2 h-4';
        setTimeout(() => statusDiv.textContent = "", 3000);
        return;
    }

    const announcements = getAnnouncements();
    const newAnnouncement = {
        id: Date.now(), // Simple unique ID
        text: text,
        date: new Date().toLocaleString()
    };
    announcements.unshift(newAnnouncement); // Add to the beginning
    saveAnnouncements(announcements);

    textInput.value = ''; // Clear input
    statusDiv.textContent = "Announcement posted successfully!";
    statusDiv.className = 'text-green-400 text-sm mt-2 h-4';
    // Optionally update an admin view of announcements if you add one
    setTimeout(() => statusDiv.textContent = "", 3000);

    // Notify student page (if open in another tab) via storage event
    localStorage.setItem('announcements_update_trigger', Date.now());
}

// --- Book Functions ---
function addBook() {
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    const statusDiv = document.getElementById('addBookStatus');
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) {
        statusDiv.textContent = "Title and Author are required.";
         statusDiv.className = 'text-red-400 text-sm mt-2 h-4';
        setTimeout(() => statusDiv.textContent = "", 3000);
        return;
    }

    const books = getBooks();
    const newBook = {
        id: Date.now(), // Simple unique ID
        title: title,
        author: author,
        borrowedBy: null // Initially available
    };
    books.push(newBook);
    saveBooks(books);

    titleInput.value = '';
    authorInput.value = '';
    statusDiv.textContent = "Book added successfully!";
    statusDiv.className = 'text-green-400 text-sm mt-2 h-4';
    displayBooksAdmin(); // Refresh the list
    setTimeout(() => statusDiv.textContent = "", 3000);

    // Notify student page
    localStorage.setItem('books_update_trigger', Date.now());
}

function displayBooksAdmin() {
    const bookListDiv = document.getElementById('bookListAdmin');
    const books = getBooks();
    bookListDiv.innerHTML = ''; // Clear current list

    if (books.length === 0) {
        bookListDiv.innerHTML = '<p class="text-gray-500">No books in the library yet.</p>';
        return;
    }

    books.forEach((book, index) => {
        const bookElement = document.createElement('div');
        bookElement.className = 'bg-gray-700 p-3 rounded flex justify-between items-center';

        let statusText;
        let actionButton;

        if (book.borrowedBy) {
            statusText = `<span class="text-sm text-orange-400">Borrowed by: ${book.borrowedBy}</span>`;
            actionButton = `<button onclick="forceReturnBook(${index})" class="bg-yellow-600 text-xs px-2 py-1 rounded hover:bg-yellow-700 transition duration-200">Force Return</button>`;
        } else {
            statusText = `<span class="text-sm text-green-400">Available</span>`;
            actionButton = `<button onclick="deleteBook(${index})" class="bg-red-600 text-xs px-2 py-1 rounded hover:bg-red-700 transition duration-200">Delete</button>`;
        }

        bookElement.innerHTML = `
            <div>
                <h4 class="font-semibold">${book.title}</h4>
                <p class="text-sm text-gray-400">${book.author}</p>
                ${statusText}
            </div>
            <div>
                ${actionButton}
            </div>
        `;
        bookListDiv.appendChild(bookElement);
    });
}

function deleteBook(index) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    const books = getBooks();
    books.splice(index, 1); // Remove book at index
    saveBooks(books);
    displayBooksAdmin(); // Refresh list

    // Notify student page
    localStorage.setItem('books_update_trigger', Date.now());
}

function forceReturnBook(index) {
     if (!confirm("Are you sure you want to force return this book?")) return;

    const books = getBooks();
    if (books[index]) {
        books[index].borrowedBy = null; // Make it available
        saveBooks(books);
        displayBooksAdmin(); // Refresh list

        // Notify student page
        localStorage.setItem('books_update_trigger', Date.now());
    }
}

// --- E-Resource Functions ---
function addEResource() {
    const titleInput = document.getElementById('eResourceTitle');
    const linkInput = document.getElementById('eResourceLink');
    const statusDiv = document.getElementById('addEResourceStatus');
    const title = titleInput.value.trim();
    const link = linkInput.value.trim();

    if (!title || !link) {
        statusDiv.textContent = "Title and Link are required.";
        statusDiv.className = 'text-red-400 text-sm mt-2 h-4';
        setTimeout(() => statusDiv.textContent = "", 3000);
        return;
    }

    // Basic URL validation (optional but recommended)
    try {
        new URL(link); // Check if it's a valid URL structure
    } catch (_) {
        statusDiv.textContent = "Please enter a valid URL (e.g., https://example.com).";
        statusDiv.className = 'text-red-400 text-sm mt-2 h-4';
        setTimeout(() => statusDiv.textContent = "", 3000);
        return;
    }


    const eResources = getEResources();
    const newEResource = {
        id: Date.now(),
        title: title,
        link: link
    };
    eResources.push(newEResource);
    saveEResources(eResources);

    titleInput.value = '';
    linkInput.value = '';
    statusDiv.textContent = "E-Resource added successfully!";
    statusDiv.className = 'text-green-400 text-sm mt-2 h-4';
    // Optional: Refresh an admin view of e-resources if needed
    setTimeout(() => statusDiv.textContent = "", 3000);

     // Notify student page
    localStorage.setItem('eresources_update_trigger', Date.now());
}

// --- Feedback Functions ---
function displayFeedback() {
    const feedbackListDiv = document.getElementById('feedbackList');
    const feedbackItems = getFeedback();
    feedbackListDiv.innerHTML = ''; // Clear current list

    if (feedbackItems.length === 0) {
        feedbackListDiv.innerHTML = '<p class="text-gray-500">No feedback received yet.</p>';
        return;
    }

    feedbackItems.forEach((item, index) => {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'bg-gray-700 p-3 rounded';
        feedbackElement.innerHTML = `
            <p class="text-gray-300">${item.text}</p>
            <p class="text-xs text-teal-300 mt-1">From: ${item.user} on ${item.date}</p>
            <button onclick="deleteFeedback(${index})" class="text-xs text-red-400 hover:text-red-600 mt-1">Delete</button>
        `;
        feedbackListDiv.appendChild(feedbackElement);
    });
}

function deleteFeedback(index) {
    if (!confirm("Delete this feedback?")) return;
    const feedbackItems = getFeedback();
    feedbackItems.splice(index, 1);
    saveFeedback(feedbackItems);
    displayFeedback(); // Refresh the list
}


// --- Logout ---
function logout() {
    sessionStorage.clear(); // Clear login state
    window.location.href = 'login.html';
}

// --- Listen for updates from other tabs (e.g., student submits feedback) ---
window.addEventListener('storage', (event) => {
    if (event.key === 'feedback') {
        displayFeedback();
    }
    // Add listeners for other keys if needed for cross-tab updates
});