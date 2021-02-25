"use strict";

window.addEventListener("DOMContentLoaded", start);

const studentData = [];
// The prototype for all students: 
const Student = {
    firstName: "",
    lastName: "",
    house: "",
    gender: "",
};

const settings = {
    filter: "all",
    sortyBy: "name",
    sortDir: "asc"
}

function start() {
    console.log("ready");

    loadJSON();
    registerButtons();
}

async function loadJSON() {
    const response = await fetch("https://petlatkea.dk/2021/hogwarts/students.json");
    const jsonData = await response.json();

    // when loaded, prepare data objects
    prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
    jsonData.forEach(jsonObject => {
        //  console.log("#########")
        let nameArray = jsonObject.fullname.split(" ");
        let processedNameArray = removeEmptyStrFromArr(nameArray);
        // console.log(processedNameArray);

        let capitalizedNameArray = [];
        processedNameArray.forEach(name => {
            name = capitalizeFirstLetter(name);
            capitalizedNameArray.push(name);
        })
        // console.log(capitalizedNameArray);

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

function registerButtons() {
    // document.querySelectorAll("[data-action='filter']")
    //     .forEach(button => button.addEventListener("click", selectFilter));


    document.querySelectorAll("[data-action='sort']")
        .forEach(button => button.addEventListener("click", selectSort));
}

function displayList(students) {
    // clear the list
    document.querySelector("#list tbody").innerHTML = "";

    // build a new list
    students.forEach(displayStudent);
}

function displayStudent(student) {
    // create clone
    const clone = document.querySelector("#student").content.cloneNode(true);

    // set clone data
    clone.querySelector("[data-field=first-name]").textContent = student.firstName;
    clone.querySelector("[data-field=last-name]").textContent = student.lastName;
    clone.querySelector("[data-field=house]").textContent = student.house;
    clone.querySelector("[data-field=gender]").textContent = student.gender;

    // append clone to list
    document.querySelector("#list tbody").appendChild(clone);
}

function selectSort(event) {
    const sortBy = event.target.dataset.sort;
    const sortDir = event.target.dataset.sortDirection;

    //find "old" sortby element
    const oldElement = document.querySelector(`[data-sort='${settings.sortyBy}']`);
    oldElement.classList.remove("sortby");

    //indicate active sort
    event.target.classList.add("sortby");

    //toggle the direction
    if (sortDir === "asc") {
        event.target.dataset.sortDirection = "desc";
    } else {
        event.target.dataset.sortDirection = "asc";

    }
    console.log(`User selected ${sortBy} - ${sortDir}`);
    setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
    settings.sortBy = sortBy;
    settings.sortDir = sortDir;
    buildList();
}


function selectSort(event) {
    settings.sortBy = event.target.dataset.sort;
    let filteredList = sortList();
    displayList(filteredList);

   //toggle the direction
    if (settings.sortDir === "asc") {
        settings.sortDir = "desc";
    } else {
        settings.sortDir = "asc";

    }
}

function sortList() {
    let direction = 1;
    if (settings.sortDir === "desc") {
        direction = -1;
    } else {
        settings.direction = 1;
    }
    console.log(studentData[0], settings.sortBy)
    let sortedList = studentData.sort(sortByPropriety);
    
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

function buildList() {
    const currentList = filterList(studentData);
    const sortedList = sortList(currentList);

    displayList(sortedList);
}