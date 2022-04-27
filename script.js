const library = []
let bookContainer = document.querySelector(".book-grid-container")

function appendBook(book) {
    let { title, author, pages, read } = book
    let card = document.createElement("div")
    card.className = "book-card"

    let bookTitle = document.createElement("span")
    bookTitle.classList.add("book-title")
    bookTitle.appendChild(document.createTextNode(`"${title}"`))

    let authorName = document.createElement("span")
    authorName.className = "author-name"
    authorName.appendChild(document.createTextNode(`Author: ${author}`))

    let pageCount = document.createElement("span")
    pageCount.className = "page-number"
    pageCount.appendChild(document.createTextNode(`Pages: ${pages}`))

    let readStatus = document.createElement("button")
    readStatus.classList.add("read-btn", "book-card-btn")
    readStatus.appendChild(document.createTextNode(`Read Status: ${read}`))

    let deleteBtn = document.createElement("button")
    deleteBtn.classList.add("delete-book-btn", "book-card-btn")
    deleteBtn.appendChild(document.createTextNode("Delete"))

    card.append(bookTitle, authorName, pageCount, readStatus, deleteBtn)

    bookContainer.appendChild(card)
}

const bookMethods = {
    toggleRead() { this.read = !this.read }
}

function addToLibrary(title, author, pages, read) {
    let book = Object.assign(Object.create(bookMethods), { title, author, pages, read })
    library.push(book)
}

addToLibrary("The Hobbit", "J.R.R Tolkein", "498", "Not Read")

appendBook(library[0])