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
        const response = await fetch('/add-subject', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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

    // Populate the table header
    dataHeader.innerHTML = headers.map(header => `<th>${header}</th>`).join("");

    // Populate the table body
    dataBody.innerHTML = data.map(row => 
        `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`
    ).join("");

    body.classList.add("blur"); // Blur the background
    overlay.classList.add("active"); // Show overlay
}

// Hide overlay and restore dashboard
backBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
    body.classList.remove("blur");
});

document.addEventListener("DOMContentLoaded", function () {
    const yearSelect = document.getElementById("year-admin");

    if (yearSelect) {
        const currentYear = new Date().getFullYear(); // Get the current year
        const academicYear1 = `${currentYear - 1}-${currentYear}`;
        const academicYear2 = `${currentYear}-${currentYear + 1}`;

        // Clear existing options
        yearSelect.innerHTML = `<option value="">Select Year</option>`;

        // Add dynamically generated years
        yearSelect.innerHTML += `
            <option value="${academicYear1}">${academicYear1}</option>
            <option value="${academicYear2}">${academicYear2}</option>
        `;
    }
});

// Fetch available branches from the database
async function fetchBranches() {
    try {
        const response = await fetch('/get-branches');
        const data = await response.json();
        const branchSelect = document.getElementById("branchSelect");
        branchSelect.innerHTML = '<option value="">Select Branch</option>'; // Clear previous data

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

// Function to fetch and display subjects based on selection
async function showSubjectsOverlay() {
    const branch = document.getElementById("branchSelect").value;
    const semester = document.getElementById("semesterSelect").value;

    if (!branch || !semester) {
        alert("Please select both branch and semester.");
        return;
    }

    try {
        const response = await fetch(`/get-subjects/${branch}/${semester}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        const tableBody = document.getElementById("subjectsTableBody");
        tableBody.innerHTML = ""; // Clear previous data

        data.forEach(subject => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${branch}</td>
                <td>${semester}</td>
                <td>${subject}</td>
                <td>
                    <button class="delete-btn" onclick="deleteSubject('${branch}', '${semester}', '${subject}')">Delete</button>
                </td>
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

// Function to fetch and populate branches dynamically
async function fetchAndPopulateBranches() {
    const branchSelect = document.getElementById("branch");

    try {
        // Fetch branches from the server
        const response = await fetch('/get-branches');
        const data = await response.json();

        // Clear existing options (except the default "Select" option)
        branchSelect.innerHTML = '<option value="">Select</option>';

        // Populate the branch dropdown with fetched data
        data.forEach(branch => {
            const option = document.createElement("option");
            option.value = branch;
            option.textContent = branch;
            branchSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching branches:", error);
        alert("Failed to load branches. Please try again.");
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", function () {
    fetchAndPopulateBranches(); // Populate branches
});

// Function to delete a subject
async function deleteSubject(branch, semester, subject) {
    if (confirm(`Are you sure you want to delete "${subject}"?`)) {
        try {
            const response = await fetch('/delete-subject', {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ branch, semester, subject })
            });
            const data = await response.json();
            alert(data.message);
            if (data.success) {
                showSubjectsOverlay(); // Refresh the table
            }
        } catch (error) {
            console.error("Error deleting subject:", error);
            alert("Failed to delete subject.");
        }
    }
}

// Function to close the subjects overlay
function closeSubjectsOverlay() {
    document.getElementById("subjectsOverlay").classList.remove("active");
    document.body.classList.remove("blur");
}

// Event Listeners
document.getElementById("fetchSubjectsBtn").addEventListener("click", showSubjectsOverlay);

// Load branches on page load
document.addEventListener("DOMContentLoaded", fetchBranches);

// Function to show the questions overlay
async function showQuestionsOverlay() {
    try {
        const response = await fetch('/get-questions');
        const data = await response.json();
        currentQuestions = data;
        showQuestions('mid'); // Default to mid semester questions
        document.getElementById("questionsOverlay").classList.add("active");
        document.body.classList.add("blur");
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to fetch questions.");
    }
}

// Function to show questions based on type (mid/end)
function showQuestions(type) {
    const questions = type === 'mid' ? currentQuestions.mid_questions : currentQuestions.end_questions;
    const tableBody = document.getElementById("questionsTableBody");
    tableBody.innerHTML = "";

    questions.forEach((question, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${question}</td>
        `;
        tableBody.appendChild(row);
    });

    // Update active tab
    document.querySelectorAll(".tab-button").forEach(button => button.classList.remove("active"));
    document.getElementById(`${type}Tab`).classList.add("active");
}

// Function to close the questions overlay
function closeQuestionsOverlay() {
    document.getElementById("questionsOverlay").classList.remove("active");
    document.body.classList.remove("blur");
}

// Event listener for the "View Questions" button
document.getElementById("viewQuestionsBtn").addEventListener("click", showQuestionsOverlay);

// Function to update subjects based on selected branch and semester
async function updateSubject() {
    const branch = document.getElementById('branch-admin').value;
    const semester = document.getElementById('semester-admin').value;
    const subjectSelect = document.getElementById('subject');

    // Clear subject options first
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';

    // If branch and semester are selected, fetch subjects
    if (branch && semester) {
        try {
            const response = await fetch(`/get-subjects/${branch}/${semester}`);
            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                // Populate the subject dropdown
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
// Add event listener to the "Fetch Feedback" button
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
        const response = await fetch(`/fetch-feedback?year=${year}&branch=${branch}&semester=${semester}&subject=${subject}&form=${form}`);
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

// Function to fetch branches from the backend
async function fetchBranches() {
    try {
        const response = await fetch('/get-branches');
              const data = await response.json();

        // Populate branch dropdowns
        const branchDropdowns = document.querySelectorAll('select[id*="branch"]');
        branchDropdowns.forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select Branch</option>'; // Reset options
            data.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch;
                option.textContent = branch;
                dropdown.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error fetching branches:', error);
        alert('Failed to load branches. Please try again.');
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchBranches);

// Function to download feedback as an Excel file
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

    // Redirect to the download-feedback endpoint with parameters
    window.location.href = `/download-feedback?year=${year}&branch=${branch}&semester=${semester}&subject=${subject}&form=${form}`;
});
// Function to show the feedback overlay
function showFeedbackOverlay(data) {
    // Update header information
    document.getElementById('selectedYear').textContent = data.year;
    document.getElementById('selectedBranch').textContent = data.branch;
    document.getElementById('selectedSemester').textContent = data.semester;
    document.getElementById('selectedSubject').textContent = data.subject;
    document.getElementById('selectedFormType').textContent = data.form.charAt(0).toUpperCase() + data.form.slice(1);

    // Populate the feedback table
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

    // Add total average row
    const finalTotalAVG = questionCount > 0 ? (totalAVG / questionCount).toFixed(2) : 0;
    const totalRow = document.createElement('tr');
    totalRow.classList.add('total-average-row');
    totalRow.innerHTML = `
        <td colspan="6" style="text-align:right; font-weight:bold;">Total Average</td>
        <td style="font-weight:bold;">${finalTotalAVG}</td>
    `;
    tableBody.appendChild(totalRow);

    // Show the feedback overlay
    document.getElementById('feedbackOverlay').classList.add('active');
    document.body.classList.add('blur');
}
// Function to close the feedback overlay
function closeFeedbackOverlay() {
    document.getElementById("feedbackOverlay").classList.remove("active");
    document.body.classList.remove("blur");
}