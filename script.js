function openForm(formId) {
    document.getElementById(formId).style.display = "block";
    clearForm(formId);
}

function closeForm(formId) {
    document.getElementById(formId).style.display = "none";
}

function clearForm(formId) {
    let inputs = document.querySelectorAll(`#${formId} input`);
    inputs.forEach(input => input.value = "");
}

function saveData(type) {
    let name = document.getElementById(`${type}Name`).value;
    let email = document.getElementById(`${type}Email`).value;
    let contact = document.getElementById(`${type}Contact`).value;
    let password = document.getElementById(`${type}Password`).value;
    let imageFile = document.getElementById(`${type}Image`).files[0];

    if (!name || !password || !email || !contact || !imageFile) {
        alert("Please fill all required fields!");
        return;
    }

    let reader = new FileReader();
    reader.onload = function(event) {
        let imageBase64 = event.target.result;

        let userData = {
            name,
            email,
            contact,
            image: imageBase64,
            password
        };

        if (type === "teach") {
            userData.course = document.getElementById("teachCourse").value;
            userData.year = document.getElementById("teachYear").value;
            userData.skills = document.getElementById("teachSkills").value;
            userData.topics = document.getElementById("teachTopics").value;
        }

        let storageKey = type === "teach" ? "teachersList" : "learnersList";
        let userList = JSON.parse(localStorage.getItem(storageKey)) || [];
        userList.push(userData);
        localStorage.setItem(storageKey, JSON.stringify(userList));

        alert(`${type === "teach" ? "Teacher" : "Learner"} profile saved successfully!`);
        closeForm(type + "Form");
    };
    reader.readAsDataURL(imageFile);
}

function verifyLogin(type) {
    let name = document.getElementById(`enter${capitalize(type)}Name`).value.trim();
    let password = document.getElementById(`enter${capitalize(type)}Password`).value.trim();

    let storageKey = type === "teach" ? "teachersList" : "learnersList";
    let userList = JSON.parse(localStorage.getItem(storageKey)) || [];

    let user = userList.find(user => user.name === name && user.password === password);

    if (user) {
        alert("Login Successful!");

        if (type === "learn") {
            localStorage.setItem("loggedInStudent", JSON.stringify(user));
            localStorage.setItem("currentProfileStudent", JSON.stringify(user));
            window.location.href = "teachers.html";
        } else {
            localStorage.setItem("loggedInTeacher", JSON.stringify(user));
            window.location.href = "dashboard.html";
        }
        
    } else {
        alert("Invalid Credentials!");
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function displayLoggedInStudent() {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));

    if (student && student.image) {
        document.getElementById("studentImage").src = student.image;
        localStorage.setItem("currentProfileStudent", JSON.stringify(student));
    }
}
