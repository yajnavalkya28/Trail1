// Ensure user is logged in as student, otherwise redirect
const loggedInUser = sessionStorage.getItem('loggedInUser');
const userRole = sessionStorage.getItem('userRole');

if (userRole !== 'student' || !loggedInUser) {
    window.location.href = 'login.html';
} else {
    document.getElementById('studentUsername').textContent = loggedInUser;
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    displayAnnouncementsStudent();
    displayBooksStudent(); // Display all books initially
    displayEResourcesStudent();
});

// --- Announcement Functions ---
function displayAnnouncementsStudent() {
    const announcementListDiv = document.getElementById('announcementList');
    const announcements = getAnnouncements();
    announcementListDiv.innerHTML = ''; // Clear current list

    if (announcements.length === 0) {
        announcementListDiv.innerHTML = '<p class="text-gray-500">No announcements available.</p>';
        return;
    }

    announcements.forEach(ann => {
        const annElement = document.createElement('div');
        annElement.className = 'bg-gray-700 p-3 rounded';
        annElement.innerHTML = `
            <p class="text-gray-300">${ann.text}</p>
            <p class="text-xs text-yellow-300 mt-1">Posted on: ${ann.date}</p>
        `;
        announcementListDiv.appendChild(annElement);
    });
}

// --- Book Functions ---
function displayBooksStudent(filteredBooks = null) {
    const bookListDiv = document.getElementById('bookListStudent');
    const allBooks = getBooks();
    const booksToDisplay = filteredBooks !== null ? filteredBooks : allBooks; // Use filtered list if provided

    bookListDiv.innerHTML = ''; // Clear current list

    if (booksToDisplay.length === 0) {
        bookListDiv.innerHTML = filteredBooks !== null
            ? '<p class="text-gray-500">No books match your search.</p>'
            : '<p class="text-gray-500">No books available in the library.</p>';
        return;
    }

    booksToDisplay.forEach((book) => {
        // Find the index in the *original* allBooks array to ensure borrow/return works correctly
        const originalIndex = allBooks.findIndex(b => b.id === book.id);

        const bookElement = document.createElement('div');
        bookElement.className = 'bg-gray-700 p-3 rounded flex justify-between items-center';

        let actionButton;

        if (book.borrowedBy === null) {
            // Available
            actionButton = `<button onclick="borrowBook(${originalIndex})" class="bg-blue-500 text-xs px-2 py-1 rounded hover:bg-blue-600 transition duration-200">Borrow</button>`;
        } else if (book.borrowedBy === loggedInUser) {
            // Borrowed by current user
            actionButton = `<button onclick="returnBook(${originalIndex})" class="bg-green-500 text-xs px-2 py-1 rounded hover:bg-green-600 transition duration-200">Return</button>`;
        } else {
            // Borrowed by someone else
            actionButton = `<span class="text-xs text-orange-400 italic">Borrowed</span>`;
        }

        bookElement.innerHTML = `
            <div>
                <h4 class="font-semibold">${book.title}</h4>
                <p class="text-sm text-gray-400">${book.author}</p>
            </div>
            <div>
                ${actionButton}
            </div>
        `;
        bookListDiv.appendChild(bookElement);
    });
}

function searchBooks() {
    const query = document.getElementById('bookSearchInput').value.toLowerCase().trim();
    const books = getBooks();

    if (!query) {
        displayBooksStudent(books); // Show all if search is empty
        return;
    }

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
    displayBooksStudent(filteredBooks);
}

function borrowBook(index) {
    const books = getBooks();
    if (books[index] && books[index].borrowedBy === null) {
        books[index].borrowedBy = loggedInUser;
        saveBooks(books);
        displayBooksStudent(); // Refresh the current view (respecting search filter if active)
        searchBooks(); // Re-apply search to refresh list correctly

        // Notify admin page (if open)
         localStorage.setItem('books_update_trigger', Date.now());
    } else {
        alert("Book is already borrowed or unavailable.");
    }
}

function returnBook(index) {
    const books = getBooks();
    if (books[index] && books[index].borrowedBy === loggedInUser) {
        books[index].borrowedBy = null;
        saveBooks(books);
        displayBooksStudent(); // Refresh the current view
        searchBooks(); // Re-apply search

        // Notify admin page (if open)
         localStorage.setItem('books_update_trigger', Date.now());
    } else {
        alert("You cannot return this book.");
    }
}

// --- E-Resource Functions ---
function displayEResourcesStudent() {
    const eResourceListDiv = document.getElementById('eResourceList');
    const eResources = getEResources();
    eResourceListDiv.innerHTML = ''; // Clear current list

    if (eResources.length === 0) {
        eResourceListDiv.innerHTML = '<p class="text-gray-500">No e-resources available.</p>';
        return;
    }

    eResources.forEach(res => {
        const resElement = document.createElement('div');
        resElement.className = 'bg-gray-700 p-2 rounded';
        // Ensure link opens in a new tab and is secure
        resElement.innerHTML = `
            <a href="${res.link}" target="_blank" rel="noopener noreferrer" class="text-purple-300 hover:underline">${res.title}</a>
        `;
        eResourceListDiv.appendChild(resElement);
    });
}

// --- Feedback Functions ---
function submitFeedback() {
    const textInput = document.getElementById('feedbackText');
    const statusDiv = document.getElementById('feedbackStatus');
    const text = textInput.value.trim();

    if (!text) {
        statusDiv.textContent = "Feedback cannot be empty.";
        statusDiv.className = 'text-red-400 text-sm mt-2 h-4';
        setTimeout(() => statusDiv.textContent = "", 3000);
        return;
    }

    const feedbackItems = getFeedback();
    const newFeedback = {
        user: loggedInUser,
        text: text,
        date: new Date().toLocaleDateString() // Just date is fine here
    };
    feedbackItems.push(newFeedback);
    saveFeedback(feedbackItems);

    textInput.value = ''; // Clear input
    statusDiv.textContent = "Feedback submitted successfully!";
    statusDiv.className = 'text-green-400 text-sm mt-2 h-4';
    setTimeout(() => statusDiv.textContent = "", 3000);

    // Notify admin page (if open) - trigger storage event
    localStorage.setItem('feedback_update_trigger', Date.now());
}

// --- Logout ---
function logout() {
    sessionStorage.clear(); // Clear login state
    window.location.href = 'login.html';
}

// --- Listen for updates triggered by admin ---
window.addEventListener('storage', (event) => {
    console.log("Storage event detected in student:", event.key);
    if (event.key === 'books_update_trigger') {
        searchBooks(); // Refresh book list respecting search
    } else if (event.key === 'announcements_update_trigger') {
        displayAnnouncementsStudent();
    } else if (event.key === 'eresources_update_trigger') {
         displayEResourcesStudent();
    }
});