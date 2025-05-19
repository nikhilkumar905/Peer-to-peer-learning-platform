document.addEventListener("DOMContentLoaded", () => {
    loadTeachers();
    showStudentProfileIcon(); // 🔄 New: Display circular image if student is logged in
});

function loadTeachers() {
    let teacherList = document.getElementById("teacherList");
    teacherList.innerHTML = ""; 

    let storedTeachers = JSON.parse(localStorage.getItem("teachersList")) || [];

    storedTeachers.forEach(teacher => {
        let card = document.createElement("div");
        card.classList.add("teacher-card");

        let storedRatings = JSON.parse(localStorage.getItem(`rating_${teacher.email}`)) || [];
        let averageRating = storedRatings.length > 0 
            ? (storedRatings.reduce((sum, r) => sum + r, 0) / storedRatings.length).toFixed(1) 
            : "No Ratings Yet";

        card.innerHTML = `
            <img src="${teacher.image}" alt="Profile">
            <h3>${teacher.name}</h3>
            <p>Email: ${teacher.email}</p>
            <p>Course: ${teacher.course}, Year: ${teacher.year}</p>
            <p>Skills: ${teacher.skills}</p>
            <p>Topics: ${teacher.topics}</p>
            <p><strong>Rating:</strong> ${averageRating} ⭐</p>
<button class="chat-btn" onclick="openChat('${teacher.name}')">Chat</button>
<button class="rating-btn" onclick="openPopup('ratingPopup'); setCurrentTeacher('${teacher.email}')">Rate Me</button>
<button class="follow-btn" onclick="toggleFollow('${teacher.email}', this)">
    ${isFollowing(teacher.email) ? "Following" : "Follow"}
</button>

        `;
        teacherList.appendChild(card);
    });
}

// Search Filter
function filterTeachers() {
    let searchText = document.getElementById("searchBox").value.toLowerCase();
    let cards = document.querySelectorAll(".teacher-card");

    cards.forEach(card => {
        let skills = card.innerText.toLowerCase();
        card.style.display = skills.includes(searchText) ? "block" : "none";
    });
}

// Popup Handling
function openPopup(id) {
    document.getElementById(id).style.display = "block";
}

function closePopup(id) {
    document.getElementById(id).style.display = "none";
}

// Chat System
let currentTeacher = "";

function openChat(teacherName) {
    currentTeacher = teacherName;
    document.getElementById("chatTeacherName").innerText = `Chat with ${teacherName}`;
    document.querySelector(".chat-messages").innerHTML = loadChatHistory(teacherName);
    openPopup("chatPopup");
}

function sendMessage() {
    let chatBox = document.querySelector(".chat-messages");
    let message = document.getElementById("chatInput").value;
    if (message.trim() !== "") {
        let formattedMessage = `<p><strong>You:</strong> ${message}</p>`;
        chatBox.innerHTML += formattedMessage;
        document.getElementById("chatInput").value = "";
        chatBox.scrollTop = chatBox.scrollHeight;

        saveChatHistory(currentTeacher, formattedMessage);
    }
}

// Chat Storage
function saveChatHistory(teacher, message) {
    let chatHistory = JSON.parse(localStorage.getItem(`chat_${teacher}`)) || [];
    chatHistory.push(message);
    localStorage.setItem(`chat_${teacher}`, JSON.stringify(chatHistory));
}

function loadChatHistory(teacher) {
    let chatHistory = JSON.parse(localStorage.getItem(`chat_${teacher}`)) || [];
    return chatHistory.join("");
}

// Rating System
let selectedTeacher = "";

function setCurrentTeacher(email) {
    selectedTeacher = email;
}

function setRating(stars) {
    let starElements = document.querySelectorAll("#ratingPopup .star");
    starElements.forEach((star, index) => {
        star.classList.toggle("active", index < stars);
    });
}

function submitRating() {
    let selectedStars = document.querySelectorAll("#ratingPopup .star.active").length;
    if (selectedStars > 0) {
        let ratings = JSON.parse(localStorage.getItem(`rating_${selectedTeacher}`)) || [];
        ratings.push(selectedStars);
        localStorage.setItem(`rating_${selectedTeacher}`, JSON.stringify(ratings));
        alert("Rating submitted!");
        closePopup("ratingPopup");
        loadTeachers(); 
    } else {
        alert("Please select a rating!");
    }
}
function isFollowing(teacherEmail) {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));
    if (!student) return false;

    const followData = JSON.parse(localStorage.getItem("followData")) || {};
    const studentFollows = followData[student.email] || [];

    return studentFollows.includes(teacherEmail);
}

function toggleFollow(teacherEmail, button) {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));
    if (!student) {
        alert("Please login as a student.");
        return;
    }

    let followData = JSON.parse(localStorage.getItem("followData")) || {};
    let studentFollows = followData[student.email] || [];

    if (studentFollows.includes(teacherEmail)) {
        // Unfollow
        studentFollows = studentFollows.filter(email => email !== teacherEmail);
        button.textContent = "Follow";
    } else {
        // Follow
        studentFollows.push(teacherEmail);
        button.textContent = "Following";

        // Optional: Send follow notification to teacher's dashboard
        sendFollowNotification(teacherEmail, student);
    }

    followData[student.email] = studentFollows;
    localStorage.setItem("followData", JSON.stringify(followData));
}

function sendFollowNotification(teacherEmail, student) {
    let notifications = JSON.parse(localStorage.getItem("notifications_" + teacherEmail)) || [];
    notifications.push({
        message: `${student.name} started following you.`,
        timestamp: new Date().toLocaleString(),
        read: false
    });
    localStorage.setItem("notifications_" + teacherEmail, JSON.stringify(notifications));
}


// 🔄 New function to display circular profile icon of logged-in student
function showStudentProfileIcon() {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));

    if (student && student.image) {
        let existing = document.getElementById("studentProfileContainer");
        if (!existing) {
            let imgDiv = document.createElement("div");
            imgDiv.id = "studentProfileContainer";
            imgDiv.className = "student-profile"; // Optional for consistent styling

            // Create image separately
            let img = document.createElement("img");
            img.src = student.image;
            img.alt = "Student Profile";

            img.onclick = goToStudentProfile;

            // Add image and logout button separately
            imgDiv.appendChild(img);
            document.body.appendChild(imgDiv);

            // 🔁 Ensure logout button is created *after* image is added
            addLogoutButton();
        }
    }
}

function addLogoutButton() {
    const container = document.getElementById("studentProfileContainer");

    if (container) {
        let logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Logout";
        logoutBtn.style.display = "block";
        logoutBtn.style.marginTop = "8px";
        logoutBtn.style.padding = "5px 10px";
        logoutBtn.style.fontSize = "14px";
        logoutBtn.style.border = "none";
        logoutBtn.style.borderRadius = "5px";
        logoutBtn.style.backgroundColor = "#f44336";
        logoutBtn.style.color = "white";
        logoutBtn.style.cursor = "pointer";

        logoutBtn.onclick = () => {
            localStorage.removeItem("loggedInStudent");
            window.location.href = "index.html";
        };

        container.appendChild(logoutBtn);
    }
}


function goToStudentProfile() {
    const student = JSON.parse(localStorage.getItem("loggedInStudent"));
    if (student) {
        localStorage.setItem("currentProfileStudent", JSON.stringify(student));
        window.location.href = "student-profile.html";
    } else {
        alert("Student profile not found.");
    }
}


