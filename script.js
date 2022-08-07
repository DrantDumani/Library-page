const library = []
let currentBookIndex = null
let bookContainer = document.querySelector(".book-grid-container")
let formModal = document.querySelector("#form-modal")

let librarybtn = document.querySelector("#library-btn")
librarybtn.addEventListener("click", () => {
    toggleModal(formModal)
})

let closeModalBtns = document.querySelectorAll(".close-modal")
for (let btn of closeModalBtns) {
    btn.addEventListener("click", (e) => {
        let currModal = e.target.parentElement.parentElement
        toggleModal(currModal)
    })
}

let confirmDelBtns = document.querySelectorAll(".confirm-btn")
for (let btn of confirmDelBtns) {
    btn.addEventListener("click", (e) => {
        confirmDelete(e)
    })
}

function confirmDelete(event) {
    let parentModal = document.querySelector("#confirm-del-modal")
    if (event.target.value === "true") {
        removeFromLibrary(currentBookIndex)
    }
    toggleModal(parentModal)
}

function toggleModal(modal) {
    let body = document.querySelector("body")
    modal.classList.toggle("hide")
    body.classList.toggle("disable-scroll")
    bookForm.reset()
    hideValidationOnFormClose()
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
    editOrAddToLibrary(title, author, pages, read)
    toggleModal(formModal)
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
    if (e.target.className.includes("modal-box")) {
        toggleModal(e.target)
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

    let editBtn = document.createElement("button")
    editBtn.classList.add("edit-btn", "book-card-btn")
    editBtn.appendChild(document.createTextNode("Edit"))
    editBtn.addEventListener("click", () => {
        editBook(book)
    })

    let deleteBtn = document.createElement("button")
    deleteBtn.classList.add("delete-book-btn", "book-card-btn")
    deleteBtn.appendChild(document.createTextNode("Delete"))
    deleteBtn.addEventListener("click", () => {
        let delModal = document.querySelector("#confirm-del-modal")
        currentBookIndex = bookIndex
        toggleModal(delModal)
    })

    card.append(bookTitle, authorName, pageCount, readStatus, editBtn, deleteBtn)

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

function editBook(book) {
    toggleModal(formModal)
    let { title, author, pages, read, bookIndex } = book
    let titleInput = document.querySelector("#title-input")
    titleInput.value = title

    let authorInput = document.querySelector("#author-input")
    authorInput.value = author

    let pageNum = document.querySelector("#page-number")
    pageNum.value = pages

    if (read) {
        document.querySelector("#yes-state").checked = true
        document.querySelector("#no-state").checked = false
    } else {
        document.querySelector("#yes-state").checked = false
        document.querySelector("#no-state").checked = true
    }
    bookForm.dataset.index = bookIndex
}

function editOrAddToLibrary(title, author, pages, read) {
    let bookIndex = bookForm.dataset.index || library.length
    let book = Object.assign(Object.create(bookMethods), { title, author, pages, read, bookIndex })
    library[bookIndex] = book
    bookForm.dataset.index = ""

    displayBooks()
    toggleEmptyNotif()
}

function removeFromLibrary(index) {
    for (let i = Number(index); i < library.length; i += 1) {
        library[i].bookIndex -= 1
    }
    library.splice(index, 1)
    currentBookIndex = null
    displayBooks()
    toggleEmptyNotif()
}

function capitalizeFirstLetter(string) {
    const stringArr = string.split(" ")
    const capStringArr = stringArr.map(word => word.charAt(0).toUpperCase() + word.slice(1))
    return capStringArr.join(" ")
}

function displayValidationText(e){
    let validState = e.target.validity
    if (!validState.valid){
        const parent = e.target.parentElement
        const validationText = parent.querySelector(".validation-text")
        validationText.classList.remove("hide")
    }
}

function hideValidationText(e){
    let validState = e.target.validity
    if (validState.valid){
        const parent = e.target.parentElement
        const validationText = parent.querySelector(".validation-text")
        validationText.classList.add("hide")
    }
}

function hideValidationOnFormClose(){
    const validationSpans = document.querySelectorAll('.validation-text');
    validationSpans.forEach((text) => {
        text.classList.add('hide');
    })
}

const inputs = document.querySelectorAll(".form-grid-item > input")
for (let el of inputs){
    el.addEventListener("focusout", (e) => {
        displayValidationText(e)
    })

    el.addEventListener("input", (e) => {
        hideValidationText(e)
    })
}

toggleEmptyNotif()