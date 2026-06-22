// ========================================
// My Library - Main Application
// ========================================

class Library {
    constructor() {
        this.books = this.loadBooks();
        this.editingId = null;
        this.initializeEventListeners();
        this.render();
    }

    // ========================================
    // Local Storage Management
    // ========================================
    loadBooks() {
        const stored = localStorage.getItem('myLibraryBooks');
        return stored ? JSON.parse(stored) : [];
    }

    saveBooks() {
        localStorage.setItem('myLibraryBooks', JSON.stringify(this.books));
    }

    // ========================================
    // Event Listeners
    // ========================================
    initializeEventListeners() {
        // Modal controls
        document.getElementById('addBookBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('closeBtn').addEventListener('click', () => this.closeBookModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeBookModal());
        document.getElementById('detailsCloseBtn').addEventListener('click', () => this.closeDetailsModal());

        // Form submission
        document.getElementById('bookForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('filterSelect').addEventListener('change', (e) => this.handleFilter(e));

        // Close modals when clicking outside
        document.getElementById('bookModal').addEventListener('click', (e) => {
            if (e.target.id === 'bookModal') this.closeBookModal();
        });

        document.getElementById('detailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailsModal') this.closeDetailsModal();
        });
    }

    // ========================================
    // Modal Management
    // ========================================
    openAddModal() {
        this.editingId = null;
        document.getElementById('modalTitle').textContent = 'Add New Book';
        this.resetForm();
        document.getElementById('bookModal').classList.add('active');
    }

    openEditModal(bookId) {
        this.editingId = bookId;
        const book = this.books.find(b => b.id === bookId);
        
        if (book) {
            document.getElementById('modalTitle').textContent = 'Edit Book';
            document.getElementById('bookTitle').value = book.title;
            document.getElementById('bookAuthor').value = book.author;
            document.getElementById('bookYear').value = book.year || '';
            document.getElementById('bookPages').value = book.pages || '';
            document.getElementById('bookGenre').value = book.genre || '';
            document.getElementById('bookRating').value = book.rating || '';
            document.getElementById('bookRead').checked = book.read;
            document.getElementById('bookNotes').value = book.notes || '';
            document.getElementById('bookModal').classList.add('active');
        }
    }

    closeBookModal() {
        document.getElementById('bookModal').classList.remove('active');
        this.resetForm();
        this.editingId = null;
    }

    closeDetailsModal() {
        document.getElementById('detailsModal').classList.remove('active');
    }

    resetForm() {
        document.getElementById('bookForm').reset();
        document.getElementById('bookRead').checked = false;
    }

    // ========================================
    // Form Handling
    // ========================================
    handleFormSubmit(e) {
        e.preventDefault();

        const bookData = {
            id: this.editingId || Date.now(),
            title: document.getElementById('bookTitle').value.trim(),
            author: document.getElementById('bookAuthor').value.trim(),
            year: document.getElementById('bookYear').value || null,
            pages: document.getElementById('bookPages').value || null,
            genre: document.getElementById('bookGenre').value.trim() || null,
            rating: document.getElementById('bookRating').value || null,
            read: document.getElementById('bookRead').checked,
            notes: document.getElementById('bookNotes').value.trim() || null,
            dateAdded: this.editingId ? 
                this.books.find(b => b.id === this.editingId).dateAdded :
                new Date().toISOString()
        };

        if (this.editingId) {
            // Update existing book
            const index = this.books.findIndex(b => b.id === this.editingId);
            this.books[index] = bookData;
        } else {
            // Add new book
            this.books.push(bookData);
        }

        this.saveBooks();
        this.closeBookModal();
        this.render();
        this.showNotification('Book saved successfully!');
    }

