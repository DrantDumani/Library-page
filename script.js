const library = [];
const localStorage = window.localStorage;
let currentBook = null;
let bookContainer = document.querySelector(".book-grid-container");
let formModal = document.querySelector("#form-modal");
let userId = "";
let database = firebase.firestore();
let unsubscribe = () => {};

let loginBtn = document.querySelector("#login-btn");
loginBtn.addEventListener("click", login);

const hiddenWhenLoggedOut = document.querySelector(".show-logged-in");

function showUsername(string) {
  const nameSpan = document.querySelector("#user-name");
  nameSpan.innerText = string;
}

let logoutBtn = document.querySelector("#logout-btn");
logoutBtn.addEventListener("click", logout);

function initFirebaseAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      loginBtn.classList.add("hide");
      showUsername(user.displayName);
      hiddenWhenLoggedOut.classList.remove("hide");
      userId = user.uid;
      // setUnsubscribe(user.uid);
      getBooksFromDatabase(userId);
    } else {
      loginBtn.classList.remove("hide");
      hiddenWhenLoggedOut.classList.add("hide");
      const nameSpan = document.querySelector("#user-name");
      nameSpan.innerText = "";
      userId = "";
      booksFromStorage();
      unsubscribe();
    }
  });
}

function setUnsubscribe(uid) {
  unsubscribe = database
    .collection("books")
    .doc(uid)
    .onSnapshot((doc) => {
      const { tempStorage } = doc.data();
      renderBooks(tempStorage);
    });
}

async function getBooksFromDatabase(userUID) {
  const docRef = database.collection("books").doc(userUID);
  const doc = await docRef.get();
  if (doc.exists) {
    const { tempStorage } = doc.data();
    if (tempStorage) {
      renderBooks(tempStorage);
    }
  } else {
    console.log(doc, "Tires don exits");
  }
}

async function logout() {
  await firebase.auth().signOut();
}

async function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  await firebase.auth().signInWithPopup(provider);
}

function updateStorage(keyStr, value) {
  const strVal = JSON.stringify(value);
  localStorage.setItem(keyStr, strVal);
}

function getStorage(keyStr) {
  const value = localStorage.getItem(keyStr);
  return JSON.parse(value);
}

function populateLibrary(arr) {
  library.length = 0;
  arr.forEach((book) => {
    let bookWithMethod = Object.assign(Object.create(bookMethods), book);
    library.push(bookWithMethod);
  });
}

function booksFromStorage() {
  const storedBooks = getStorage("library");
  if (storedBooks) {
    renderBooks(storedBooks);
  }
}

function renderBooks(arr) {
  populateLibrary(arr);
  displayBooks();
  toggleEmptyNotif();
}

let librarybtn = document.querySelector("#library-btn");
librarybtn.addEventListener("click", () => {
  toggleModal(formModal);
});

let closeModalBtns = document.querySelectorAll(".close-modal");
for (let btn of closeModalBtns) {
  btn.addEventListener("click", (e) => {
    let currModal = e.target.parentElement.parentElement;
    toggleModal(currModal);
  });
}

let confirmDelBtns = document.querySelectorAll(".confirm-btn");
for (let btn of confirmDelBtns) {
  btn.addEventListener("click", (e) => {
    confirmDelete(e);
  });
}

function confirmDelete(event) {
  let parentModal = document.querySelector("#confirm-del-modal");
  if (event.target.value === "true") {
    removeFromLibrary();
  }
  toggleModal(parentModal);
}

function toggleModal(modal) {
  let body = document.querySelector("body");
  modal.classList.toggle("hide");
  body.classList.toggle("disable-scroll");
  bookForm.reset();
  bookForm.dataset.index = "";
  hideValidationOnFormClose();
}

let bookForm = document.querySelector("form");
bookForm.addEventListener("submit", (e) => {
  submitForm(e);
});

function submitForm(e) {
  e.preventDefault();
  let data = new FormData(e.target);
  let [title, author, pages, read] = Object.values(Object.fromEntries(data));
  read = read === "Read" ? true : false;
  editOrAddToLibrary(title, author, pages, read);
  toggleModal(formModal);
}

function toggleEmptyNotif() {
  let emptyLibraryNotif = document.querySelector(".empty-library-text");
  if (library.length === 0 && emptyLibraryNotif.className.includes("hide")) {
    emptyLibraryNotif.classList.remove("hide");
  } else if (
    library.length > 0 &&
    !emptyLibraryNotif.className.includes("hide")
  ) {
    emptyLibraryNotif.classList.add("hide");
  }
}

window.addEventListener("click", (e) => {
  if (e.target.className.includes("modal-box")) {
    toggleModal(e.target);
  }
});

