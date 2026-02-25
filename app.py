from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# =========================
# Load Model Artifacts
# =========================
model = pickle.load(open("depression_model.pkl", "rb"))
scaler = pickle.load(open("scaler.pkl", "rb"))

# =========================
# Encoding Helpers
# =========================

#  FIXED SEMANTICS (IMPORTANT)
# Now YES = risk factor (1), NO = protective (0)
def yes_no(val):
    return 1 if val == "yes" else 0

def activity_map(val):
    return {"low": 0, "moderate": 1, "high": 2}[val]

def gender_map(val):
    return {"male": 0, "female": 1, "other": 2}[val]

def education_map(val):
    return {"undergraduate": 0, "postgraduate": 1, "phd": 2}[val]

def university_map(val):
    return {
        "public": 0,
        "private": 1,
        "technical": 2
    }[val]

def income_map(val):
    return {
        "low": 0,
        "medium": 1,
        "high": 2,
        "very-high": 3
    }[val]

def living_map(val):
    return {
        "urban": 0,
        "suburban": 1,
        "rural": 2
    }[val]

# =========================
# Routes
# =========================
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # =========================
        # Build Input Vector
        # =========================
        input_vector = [
            gender_map(data["gender"]),
            int(data["age"]),
            education_map(data["education"]),
            university_map(data["university"]),
            income_map(data["income"]),
            living_map(data["living"]),
            yes_no(data["anxious"]),
            yes_no(data["lonely"]),
            yes_no(data["suicidal"]),
            yes_no(data["conflicts"]),
            activity_map(data["activity"]),
            yes_no(data["sleep"]),
            yes_no(data["smoking"])
        ]

        input_array = np.array(input_vector).reshape(1, -1)

        # Scale features
        input_scaled = scaler.transform(input_array)

        # =========================
        # Prediction
        # =========================
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0][1]

        # =========================
        # Probability Scaling (UX FIX)
        # =========================
        risk_score = round((probability ** 0.4) * 100, 2)

        return jsonify({
            "prediction": int(prediction),
            "risk_score": risk_score
        })

    except Exception as e:
        print(" Prediction Error:", e)
        return jsonify({
            "error": "Prediction failed",
            "details": str(e)
        }), 400

# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
