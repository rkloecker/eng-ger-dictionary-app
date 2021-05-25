// version oct 2018
// cache DOM && Eventhandlers
const btnSubmit = document.getElementById("btnSubmit");
const output = document.getElementById("output");
const asc = document.getElementById("asc");
const descending = document.getElementById("descending");
document.getElementById("ascdesc").addEventListener("click", changeDirection);

document.getElementById("buttons").addEventListener("click", handleClick);

document.getElementById("create_date").addEventListener("click", sortedBy);
document.getElementById("description").addEventListener("click", sortedBy);
document.getElementById("english").addEventListener("click", sortedBy);
document.getElementById("german").addEventListener("click", sortedBy);

const eng = document.getElementById("eng");
const ger = document.getElementById("deu");
const des = document.getElementById("desc");

// DirectionParam default -1/DESC
let directParam = "desc";
// ID necessary for editing (handleClick, fillInputFields)
let theId;
// API calls go to ... + ...
const file = "https://gentle-harbor-35851.herokuapp.com/api/words";

// ASC or DESC
function changeDirection() {
  if (asc.classList.contains("inactive")) {
    asc.classList.remove("inactive");
    descending.classList.add("inactive");
    directParam = "asc";
  } else {
    descending.classList.remove("inactive");
    asc.classList.add("inactive");
    directParam = "desc";
  }
}

//Clickhandler
function handleClick(e) {
  e.preventDefault();
  let errorString = "";
  const obj = {
    english: eng.value,
    german: ger.value.split(","),
    description: des.value || "unknown",
  };
  const target = e.target.id;
  if (target == "btnSubmit") {
    if (!valid()) {
      errorString += "Please enter eng and deu!";
    } else {
      addToDict(obj, file);
    }
  } else if (target == "btnEdit") {
    if (!valid()) {
      errorString += "Please enter eng and deu!";
    } else {
      obj._id = theId;
      updateToDict(obj, file + "/" + obj._id);
      btnSubmit.classList.remove("disabled");
      window.location.hash = null;
    }
  } else if (target == "btnCancel") {
    clearFields();
    btnSubmit.classList.remove("disabled");
    window.location.hash = null;
  } else if (target == "btnQuery") {
    if (!validForSearch()) {
      console.log("Please enter eng or deu or desc!");
      errorString += "Please enter eng or deu or desc!";
    } else {
      getQuery();
    }
  }
  if (errorString.length > 0) {
    output.innerHTML = errorString;
  }
}

//FETCH Functions
function readDict() {
  fetch(file)
    .then((response) => response.json())
    .then(show)
    .catch((err) => {
      console.log(err);
    });
}

function sortedBy(e) {
  const str = file + "/?sort=" + e.target.id + `:${directParam}`;
  fetch(str)
    .then((response) => response.json())
    .then(show)
    .catch((err) => console.log(err));
}

function addToDict(opts, theFile) {
  fetch(theFile, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(opts),
  })
    .then(() => fetch(file))
    .then((response) => response.json())
    .then(show)
    .catch((err) => console.log(err));
}

function updateToDict(opts, theFile) {
  fetch(theFile, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify(opts),
  })
    .then(() => fetch(file))
    .then((response) => response.json())
    .then(show)
    .catch((err) => console.log(err));
}

function getQuery() {
  let qstr = "/?";
  if (eng.value) {
    qstr += `english=${eng.value}`;
  } else if (ger.value) {
    qstr += `german=${ger.value}`;
  } else if (des.value) {
    qstr += `description=${des.value}`;
    return fetch(file + qstr)
      .then((response) => response.json())
      .then(show)
      .catch((err) => console.log(err));
  }
  fetch(file + qstr)
    .then((response) => response.json())
    .then((data) => show(data ? [data] : []))
    .catch((err) => console.log(err));
}

// Output data to screen
function show(data) {
  let text = "";
  text += `<table class="table">
	<thead>
		<tr>
			<th>English</th>
			<th>German</th>
			<th>Description</th>
			<th>Edit / Delete</th>
			
		</tr>
	</thead>
	<tbody>`;
  data.forEach((element) => {
    text += `
		<tr>
			<td>${element.english}</td>
			<td> ${element.german}</td>
			<td>${element.description}</td>
			<td><div id="${element._id}"><button onclick="edit(event)" class="btn btn-success"><i class="far fa-sm">&#xf044;</i></button>
			<button onclick="deleteMe(event)" class="btn btn-danger"><i class="far fa-sm">&#xf2ed;</i></button></div></td>
		</tr>
		`;
  });
  text += `
	</tbody>
	</table>
	`;
  output.innerHTML = text;
  clearFields();
  eng.focus();
}

// helper methods
function fillInputFields(data) {
  eng.value = data.english;
  ger.value = data.german;
  des.value = data.description;
  theId = data._id;
}

function valid() {
  return eng.value && ger.value;
}

function validForSearch() {
  return eng.value || ger.value || des.value;
}

function clearFields() {
  eng.value = "";
  ger.value = "";
  des.value = "";
}

function deleteMe(e) {
  e.preventDefault();
  btnSubmit.classList.remove("disabled");
  clearFields();
  fetch(file + "/" + e.currentTarget.parentElement.id, {
    method: "DELETE",
  })
    .then(() => fetch(file))
    .then((response) => response.json())
    .then(show)
    .catch((err) => console.log(err));
}

function edit(e) {
  e.preventDefault();
  window.location.hash = "example";
  btnSubmit.classList.add("disabled");
  fetch(file + "/" + e.currentTarget.parentElement.id)
    .then((response) => response.json())
    .then(fillInputFields)
    .catch((err) => console.log(err));
}
