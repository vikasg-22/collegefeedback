const API_BASE_URL = "https://collegefeedback-1.onrender.com"; // Replace with your actual deployed backend URL

const overlay = document.getElementById("dataOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const dataHeader = document.getElementById("dataHeader");
const dataBody = document.getElementById("dataBody");
const backBtn = document.getElementById("backBtn");
const body = document.body;

let feedbackData = [];

// Toggle Views
function toggleView(view) {
    document.getElementById("adminLogin").style.display = view === "login" ? "block" : "none";
    document.getElementById("adminDashboard").style.display = view === "dashboard" ? "block" : "none";
}

// Handle Login
document.getElementById("adminLoginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;

    if (username === "admin" && password === "123") {
        toggleView("dashboard");
    } else {
        alert("Invalid credentials!");
    }
});

// Logout Functionality
function logout() {
    toggleView("login");
}

// Add Subject API Integration
document.getElementById("addSubjectForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const branch = document.getElementById("branch").value;
    const semester = document.getElementById("semester").value;
    const newSubject = document.getElementById("newSubject").value;

    try {
        const response = await fetch(`${API_BASE_URL}/add-subject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ branch, semester, subject: newSubject })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Error adding subject:", error);
    }

    document.getElementById("addSubjectForm").reset();
});

function showOverlay(title, headers, data) {
    overlayTitle.textContent = title;
    dataHeader.innerHTML = headers.map(header => `<th>${header}</th>`).join("");
    dataBody.innerHTML = data.map(row =>
        `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`
    ).join("");
    body.classList.add("blur");
    overlay.classList.add("active");
}

backBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    body.classList.remove("blur");
});

document.addEventListener("DOMContentLoaded", function () {
    const yearSelect = document.getElementById("year-admin");
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        const academicYear1 = `${currentYear - 1}-${currentYear}`;
        const academicYear2 = `${currentYear}-${currentYear + 1}`;
        yearSelect.innerHTML = `<option value="">Select Year</option>`;
        yearSelect.innerHTML += `
            <option value="${academicYear1}">${academicYear1}</option>
            <option value="${academicYear2}">${academicYear2}</option>
        `;
    }
});

async function fetchBranches() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-branches`);
        const data = await response.json();
        const branchSelect = document.getElementById("branchSelect");
        branchSelect.innerHTML = '<option value="">Select Branch</option>';
        data.forEach(branch => {
            const option = document.createElement("option");
            option.value = branch;
            option.textContent = branch;
            branchSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        alert("Failed to load branches.");
    }
}

async function showSubjectsOverlay() {
    const branch = document.getElementById("branchSelect").value;
    const semester = document.getElementById("semesterSelect").value;

    if (!branch || !semester) {
        alert("Please select both branch and semester.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/get-subjects/${branch}/${semester}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        const tableBody = document.getElementById("subjectsTableBody");
        tableBody.innerHTML = "";

        data.forEach(subject => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${branch}</td>
                <td>${semester}</td>
                <td>${subject}</td>
                <td><button class="delete-btn" onclick="deleteSubject('${branch}', '${semester}', '${subject}')">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById("subjectsOverlay").classList.add("active");
        document.body.classList.add("blur");
    } catch (error) {
        console.error("Error fetching subjects:", error);
        alert("Failed to fetch subjects.");
    }
}

async function fetchAndPopulateBranches() {
    const branchSelect = document.getElementById("branch");
    try {
        const response = await fetch(`${API_BASE_URL}/get-branches`);
        const data = await response.json();
        branchSelect.innerHTML = '<option value="">Select</option>';
        data.forEach(branch => {
            const option = document.createElement("option");
            option.value = branch;
            option.textContent = branch;
            branchSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        alert("Failed to load branches.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    fetchAndPopulateBranches();
});

async function deleteSubject(branch, semester, subject) {
    if (confirm(`Are you sure you want to delete "${subject}"?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete-subject`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ branch, semester, subject })
            });
            const data = await response.json();
            alert(data.message);
            if (data.success) {
                showSubjectsOverlay();
            }
        } catch (error) {
            console.error("Error deleting subject:", error);
            alert("Failed to delete subject.");
        }
    }
}

function closeSubjectsOverlay() {
    document.getElementById("subjectsOverlay").classList.remove("active");
    document.body.classList.remove("blur");
}

document.getElementById("fetchSubjectsBtn").addEventListener("click", showSubjectsOverlay);

document.addEventListener("DOMContentLoaded", fetchBranches);

async function showQuestionsOverlay() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-questions`);
        const data = await response.json();
        currentQuestions = data;
        showQuestions('mid');
        document.getElementById("questionsOverlay").classList.add("active");
        document.body.classList.add("blur");
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to fetch questions.");
    }
}

function showQuestions(type) {
    const questions = type === 'mid' ? currentQuestions.mid_questions : currentQuestions.end_questions;
    const tableBody = document.getElementById("questionsTableBody");
    tableBody.innerHTML = "";

    questions.forEach((question, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${index + 1}</td><td>${question}</td>`;
        tableBody.appendChild(row);
    });

    document.querySelectorAll(".tab-button").forEach(button => button.classList.remove("active"));
    document.getElementById(`${type}Tab`).classList.add("active");
}

