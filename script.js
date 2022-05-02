const library = []
let bookContainer = document.querySelector(".book-grid-container")
let modal = document.querySelector(".modal-box")

let librarybtn = document.querySelector("#library-btn")
librarybtn.addEventListener("click", toggleModal)

let closeModalBtn = document.querySelector("#close-modal")
closeModalBtn.addEventListener("click", toggleModal)

function toggleModal() {
    let body = document.querySelector("body")
    modal.classList.toggle("hide")
    body.classList.toggle("disable-scroll")
    bookForm.reset()
}

let bookForm = document.querySelector("form")
bookForm.addEventListener("submit", (e) => {
    submitForm(e)
})

function submitForm(e) {
    e.preventDefault()
    let data = new FormData(e.target)
    let [title, author, pages, read] = Object.values(Object.fromEntries(data))
    read = read === "Read" ? true : false
    addToLibrary(title, author, pages, read)
    toggleModal()
}

function toggleEmptyNotif() {
    let emptyLibraryNotif = document.querySelector(".empty-library-text")
    if (library.length === 0 && emptyLibraryNotif.className.includes("hide")) {
        emptyLibraryNotif.classList.remove("hide")
    } else if (library.length > 0 && !emptyLibraryNotif.className.includes("hide")) {
        emptyLibraryNotif.classList.add("hide")
    }
}

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        toggleModal()
    }
})

function appendBook(book) {
    let { title, author, pages, read, bookIndex } = book
    let card = document.createElement("div")
    card.className = "book-card"
    card.dataset.index = bookIndex

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
    readStatus.appendChild(document.createTextNode(`Read Status: ${read ? "Read" : "Not Read"}`))
    readStatus.addEventListener("click", () => {
        book.toggleRead()
        readStatus.textContent = book.read ? "Read Status: Read" : "Read Status: Not Read"
    })

    let deleteBtn = document.createElement("button")
    deleteBtn.classList.add("delete-book-btn", "book-card-btn")
    deleteBtn.appendChild(document.createTextNode("Delete"))
    deleteBtn.addEventListener("click", () => {
        removeFromLibrary(card.dataset.index)
    })

    card.append(bookTitle, authorName, pageCount, readStatus, deleteBtn)

    bookContainer.appendChild(card)
}

function displayBooks() {
    let totalBooks = document.querySelector("#bookNum")
    let totalReadBooks = document.querySelector("#readNum")
    let bookCount = 0
    let booksRead = 0
    bookContainer.replaceChildren()
    for (let book of library) {
        appendBook(book)
        bookCount += 1
        if (book.read) {
            booksRead += 1
        }
    }
    totalBooks.textContent = bookCount
    totalReadBooks.textContent = booksRead
}

const bookMethods = {
    toggleRead() {
        this.read = !this.read
        displayBooks()
    }
}

function addToLibrary(title, author, pages, read) {
    let bookIndex = library.length
    title = capitalizeFirstLetter(title)
    author = capitalizeFirstLetter(author)
    let book = Object.assign(Object.create(bookMethods), { title, author, pages, read, bookIndex })
    library.push(book)
    displayBooks()
    toggleEmptyNotif()
}

function removeFromLibrary(index) {
    for (let i = Number(index); i < library.length; i += 1) {
        library[i].bookIndex -= 1
    }
    library.splice(index, 1)
    displayBooks()
    toggleEmptyNotif()
}

function capitalizeFirstLetter(string) {
    const stringArr = string.split(" ")
    const capStringArr = stringArr.map(word => word.charAt(0).toUpperCase() + word.slice(1))
    return capStringArr.join(" ")
}

toggleEmptyNotif()