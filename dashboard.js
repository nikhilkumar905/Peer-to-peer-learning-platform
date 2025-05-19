$(document).ready(function () {
    let teacherData = localStorage.getItem("loggedInTeacher");
    let teacher = JSON.parse(teacherData || "{}");

    if (teacherData) {
        $("#viewProfile img").attr("src", teacher.image || "");
    }

    $("#viewProfile img, #openNotifications img, #openChat img").css({
        "border-radius": "50%",
        "width": "100px",
        "height": "100px",
        "object-fit": "cover",
        "transition": "transform 0.3s ease"
    });

    $("#viewProfile img, #openNotifications img, #openChat img").hover(
        function () { $(this).css("transform", "scale(1.1)"); },
        function () { $(this).css("transform", "scale(1)"); }
    );

    $("#viewProfile").click(function () {
        teacherData = localStorage.getItem("loggedInTeacher");
        teacher = JSON.parse(teacherData || "{}");

        if (teacherData) {
            $("#profileImage").attr("src", teacher.image || "");
            $("#profileName").text(`Name: ${teacher.name || ""}`);
            $("#profileEmail").text(`Email: ${teacher.email || ""}`);
            $("#profileContact").text(`Contact: ${teacher.contact || ""}`);
            $("#profileSkills").text(`Skills: ${teacher.skills || ""}`);
            $("#profileTopics").text(`Topics Can Teach: ${teacher.topics || ""}`);
            $("#profileYear").text(`Year: ${teacher.year || ""}`);
            $("#profileCourse").text(`Course: ${teacher.course || ""}`);
            $("#profileModal").show();
        } else {
            alert("No teacher is logged in.");
        }
    });

    $("#closeProfile").click(function () {
        $("#profileModal").hide();
    });

    $("#openNotifications").click(function () {
        loadNotifications();
        $("#notificationBox").show();
        $("#notificationCount").hide();
    });

    $("#closeNotification").click(function () {
        $("#notificationBox").hide();
    });

    $("#openChat").click(function () {
        loadChatUsers();
        $("#chatBox").show();
    });

    $("#closeChat").click(function () {
        $("#chatBox").hide();
    });

    $("#editProfile").click(function () {
        const teacher = JSON.parse(localStorage.getItem("loggedInTeacher"));
        $("#editName").val(teacher.name || "");
        $("#editEmail").val(teacher.email || "");
        $("#editContact").val(teacher.contact || "");
        $("#editSkills").val(teacher.skills || "");
        $("#editTopics").val(teacher.topics || "");
        $("#editYear").val(teacher.year || "");
        $("#editCourse").val(teacher.course || "");
        $("#editProfileModal").show();
    });

    $("#closeEditProfile").click(function () {
        $("#editProfileModal").hide();
    });

    $("#saveProfile").click(function () {
        const updatedTeacher = {
            ...JSON.parse(localStorage.getItem("loggedInTeacher")),
            name: $("#editName").val(),
            email: $("#editEmail").val(),
            contact: $("#editContact").val(),
            skills: $("#editSkills").val(),
            topics: $("#editTopics").val(),
            year: $("#editYear").val(),
            course: $("#editCourse").val()
        };

        localStorage.setItem("loggedInTeacher", JSON.stringify(updatedTeacher));

        $("#profileName").text(`Name: ${updatedTeacher.name}`);
        $("#profileEmail").text(`Email: ${updatedTeacher.email}`);
        $("#profileContact").text(`Contact: ${updatedTeacher.contact}`);
        $("#profileSkills").text(`Skills: ${updatedTeacher.skills}`);
        $("#profileTopics").text(`Topics Can Teach: ${updatedTeacher.topics}`);
        $("#profileYear").text(`Year: ${updatedTeacher.year}`);
        $("#profileCourse").text(`Course: ${updatedTeacher.course}`);

        alert("Profile updated.");
        $("#editProfileModal").hide();
    });

    $("#logoutBtn").click(function () {
        localStorage.removeItem("loggedInTeacher");
        window.location.href = "index.html";
    });

    // Load Follow Notifications
    function loadNotifications() {
        const currentTeacher = JSON.parse(localStorage.getItem("loggedInTeacher"));
        const follows = JSON.parse(localStorage.getItem("followNotifications")) || [];
        const notifications = follows.filter(f => f.teacherEmail === currentTeacher.email);

        const notifContainer = $("#notificationBox .modal-content");
        notifContainer.find(".notification").remove();

        notifications.forEach(n => {
            const notif = `
                <div class="notification">
                    <img src="${n.studentImage}" class="notif-pic">
                    ${n.studentName} has followed you.
                </div>`;
            notifContainer.append(notif);
        });
    }

    // Load chat users (followed students)
    function loadChatUsers() {
        const currentTeacher = JSON.parse(localStorage.getItem("loggedInTeacher"));
        const follows = JSON.parse(localStorage.getItem("followNotifications")) || [];
        const followers = follows.filter(f => f.teacherEmail === currentTeacher.email);

        const chatUsersContainer = $("#chatUsers");
        chatUsersContainer.html("");

        followers.forEach(f => {
            chatUsersContainer.append(`<div class="chat-user" data-email="${f.studentEmail}" data-name="${f.studentName}">${f.studentName}</div>`);
        });
    }

    // Chat feature
    let currentChatEmail = "";
    $(document).on("click", ".chat-user", function () {
        currentChatEmail = $(this).data("email");
        loadMessages();
    });

    function loadMessages() {
        const chatKey = `chat_teacher_${currentChatEmail}`;
        const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
        const container = $("#chatMessages");
        container.html("");
        messages.forEach(m => {
            container.append(`<div class="chat-message">${m}</div>`);
        });
    }

    $("#sendChat").click(function () {
        let message = $("#chatInput").val();
        if (message.trim() !== "") {
            const chatKey = `chat_teacher_${currentChatEmail}`;
            let messages = JSON.parse(localStorage.getItem(chatKey)) || [];
            messages.push("You: " + message);
            localStorage.setItem(chatKey, JSON.stringify(messages));
            $("#chatInput").val("");
            loadMessages();
        }
    });

    // Show unread count
    updateUnreadCount();
    function updateUnreadCount() {
        const currentTeacher = JSON.parse(localStorage.getItem("loggedInTeacher"));
        const follows = JSON.parse(localStorage.getItem("followNotifications")) || [];
        const count = follows.filter(f => f.teacherEmail === currentTeacher.email).length;
        if (count > 0) {
            $("#notificationCount").text(count).show();
        } else {
            $("#notificationCount").hide();
        }
    }
});