function closeQuestionsOverlay() {
    document.getElementById("questionsOverlay").classList.remove("active");
    document.body.classList.remove("blur");
}

document.getElementById("viewQuestionsBtn").addEventListener("click", showQuestionsOverlay);

async function updateSubject() {
    const branch = document.getElementById('branch-admin').value;
    const semester = document.getElementById('semester-admin').value;
    const subjectSelect = document.getElementById('subject');

    subjectSelect.innerHTML = '<option value="">Select Subject</option>';

    if (branch && semester) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-subjects/${branch}/${semester}`);
            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                data.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    subjectSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    }
}

document.getElementById('fetchFeedbackBtn').addEventListener('click', async function () {
    const year = document.getElementById('year-admin').value;
    const branch = document.getElementById('branch-admin').value;
    const semester = document.getElementById('semester-admin').value;
    const subject = document.getElementById('subject').value;
    const form = document.getElementById('formType').value;

    if (!year || !branch || !semester || !subject || !form) {
        alert('Please select all fields before fetching feedback.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch-feedback?year=${year}&branch=${branch}&semester=${semester}&subject=${subject}&form=${form}`);
        const data = await response.json();
        if (data.message) {
            alert('No feedback available for this selection.');
            return;
        }
        showFeedbackOverlay(data);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        alert('Failed to fetch feedback. Please try again.');
    }
});

const downloadFeedbackBtn = document.getElementById("downloadFeedbackBtn");
downloadFeedbackBtn.addEventListener("click", function () {
    const year = document.getElementById("year-admin").value;
    const branch = document.getElementById("branch-admin").value;
    const semester = document.getElementById("semester-admin").value;
    const subject = document.getElementById("subject").value;
    const form = document.getElementById("formType").value;

    if (!year || !branch || !semester || !subject || !form) {
        alert("Please fill all fields before downloading feedback.");
        return;
    }

    window.location.href = `${API_BASE_URL}/download-feedback?year=${year}&branch=${branch}&semester=${semester}&subject=${subject}&form=${form}`;
});

function showFeedbackOverlay(data) {
    document.getElementById('selectedYear').textContent = data.year;
    document.getElementById('selectedBranch').textContent = data.branch;
    document.getElementById('selectedSemester').textContent = data.semester;
    document.getElementById('selectedSubject').textContent = data.subject;
    document.getElementById('selectedFormType').textContent = data.form.charAt(0).toUpperCase() + data.form.slice(1);

    const tableBody = document.getElementById('feedbackTableBody');
    tableBody.innerHTML = '';

    let totalAVG = 0;
    let questionCount = data.feedback_data.length;

    data.feedback_data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.Question}</td>
            <td>${item['1 (Bad)']}</td>
            <td>${item['2 (Average)']}</td>
            <td>${item['3 (Good)']}</td>
            <td>${item['4 (Very Good)']}</td>
            <td style="font-weight: bold;">${item.AVG}</td>
        `;
        tableBody.appendChild(row);
        totalAVG += parseFloat(item.AVG) || 0;
    });

    const finalTotalAVG = questionCount > 0 ? (totalAVG / questionCount).toFixed(2) : 0;
    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-average-row');
    totalRow.innerHTML = `
        <td colspan="6" style="text-align:right; font-weight:bold;">Total Average</td>
        <td style="font-weight:bold;">${finalTotalAVG}</td>
    `;
    tableBody.appendChild(totalRow);
    document.getElementById('feedbackOverlay').classList.add('active');
    document.body.classList.add('blur');
}

function closeFeedbackOverlay() {
    document.getElementById("feedbackOverlay").classList.remove("active");
    document.body.classList.remove("blur");
}
