let editor; // object. Representing Froala editor example get the text from here.
let selectedNoteId = null; // string. Null if no selected note otherwise notes id. 
let selectedNavbarItemIndex = 0; // integer. 0 = homepage, 1 = search, 2 = favorite.

document.addEventListener("DOMContentLoaded", function () {
    // Use this to access html elements when loaded

    editor = new FroalaEditor('#textEditor', {
        toolbarInline: true,
        charCounterCount: false,
        toolbarVisibleWithoutSelection: true

    })


    let btnSave = document.querySelector('#btnSave');

    btnSave.onclick = function () {
        let text = editor.html.get();
        let date = new Date();
        let id = Math.floor((Math.random() * 999) + 99).toString();
        let isFavorite = selectedNavbarItemIndex === 2

        let noteObject = {
            id: id,
            text: text,
            date: date,
            isFavorite: isFavorite
        }

        let noteList = getNotes();

        // When creating new note
        if (selectedNoteId === null || noteList.length === 0) {
            noteList.unshift(noteObject);
            selectedNoteId = id;
        
        } else { // When editing existing note
            for (i = 0; i < noteList.length; i++) {
                if (noteList[i].id === selectedNoteId) {
                    noteList[i].text = text;

                    break;
                }
            }
        }



        setNotes(noteList);

        if (selectedNavbarItemIndex === 0) { 
            showNotes();
        } else if (selectedNavbarItemIndex === 2) {
            showNotes(getFavoriteNotes());
        }
        
    };


    showNotes();

    let addBtn = document.querySelector('#addNoteBtn');

    let noteModal = document.querySelector('#addNoteContainer');
    let yesBtn = document.querySelector('#yesBtn');
    let noBtn = document.querySelector('#noBtn');


    addBtn.onclick = function () {
        noteModal.style.display = 'block';
        window.onclick = function (e) {
            if (e.target == noteModal) {
                noteModal.style.display = 'none';
            }
        }
    }

    yesBtn.onclick = function () {
        noteModal.style.display = 'none';
        clearEditor();
        selectedNoteId = null;
        removeSelectionInNoteList();
    }

    noBtn.onclick = function () {
        noteModal.style.display = 'none';
    }

        // TODO refactor onclick. Move to seperate function. El
     
    let searchTitle = document.querySelector('.noteBordTitle');
    let searchBtn = document.querySelector('#searchBtn');
    
    searchBtn.onclick = function () {
        searchTitle.innerHTML = 'Your search results';
        selectedNoteId = null; 
        
        clearEditor();
        showNotes();

        removeActiveClassNavbar();
        searchBtn.classList.add('active');
        selectedNavbarItemIndex = 1;
        toggleSearchInputField();
    }

    let favBtnNavbar = document.querySelector('#favoriteBtnNavbar');
    let FavoriteTitle = document.querySelector('.noteBordTitle');

    favBtnNavbar.onclick = function () {
        selectedNoteId = null; 
        clearEditor();
        getFavoriteNotes();
        FavoriteTitle.innerHTML = 'Favorite notes';
        showNotes(getFavoriteNotes());
        selectedNavbarItemIndex = 2;
        toggleSearchInputField();

        removeActiveClassNavbar();
        favBtnNavbar.classList.add('active');
    }

    let homeTitle = document.querySelector('.noteBordTitle');
    let homeBtn = document.querySelector('#homeBtn');

    homeBtn.onclick = function () {
        homeTitle.innerHTML = 'All notes';
        selectedNoteId = null; 
        clearEditor();
        showNotes();

        removeActiveClassNavbar();
        homeBtn.classList.add('active');
        selectedNavbarItemIndex = 0;
        toggleSearchInputField();
    }


});



function removeActiveClassNavbar() {
    let allMenuItems = document.querySelectorAll('.navMenu li');

    allMenuItems.forEach(menuItem => {
        menuItem.classList.remove('active');

    });

}


function clearEditor() {
    editor.html.set('<h1></h1>');
}

function addZero(i) {
    if (i < 10) {
        i = '0' + i;
    }
    return i;
}


function formatDate(date) {
    let monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];

    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    let hour = addZero(date.getHours());
    let minutes = addZero(date.getMinutes());

    return day + ' ' + monthNames[monthIndex] + ' ' + year + ' ' + hour + ':' + minutes;
}


