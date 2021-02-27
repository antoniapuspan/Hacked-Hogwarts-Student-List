"use strict";

window.addEventListener("DOMContentLoaded", start);

//Global variables
const studentData = [];
const searchBar = document.querySelector("#searchBar");

//The prototype for all students: 
const Student = {
    firstName: "",
    lastName: "",
    house: "",
    gender: "",
    prefect: false
};

const settings = {
    filter: "all",
    sortyBy: "name",
    sortDir: "asc"
}

function start() {
    console.log("ready");

    //Add event-listeners to filter and sort buttons
    document.getElementById("gf").addEventListener("click", prepareGryffindor);
    document.getElementById("hf").addEventListener("click", prepareHufflepuff);
    document.getElementById("rv").addEventListener("click", prepareRavenclaw);
    document.getElementById("sl").addEventListener("click", prepareSlytherin);
    document.getElementById("all").addEventListener("click", displayList(studentData));

    loadJSON();
    registerButtons();
    loadJSONBlood();
}

async function loadJSON() {
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    const jsonData = await response.json();

    // when loaded, prepare data objects
    prepareObjects(jsonData);
}

function registerButtons() {
    document.querySelectorAll("[data-action='filter']")
        .forEach(button => button.addEventListener("click", selectFilter));

    document.querySelectorAll("[data-action='sort']")
        .forEach(button => button.addEventListener("click", selectSort));
}

function prepareObjects(jsonData) {
    jsonData.forEach(jsonObject => {

        let nameArray = jsonObject.fullname.split(" ");
        let processedNameArray = removeEmptyStrFromArr(nameArray);
        let capitalizedNameArray = [];
        processedNameArray.forEach(name => {
            name = capitalizeFirstLetter(name);
            capitalizedNameArray.push(name);
        })

        let firstName = capitalizedNameArray[0];
        let lastName = capitalizedNameArray[capitalizedNameArray.length - 1];
        let middleAndNickname = lookForMiddleName(capitalizedNameArray);
        let middleName = null;
        let nickName = null;
        let houseName = capitalizeFirstLetter(removeSpaceFromStr(jsonObject.house));
        let gender = capitalizeFirstLetter(jsonObject.gender);

        if (middleAndNickname != undefined) {
            if (middleAndNickname.middleName != "") {
                middleName = middleAndNickname.middleName;
            }
            if (middleAndNickname.nickName != "") {
                nickName = middleAndNickname.nickName;
                nickName = nickName.substring(1, nickName.length - 1);
                nickName = capitalizeFirstLetter(nickName);
            }
        }

        let newStudent = {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            nickname: nickName,
            house: houseName,
            gender: gender
        }
        studentData.push(newStudent);

    });
    displayList(studentData);
}

function displayList(students) {
    console.log(students);
    //clear the list
    document.querySelector("#list tbody").innerHTML = "";

    //build a new list
    students.forEach(displayStudent);
}

function displayStudent(student) {
    //create clone
    const clone = document.querySelector("#student").content.cloneNode(true);

    //set clone data
    clone.querySelector("[data-field=first-name]").textContent = student.firstName;
    clone.querySelector("[data-field=last-name]").textContent = student.lastName;
    clone.querySelector("[data-field=house]").textContent = student.house;
    clone.querySelector("[data-field=gender]").textContent = student.gender;

    clone.querySelector("tr").setAttribute("onclick", `showModal("${student.firstName}", "${student.lastName}")`)


    //append clone to list
    document.querySelector("#list tbody").appendChild(clone);
}

//Preparing lists for each house

async function loadJSONGryffindor() {
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    const jsonData = await response.json();

    prepareGryffindor(jsonData);
}

function prepareGryffindor(jsonData) {
    let onlyGryffindor = [];
    studentData.forEach(student => {
        if (isGryffindor(student)) {
            onlyGryffindor.push(student);
        }
    })
    displayList(onlyGryffindor);
}

async function loadJSONHufflePuff() {
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    const jsonData = await response.json();

    prepareHufflepuff(jsonData);
}

function prepareHufflepuff(jsonData) {
    let onlyHufflepuff = [];
    studentData.forEach(student => {
        if (isHufflepuff(student)) {
            onlyHufflepuff.push(student);
        }
    })
    displayList(onlyHufflepuff);
}

async function loadJSONRavenclaw() {
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    const jsonData = await response.json();

    prepareRavenclaw(jsonData);
}

function prepareRavenclaw(jsonData) {
    let onlyRavenclaw = [];
    studentData.forEach(student => {
        if (isRavenclaw(student)) {
            onlyRavenclaw.push(student);
        }
    })
    displayList(onlyRavenclaw);
}

