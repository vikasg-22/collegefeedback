let questions = []; // This should be populated dynamically with the questions fetched from the server

// Configuration
const API_BASE_URL = "https://collegefeedback-1.onrender.com";
const MONGO_CONFIG = {
    database: "feedback_db",
    cluster: "Cluster0"
};

function showUserDashboard() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('userDashboard').style.display = 'block';
}

// Update subjects dynamically when branch and semester are selected
async function updateSubjects() {
    const branch = document.getElementById("branch").value;
    const semester = document.getElementById("semester").value;
    const subjectSelect = document.getElementById("subject");

    subjectSelect.innerHTML = '<option value="">Select</option>';
    if (branch && semester) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-subjects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Database": MONGO_CONFIG.database,
                    "Cluster": MONGO_CONFIG.cluster
                },
                body: JSON.stringify({ branch, semester })
            });
            
            const data = await response.json();
            if (data.error) {
                alert(data.error);
            } else {
                data.forEach(subject => {
                    const option = document.createElement("option");
                    option.value = subject;
                    option.textContent = subject;
                    subjectSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("Error fetching subjects:", error);
            alert("Failed to load subjects. Please try again.");
        }
    }
}

// Fetch and populate branches dynamically
async function fetchAndPopulateBranches() {
    const branchSelect = document.getElementById("branch");

    try {
        const response = await fetch(`${API_BASE_URL}/get-branches`, {
            headers: {
                "Database": MONGO_CONFIG.database,
                "Cluster": MONGO_CONFIG.cluster
            }
        });
        
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
        alert("Failed to load branches. Please try again.");
    }
}

// Update questions based on form selection
async function updateQuestions() {
    const formValue = document.getElementById("form").value;
    const branch = document.getElementById("branch").value;
    const subject = document.getElementById("subject").value;
    
    if (!formValue || !branch || !subject) {
        document.getElementById("questionsContainer").style.display = "none";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/get-questions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Database": MONGO_CONFIG.database,
                "Cluster": MONGO_CONFIG.cluster
            },
            body: JSON.stringify({ branch, subject, form: formValue })
        });
        
        const data = await response.json();
        window.questions = formValue === "mid" ? (data.mid_questions || []) : (data.end_questions || []);

        if (!Array.isArray(window.questions) || window.questions.length === 0) {
            alert("No questions found for this selection.");
            return;
        }

        displayQuestions(window.questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to load questions. Please try again.");
    }
}

// Display questions with radio options
function displayQuestions(questions) {
    const questionsDiv = document.getElementById("questions");
    questionsDiv.innerHTML = "";

    questions.forEach((question, index) => {
        const questionElement = document.createElement("div");
        questionElement.innerHTML = `
            <p><span class="question-number">${index + 1}.</span> ${question}</p>
            <div class="radio-group">
                ${['Very Good', 'Good', 'Average', 'Bad'].map(option => `
                    <label class="radio-label">
                        <input type="radio" name="question${index}" value="${option}" ${option === 'Very Good' ? 'required' : ''}>
                        <span class="custom-radio">${option}</span>
                    </label>
                `).join('')}
            </div>
        `;
        questionsDiv.appendChild(questionElement);
    });

    document.getElementById("questionsContainer").style.display = "block";
}

// Initialize academic year dropdown
function initAcademicYear() {
    const yearSelect = document.getElementById("year");
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = `
        <option value="">Select Year</option>
        <option value="${currentYear - 1}-${currentYear}">${currentYear - 1}-${currentYear}</option>
        <option value="${currentYear}-${currentYear + 1}">${currentYear}-${currentYear + 1}</option>
    `;
}

// Handle form submission
async function submitFeedback(event) {
    event.preventDefault();

    // Collect form data
    const registerNumber = document.getElementById("registerNumber").value.trim();
    if (registerNumber.length !== 10) {
        alert("Register number must be 10 characters");
        return;
    }

    const formData = {
        register_number: registerNumber,
        semester: document.getElementById("semester").value,
        branch: document.getElementById("branch").value,
        subject: document.getElementById("subject").value,
        form: document.getElementById("form").value,
        year: document.getElementById("year").value,
        ratings: []
    };

    // Validate all fields
    for (const key in formData) {
        if (!formData[key] && key !== 'ratings') {
            alert(`Please fill out ${key.replace('_', ' ')}`);
            return;
        }
    }

    // Collect ratings
    for (let i = 0; i < window.questions.length; i++) {
        const selected = document.querySelector(`input[name="question${i}"]:checked`);
        if (!selected) {
            alert(`Please rate question ${i + 1}`);
            return;
        }
        formData.ratings.push(selected.value);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/submit-feedback`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Database": MONGO_CONFIG.database,
                "Cluster": MONGO_CONFIG.cluster
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        alert(result.message || result.error);
        
        if (response.ok) {
            document.getElementById("feedbackForm").reset();
            document.getElementById("questionsContainer").style.display = "none";
        }
    } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("Failed to submit feedback. Please try again.");
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    fetchAndPopulateBranches();
    initAcademicYear();
    
    // Set up event listeners
    document.getElementById("branch").addEventListener("change", updateSubjects);
    document.getElementById("semester").addEventListener("change", updateSubjects);
    document.getElementById("form").addEventListener("change", updateQuestions);
    document.getElementById("feedbackForm").addEventListener("submit", submitFeedback);
});