function showNotes(notes = getNotes()) {
    let noteRows = document.querySelector('#noteContainer');
    noteRows.innerHTML = '';

    for (i = 0; i < notes.length; i++) {
        let object = notes[i];

        let htmlItem;

        if (object.id === selectedNoteId) {
            htmlItem = createNoteSelected(object);
        } else {
            htmlItem = createNote(object);
        }

        noteRows.innerHTML += htmlItem
    }
    
    function createNote(object) { // Create html string based on noteObject data. 
        return `
        
        <div id="${object.id}" onclick="noteClicked(this)" class="noteContent">
        <div class="favoriteBtnContainer"><i class="fas fa-star favoriteBtn ${favoriteSelectedNoteCheck(object)}" onclick ="favoriteSelectedNote(this, ${object.id})"></i></div>
        <h1 class="text">${removeHtmlTagsFromText(object.text).substring(0, 15)}</h1>
        <p class="date">${formatDate(new Date(object.date))}</p>
        <div class="deleteBtnContainer"><i class="fas fa-trash-alt deleteBtn" onclick="deleteSelectedNote(this)"></i>
       </div>
        </div>
        `
    }

            // Create html string, that adding active class on the string for marking item as active. 

    function createNoteSelected(object) {
        return `
        <div id="${object.id}" onclick="noteClicked(this)" class="noteContent noteContentActive">
        <div class="favoriteBtnContainer"><i class="fas fa-star favoriteBtn ${favoriteSelectedNoteCheck(object)}" onclick ="favoriteSelectedNote(this, ${object.id}"></i></div>
        <h1 class="text">${removeHtmlTagsFromText(object.text).substring(0, 15)}</h1>
        <p class="date">${formatDate(new Date(object.date))}</p>
        <div class="deleteBtnContainer deleteBtnContainerActive"><i class="fas fa-trash-alt deleteBtn" onclick="deleteSelectedNote(this)"></i>
       </div>
        </div>
        `
    }
}


function favoriteSelectedNoteCheck(object) {

    if (object.isFavorite === true) {
        return 'favoriteBtnActive';
    } else {
        return "";
    }
}

/**
 * The function toggles isfavorite state by adding or remove css class. 
 * @param {HTMLElement} element 
 * @param {int} parentId 
 */
function favoriteSelectedNote(element, parentId) {
    let noteList = getNotes();

    for (i = 0; i < noteList.length; i++) {
        let note = noteList[i];

        if (note.id === parentId.toString()) {

            if (note.isFavorite === true) {
                element.classList.remove('favoriteBtnActive');
                noteList[i].isFavorite = false;

            } else {
                element.classList.add('favoriteBtnActive');
                noteList[i].isFavorite = true;
            }

        }
    }

    setNotes(noteList);

}


function deleteSelectedNote(element) {

    let noteList = getNotes();

    for (i = 0; i < noteList.length; i++) {
        let note = noteList[i];

        if (note.id === selectedNoteId) {
            noteList.splice(i, 1);
            break;
        }
    }

    clearEditor();
    setNotes(noteList);
    showNotes();
}



function toggleSearchInputField() {

    let inputText = document.querySelector('.searchField');

    if(selectedNavbarItemIndex === 1) {
     inputText.classList.add('searchFieldActive');
    } else {
        inputText.classList.remove('searchFieldActive');
    }
}

function getFavoriteNotes() {

    let noteList = getNotes();
    let favorites = noteList.filter(note => note.isFavorite);
    return favorites;
}



function getNotes() {

    if (localStorage.getItem('notes') === null) {
        return [];
    } else {
        return JSON.parse(localStorage.getItem('notes'));
    }
}


function setNotes(noteList) {
    localStorage.setItem('notes', JSON.stringify(noteList));
}

function removeSelectionInNoteList() {

    let notes = document.querySelectorAll('.noteContent');

    for (i = 0; i < notes.length; i++) {
        let note = notes[i];
        note.classList.remove("noteContentActive");
        note.querySelector('.deleteBtnContainer').classList.remove('deleteBtnContainerActive');
    }

}
 /**
  * The function adding a css class when noteObject is clicked. 
  * If the noteObject has saved text itself, the text is showing in the editor.
  * @param {HTMLElement} element 
  */
function noteClicked(element) {

    removeSelectionInNoteList();

    element.classList.add("noteContentActive");

    let idNote = element.id;
    let savedNotes = getNotes();

    for (i = 0; i < savedNotes.length; i++) {
        let editNote = savedNotes[i];

        if (editNote.id === idNote) {
            editor.html.set(editNote.text);
        }
    }

    selectedNoteId = idNote;

    element.querySelector('.deleteBtnContainer').classList.add('deleteBtnContainerActive');


}
/**
 * Function thats take a string and remove all Html tags from the string.
 * @param {string} html 
 */
function removeHtmlTagsFromText(htmlString) {

    var tmp = document.createElement("DIV");
    tmp.innerHTML = htmlString;
    return tmp.textContent || tmp.innerText || "";
}


// This will be called when page has finished loading.
window.onload = function () {

    let container = document.querySelector('#modalContainer');
    let seenModal = localStorage.getItem('seenModal');

    if (seenModal !== 'true') {
        document.querySelector('#modalContainer').style.display = "block";
        container.style.opacity = '1';

        let btnModal = document.querySelector('#btnModal');
        btnModal.onclick = function () {
            container.style.opacity = '0';

            localStorage.setItem('seenModal', 'true');

            container.addEventListener('transitionend', () => {
                container.style.display = 'none';
            });
        }
    }


}