    // ========================================
    // Search and Filter
    // ========================================
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const filtered = this.books.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
        this.renderBooks(filtered);
    }

    handleFilter(e) {
        const filter = e.target.value;
        let filtered = this.books;

        if (filter === 'read') {
            filtered = this.books.filter(book => book.read);
        } else if (filter === 'unread') {
            filtered = this.books.filter(book => !book.read);
        }

        this.renderBooks(filtered);
    }

    // ========================================
    // Book Operations
    // ========================================
    deleteBook(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(b => b.id !== bookId);
            this.saveBooks();
            this.render();
            this.showNotification('Book deleted successfully!');
        }
    }

    toggleReadStatus(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (book) {
            book.read = !book.read;
            this.saveBooks();
            this.render();
            this.showNotification(`Marked as ${book.read ? 'read' : 'unread'}!`);
        }
    }

    showBookDetails(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        const detailsHTML = `
            <div class="details-section">
                <h3>Author</h3>
                <p class="details-text">${this.escapeHtml(book.author)}</p>
            </div>

            ${book.genre ? `
            <div class="details-section">
                <h3>Genre</h3>
                <p class="details-text">${this.escapeHtml(book.genre)}</p>
            </div>
            ` : ''}

            ${book.year ? `
            <div class="details-section">
                <h3>Year Published</h3>
                <p class="details-text">${book.year}</p>
            </div>
            ` : ''}

            ${book.pages ? `
            <div class="details-section">
                <h3>Pages</h3>
                <p class="details-text">${book.pages}</p>
            </div>
            ` : ''}

            <div class="details-section">
                <h3>Status</h3>
                <p class="details-text">
                    <span class="book-status ${book.read ? 'status-read' : 'status-unread'}">
                        ${book.read ? '✓ Read' : '○ To Read'}
                    </span>
                </p>
            </div>

            ${book.rating ? `
            <div class="details-section">
                <h3>Rating</h3>
                <p class="details-rating">${'⭐'.repeat(book.rating)}</p>
            </div>
            ` : ''}

            ${book.notes ? `
            <div class="details-section">
                <h3>Notes</h3>
                <p class="details-text">${this.escapeHtml(book.notes)}</p>
            </div>
            ` : ''}

            <div class="details-actions">
                <button class="btn btn-primary" onclick="library.openEditModal(${book.id})">
                    ✎ Edit
                </button>
                <button class="btn btn-secondary" onclick="library.toggleReadStatus(${book.id})">
                    ${book.read ? '← Mark Unread' : '✓ Mark Read'}
                </button>
                <button class="btn btn-secondary btn-delete" onclick="library.deleteBook(${book.id})">
                    🗑 Delete
                </button>
            </div>
        `;

        document.getElementById('detailsTitle').textContent = book.title;
        document.getElementById('detailsContent').innerHTML = detailsHTML;
        document.getElementById('detailsModal').classList.add('active');
    }

    // ========================================
    // Rendering
    // ========================================
    render() {
        this.renderBooks(this.books);
        this.updateStats();
    }

    renderBooks(books) {
        const container = document.getElementById('booksContainer');

        if (books.length === 0) {
            container.innerHTML = '<p class="empty-state">No books yet. Add your first book! 📖</p>';
            return;
        }

        container.innerHTML = books
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .map(book => this.createBookCard(book))
            .join('');

        // Add event listeners to cards
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.book-actions')) {
                    this.showBookDetails(parseInt(card.dataset.bookId));
                }
            });
        });
    }

    createBookCard(book) {
        return `
            <div class="book-card" data-book-id="${book.id}">
                <div class="book-header">
                    <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                    <p class="book-author">by ${this.escapeHtml(book.author)}</p>
                </div>
                <div class="book-body">
                    ${book.genre ? `<span class="book-genre">${this.escapeHtml(book.genre)}</span>` : ''}
                    
                    <div class="book-info">
                        ${book.year ? `<span>📅 ${book.year}</span>` : ''}
                        ${book.pages ? `<span>📄 ${book.pages} pages</span>` : ''}
                    </div>

                    ${book.rating ? `<div class="book-rating">⭐ ${book.rating}/5</div>` : ''}
                    
                    <span class="book-status ${book.read ? 'status-read' : 'status-unread'}">
                        ${book.read ? '✓ Read' : '○ To Read'}
                    </span>

                    <div class="book-actions">
                        <button class="btn-icon" onclick="library.openEditModal(${book.id})">✎ Edit</button>
                        <button class="btn-icon" onclick="library.toggleReadStatus(${book.id})">
                            ${book.read ? '◯' : '✓'}
                        </button>
                        <button class="btn-icon btn-delete" onclick="library.deleteBook(${book.id})">🗑</button>
                    </div>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.books.length;
        const read = this.books.filter(b => b.read).length;
        const unread = total - read;

        document.getElementById('totalBooks').textContent = total;
        document.getElementById('booksRead').textContent = read;
        document.getElementById('booksUnread').textContent = unread;
    }

    // ========================================
    // Utilities
    // ========================================
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        // Simple notification (you can enhance this)
        console.log(message);
    }
}

// ========================================
// Initialize Application
// ========================================
let library;

document.addEventListener('DOMContentLoaded', () => {
    library = new Library();
});