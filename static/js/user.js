let questions = []; // This should be populated dynamically with the questions fetched from the server

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
            const response = await fetch(`/get-subjects/${branch}/${semester}`);
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
        }
    }
}

// Assuming you have a select element for branch with id="branch"
const branchSelector = document.getElementById("branch");

branchSelector.addEventListener("change", function() {
    // Show the questions container when the branch is selected
    document.getElementById("questionsContainer").style.display = "block";
    
    // Fetch and display questions once the branch is selected
    updateQuestions();
});

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

async function updateQuestions() {
    const formValue = document.getElementById("form").value;
    if (!formValue) {
        document.getElementById("questionsContainer").style.display = "none";
        return;
    }

    try {
        const response = await fetch("/get-questions");
        const data = await response.json();
        console.log("Fetched Questions:", data);

        if (!data || typeof data !== "object") {
            console.error("Invalid questions data format:", data);
            alert("Error fetching questions.");
            return;
        }

        const midQuestions = data.mid_questions || [];
        const endQuestions = data.end_questions || [];

        window.questions = formValue === "mid" ? midQuestions : endQuestions;

        if (!Array.isArray(window.questions) || window.questions.length === 0) {
            console.error("No valid questions found:", window.questions);
            alert("Questions are not loaded properly. Please try again.");
            return;
        }

        const questionsDiv = document.getElementById("questions");
        questionsDiv.innerHTML = ""; // Clear previous questions

        window.questions.forEach((question, index) => {
            const questionElement = document.createElement("div");
            questionElement.innerHTML = `
                <p><span class="question-number">${index + 1}.</span> ${question}</p>
                <div class="radio-group">
                    <input type="radio" name="question${index}" id="question${index}_verygood" value="Very Good" required>
                    <label for="question${index}_verygood">
                        <span>Very Good</span>
                    </label>
                    <input type="radio" name="question${index}" id="question${index}_good" value="Good">
                    <label for="question${index}_good">
                        <span>Good</span>
                    </label>
                    <input type="radio" name="question${index}" id="question${index}_average" value="Average">
                    <label for="question${index}_average">
                        <span>Average</span>
                    </label>
                    <input type="radio" name="question${index}" id="question${index}_bad" value="Bad">
                    <label for="question${index}_bad">
                        <span>Bad</span>
                    </label>
                </div>
            `;
            questionsDiv.appendChild(questionElement);
        });

        document.getElementById("questionsContainer").style.display = "block";
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to load questions.");
    }
}

function displayQuestions(questions) {
    const questionsDiv = document.getElementById("questions");
    questionsDiv.innerHTML = ""; // Clear previous questions

    if (!questions || questions.length === 0) {
        questionsDiv.innerHTML = "<p>No questions available.</p>";
        return;
    }

    questions.forEach((question, index) => {
        const questionElement = document.createElement("div");
        questionElement.classList.add("question-block"); // Added class for styling

        questionElement.innerHTML = `
            <p><span class="question-number">${index + 1}.</span> ${question}</p>
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="question${index}" value="Very Good" required>
                    <span class="custom-radio">Very Good</span>
                </label>
                <label class="radio-label">
                    <input type="radio" name="question${index}" value="Good">
                    <span class="custom-radio">Good</span>
                </label>
                <label class="radio-label">
                    <input type="radio" name="question${index}" value="Average">
                    <span class="custom-radio">Average</span>
                </label>
                <label class="radio-label">
                    <input type="radio" name="question${index}" value="Bad">
                    <span class="custom-radio">Bad</span>
                </label>
            </div>
        `;
        questionsDiv.appendChild(questionElement);
    });

    document.getElementById("questionsContainer").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    const yearSelect = document.getElementById("year");
    
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

document.getElementById("feedbackForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const registerNumber = document.getElementById("registerNumber").value.trim();
    const semester = document.getElementById("semester").value.trim();
    const branch = document.getElementById("branch").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const formTypeElement = document.getElementById("form");
    const yearElement = document.getElementById("year"); 

    // Ensure elements exist before accessing value
    const formType = formTypeElement ? formTypeElement.value.trim() : "";
    const year = yearElement ? yearElement.value.trim() : "";

    // Register Number Length Validation
    if (registerNumber.length !== 10) {
        alert("Enter valid register number");
        return;
    }

    // Collect ratings
    let ratings = [];
    let allRatingsSelected = true;

    if (window.questions && Array.isArray(window.questions)) {
        window.questions.forEach((_, index) => {
            const selectedRating = document.querySelector(`input[name="question${index}"]:checked`);
            if (selectedRating) {
                ratings.push(selectedRating.value);
            } else {
                allRatingsSelected = false;
            }
        });
    } else {
        console.error("❌ Questions array is not defined or invalid.");
        alert("Questions are not loaded properly. Please refresh the page.");
        return;
    }

    // Validate input fields
    if (!registerNumber || !semester || !branch || !subject || !formType || !year || !allRatingsSelected) {
        console.error("❌ Some fields are missing in the form.");
        alert("Please fill out all fields and provide ratings for all questions.");
        return;
    }

    try {
        // Send data to backend
        const response = await fetch("/submit-feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                register_number: registerNumber,
                semester,
                branch,
                subject,
                form: formType,
                year,
                ratings
            })
        });

        const result = await response.json();

        if (response.status === 400) {
            alert("⚠️ " + result.error); // Show "Feedback already submitted!" message
        } else {
            alert(result.message); // Show success message
            console.log("✅ Feedback submitted successfully:", result);
            document.getElementById("feedbackForm").reset(); // Reset the form
            document.getElementById("questionsContainer").style.display = "none"; // Hide questions
        }
    } catch (error) {
        console.error("❌ Error submitting feedback:", error);
        alert("Failed to submit feedback. Please try again.");
    }
});