document.addEventListener('DOMContentLoaded', () => {
    const homeView = document.getElementById('home-view');
    const dashboardView = document.getElementById('dashboard-view');
    const launchBtn = document.getElementById('launch-btn');
    const navHome = document.getElementById('nav-home');
    const navAbout = document.getElementById('nav-about');
    const navLogout = document.getElementById('nav-logout');
    const screeningForm = document.getElementById('screening-form');
    const resultCard = document.getElementById('result-card');
    const closeResult = document.getElementById('close-result');
    const predictBtn = document.getElementById('predict-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');

    function switchView(view) {
        if (view === 'dashboard') {
            homeView.classList.remove('active');
            dashboardView.classList.add('active');
        } else if (view === 'home') {
            dashboardView.classList.remove('active');
            homeView.classList.add('active');
        }
    }

    launchBtn.addEventListener('click', () => {
        switchView('dashboard');
    });

    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
    });

    navAbout.addEventListener('click', (e) => {
        e.preventDefault();
        alert('About: This is a research-based mental health screening interface for university students using AI & Explainable Intelligence.');
    });

    navLogout.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('home');
        screeningForm.reset();
        resultCard.classList.add('hidden');
    });

    closeResult.addEventListener('click', () => {
        resultCard.classList.add('hidden');
    });

    predictBtn.addEventListener("click", async () => {

    // Validate required fields
    if (!screeningForm.checkValidity()) {
        screeningForm.reportValidity();
        return;
    }

    const formData = {
        gender: document.getElementById("gender").value,
        age: parseInt(document.getElementById("age").value),
        education: document.getElementById("education").value,
        university: document.getElementById("university").value,
        income: document.getElementById("income").value,
        living: document.getElementById("living").value,
        anxious: document.querySelector('input[name="anxious"]:checked').value,
        lonely: document.querySelector('input[name="lonely"]:checked').value,
        suicidal: document.querySelector('input[name="suicidal"]:checked').value,
        conflicts: document.querySelector('input[name="conflicts"]:checked').value,
        activity: document.querySelector('input[name="activity"]:checked').value,
        sleep: document.querySelector('input[name="sleep"]:checked').value,
        smoking: document.querySelector('input[name="smoking"]:checked').value
    };

    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");
    predictBtn.disabled = true;

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log("SERVER RESPONSE:", result); 
        displayResults(result.risk_score ?? 0);

    } catch (err) {
        console.error(err);
        alert("Prediction failed");

    } finally {
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
        predictBtn.disabled = false;
    }
});

   
    function displayResults(score) {
        const predictionValue = document.getElementById('prediction-value');
        const riskBadge = document.getElementById('risk-badge');
        const progressFill = document.getElementById('progress-fill');
        const scoreValue = document.getElementById('score-value');

        let riskLevel;
        let prediction;

        if (score < 30) {
            riskLevel = 'low';
            prediction = 'No Depression Detected';
            riskBadge.textContent = 'Low Risk';
        } else if (score < 60) {
            riskLevel = 'moderate';
            prediction = 'Mild Depression Detected';
            riskBadge.textContent = 'Moderate Risk';
        } else {
            riskLevel = 'high';
            prediction = 'Depression Detected';
            riskBadge.textContent = 'High Risk';
        }

        predictionValue.textContent = prediction;
        riskBadge.className = `risk-badge ${riskLevel}`;
        scoreValue.textContent = `${score}%`;

        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = `${score}%`;
        }, 100);

        resultCard.classList.remove('hidden');

        setTimeout(() => {
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
    }

    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input && input.type === 'radio') {
                input.checked = true;
            }
        });
    });
});