async function loadJSONSlytherin() {
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    const jsonData = await response.json();

    prepareSlytherin(jsonData);
}

function prepareSlytherin(jsonData) {
    let onlySlytherin = [];
    studentData.forEach(student => {
        if (isSlytherin(student)) {
            onlySlytherin.push(student);
        }
    })
    displayList(onlySlytherin);
}

//SELECT A FILTER
function selectFilter(event) {
    const filter = event.target.dataset.filter;
    console.log(`User selected ${filter}`);
    setFilter(filter);
}

function setFilter(filter) {
    settings.filter = filter;
    buildList();
}

//FILTER LIST FOR EACH HOUSE
function filteredListFunction(filteredList) {
    if (settings.filter === "gryffindor") {
        filteredList = studentData.filter(isGryffindor);

    } else if (settings.filter === "hufflepuff") {
        filteredList = studentData.filter(isHufflepuff);

    } else if (settings.filter === "ravenclaw") {
        filteredList = studentData.filter(isRavenclaw);

    } else if (settings.filter === "slytherin") {
        filteredList = studentData.filter(isSlytherin);
    }
    return filteredList;
}

//SORT LIST

function selectSort(event) {
    settings.sortBy = event.target.dataset.sort;
    settings.sortDir = event.target.dataset.sortDirection;

    //toggle the direction
    if (settings.sortDir === "asc") {
        event.target.dataset.sortDirection = "desc";
    } else {
        event.target.dataset.sortDirection = "asc";
    }
    console.log(`User selected ${settings.sortBy} - ${settings.sortDir}`);
    setSort(settings.sortBy, settings.sortDir);
}


function setSort(sortBy, sortDir) {
    settings.sortBy = sortBy;
    settings.sortDir = sortDir;
    buildList();
}

function sortList(sortedList) {
    let direction = 1;
    if (settings.sortDir === "desc") {
        direction = -1;
    } else {
        settings.direction = 1;
    }
    sortedList = sortedList.sort(sortByPropriety);

    function sortByPropriety(studentA, studentB) {
        if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
            return -1 * direction;
        } else {
            return 1 * direction;
        }
    }

    return sortedList;
}

//Removes empty string from array
function removeEmptyStrFromArr(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "") {
            arr.splice(i, 1);
        }
    }
    return arr;
}

function removeSpaceFromStr(x) {
    return x.replace(" ", "");
}

//FIRST LETTER UPPERCASE
function capitalizeFirstLetter(x) {
    let arr = x.split("-");
    if (arr.length > 1) {
        let newName = "";
        arr.forEach(name => {
            newName = newName + name[0].toUpperCase() + name.slice(1).toLowerCase() + "-";
        })
        newName = newName.substring(0, newName.length - 1);
        return newName;

    } else {
        return x[0].toUpperCase() + x.slice(1).toLowerCase();
    }
}

function lookForMiddleName(arr) {
    if (arr.length > 2) {
        let nickName = "";
        let middleName = "";
        arr.shift();
        arr.pop();
        arr.forEach(element => {
            if (element[0] == '"') {
                nickName = element;
                let i = arr.indexOf(element);
                arr.splice(i, 1);
            }
        })
        arr.forEach(name => {
            middleName = middleName + name + " "

        })
        middleName = middleName.substring(0, middleName.length - 1);


        return {
            nickName: nickName,
            middleName: middleName
        }
    }
}

//BUILDING THE NEW LIST
function buildList() {
    const currentList = filteredListFunction(studentData);

    const sortedList = sortList(currentList);

    displayList(sortedList);
}

// display filtered results
function displayFilteredListFunction(filtered) {
    document.querySelector("#list tbody").innerHTML = "";
    // build a new list
    filtered.forEach(displayStudent);
}

//Gryffindor
function isGryffindor(student) {
    if (student.house === "Gryffindor") {
        return true;
    } else {
        return false;
    }
}

//Hufflepuff
function isHufflepuff(student) {
    if (student.house === "Hufflepuff") {
        return true;
    } else {
        return false;
    }
}

//Ravenclaw
function isRavenclaw(student) {
    if (student.house === "Ravenclaw") {
        return true;
    } else {
        return false;
    }
}


//Slytherin
function isSlytherin(student) {
    if (student.house === "Slytherin") {
        return true;
    } else {
        return false;
    }
}


function isAllStudents(student) {
    if (student.house === "all") {
        return true;
    } else {
        return false;
    }
}

//Search engine
searchBar.addEventListener("keyup", (event) => {
    const searchName = event.target.value.toUpperCase();
    const searchedStuds = studentData.filter((student) => {
        return (
            student.firstName.toUpperCase().includes(searchName) || student.house.includes(searchName)
        );
    });
    displayList(searchedStuds);
});