function appendBook(book) {
  let { title, author, pages, read, bookIndex } = book;
  let card = document.createElement("div");
  card.className = "book-card";
  card.dataset.index = bookIndex;

  let bookTitle = document.createElement("span");
  bookTitle.classList.add("book-title");
  bookTitle.appendChild(document.createTextNode(`"${title}"`));

  let authorName = document.createElement("span");
  authorName.className = "author-name";
  authorName.appendChild(document.createTextNode(`Author: ${author}`));

  let pageCount = document.createElement("span");
  pageCount.className = "page-number";
  pageCount.appendChild(document.createTextNode(`Pages: ${pages}`));

  let readStatus = document.createElement("button");
  readStatus.classList.add("read-btn", "book-card-btn");
  readStatus.appendChild(
    document.createTextNode(`Read Status: ${read ? "Read" : "Not Read"}`)
  );
  readStatus.addEventListener("click", () => {
    book.toggleRead();
    const tempBook = {
      title: book.title,
      author: book.author,
      pages: book.pages,
      read: book.read,
      bookIndex: book.bookIndex,
    };
    readStatus.textContent = book.read
      ? "Read Status: Read"
      : "Read Status: Not Read";
    if (userId) {
      handleFirestore(tempBook, editOrAddBook);
    } else {
      handleLocalStorage(tempBook, editOrAddBook);
    }
  });

  let editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn", "book-card-btn");
  editBtn.appendChild(document.createTextNode("Edit"));
  editBtn.addEventListener("click", () => {
    editBook(book);
  });

  let deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-book-btn", "book-card-btn");
  deleteBtn.appendChild(document.createTextNode("Delete"));
  deleteBtn.addEventListener("click", () => {
    let delModal = document.querySelector("#confirm-del-modal");
    currentBook = book;
    toggleModal(delModal);
  });

  card.append(bookTitle, authorName, pageCount, readStatus, editBtn, deleteBtn);

  bookContainer.appendChild(card);
}

function displayBooks() {
  let totalBooks = document.querySelector("#bookNum");
  let totalReadBooks = document.querySelector("#readNum");
  let bookCount = 0;
  let booksRead = 0;
  bookContainer.replaceChildren();
  for (let book of library) {
    appendBook(book);
    bookCount += 1;
    if (book.read) {
      booksRead += 1;
    }
  }
  totalBooks.textContent = bookCount;
  totalReadBooks.textContent = booksRead;
}

const bookMethods = {
  toggleRead() {
    this.read = !this.read;
  },
};

function editBook(book) {
  toggleModal(formModal);
  let { title, author, pages, read, bookIndex } = book;
  let titleInput = document.querySelector("#title-input");
  titleInput.value = title;

  let authorInput = document.querySelector("#author-input");
  authorInput.value = author;

  let pageNum = document.querySelector("#page-number");
  pageNum.value = pages;

  if (read) {
    document.querySelector("#yes-state").checked = true;
    document.querySelector("#no-state").checked = false;
  } else {
    document.querySelector("#yes-state").checked = false;
    document.querySelector("#no-state").checked = true;
  }
  bookForm.dataset.index = bookIndex;
}

function handleLocalStorage(bookObj, operationFn) {
  const tempStorage = getStorage("library") || [];
  operationFn(tempStorage, bookObj);
  updateStorage("library", tempStorage);
  booksFromStorage();
}

async function handleFirestore(bookObj, operationFn) {
  let tempStorage = null;
  const docRef = database.collection("books").doc(userId);
  const doc = await docRef.get();
  if (doc.exists) {
    tempStorage = doc.data().tempStorage;
  }
  if (!tempStorage) {
    tempStorage = [];
  }
  operationFn(tempStorage, bookObj);
  updateFireStore({ tempStorage });
  getBooksFromDatabase(userId);
}

function updateFireStore(arr) {
  database.collection("books").doc(userId).set(arr);
}

function editOrAddBook(arr, book) {
  const { bookIndex } = book;
  arr[bookIndex] = book;
}

function editOrAddToLibrary(title, author, pages, read) {
  let bookIndex = bookForm.dataset.index || library.length;
  let book = { title, author, pages, read, bookIndex };
  if (!userId) {
    handleLocalStorage(book, editOrAddBook);
  } else {
    handleFirestore(book, editOrAddBook);
  }

  bookForm.dataset.index = "";

  displayBooks();
  toggleEmptyNotif();
}

function deleteBook(arr, bookObj) {
  const index = bookObj.bookIndex;
  for (let i = Number(index); i < arr.length; i += 1) {
    arr[i].bookIndex -= 1;
  }
  arr.splice(index, 1);
}

function removeFromLibrary() {
  if (!userId) {
    handleLocalStorage(currentBook, deleteBook);
  }
  currentBook = null;
}

function capitalizeFirstLetter(string) {
  const stringArr = string.split(" ");
  const capStringArr = stringArr.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capStringArr.join(" ");
}

function displayValidationText(e) {
  let validState = e.target.validity;
  if (!validState.valid) {
    const parent = e.target.parentElement;
    const validationText = parent.querySelector(".validation-text");
    validationText.classList.remove("hide");
  }
}

function hideValidationText(e) {
  let validState = e.target.validity;
  if (validState.valid) {
    const parent = e.target.parentElement;
    const validationText = parent.querySelector(".validation-text");
    validationText.classList.add("hide");
  }
}

function hideValidationOnFormClose() {
  const validationSpans = document.querySelectorAll(".validation-text");
  validationSpans.forEach((text) => {
    text.classList.add("hide");
  });
}

const inputs = document.querySelectorAll(".form-grid-item > input");
for (let el of inputs) {
  el.addEventListener("focusout", (e) => {
    displayValidationText(e);
  });

  el.addEventListener("input", (e) => {
    hideValidationText(e);
  });
}

toggleEmptyNotif();
initFirebaseAuth();
