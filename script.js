// Simple frontend prototype 
// Later I will replace the local calculation with a real API call.

const form = document.getElementById("diet-form");
const errorElement = document.getElementById("form-error");
const resultSection = document.getElementById("result-section");
const resultContent = document.getElementById("result-content");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorElement.textContent = "";

    const ageBand = form.ageBand.value;
    const heightCm = Number(form.heightCm.value);
    const weightKg = Number(form.weightKg.value);
    const activityLevel = form.activityLevel.value;
    const goal = form.goal.value;
    const accepted = form.acceptTerms.checked;

    if (!accepted) {
        errorElement.textContent =
            "You must accept the Terms and Conditions before continuing.";
        return;
    }

    if (!ageBand || !heightCm || !weightKg || !activityLevel || !goal) {
        errorElement.textContent =
            "Please complete all fields before requesting a recommendation.";
        return;
    }

    try {
        const recommendation = calculateLocalRecommendation({
            ageBand,
            heightCm,
            weightKg,
            activityLevel,
            goal,
        });

        displayRecommendation(recommendation);
    } catch (err) {
        console.error(err);
        errorElement.textContent =
            "Sorry, something went wrong while generating your recommendation.";
    }
});

function calculateLocalRecommendation({
    ageBand,
    heightCm,
    weightKg,
    activityLevel,
    goal,
}) {
    // Very rough estimate inspired by common BMR-style ideas,
    // deliberately simplified for this student prototype.

    let base = 10 * weightKg + 6.25 * heightCm - 500;

    if (ageBand === "18-29") base += 80;
    else if (ageBand === "30-39") base += 40;
    else if (ageBand === "40-49") base += 0;
    else if (ageBand === "50-59") base -= 40;
    else if (ageBand === "60+") base -= 80;

    const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
    };

    base *= activityFactors[activityLevel] || 1.2;

    if (goal === "lose") base -= 300;
    if (goal === "gain") base += 300;

    const lower = Math.round(base - 100);
    const upper = Math.round(base + 100);

    const carbsCalories = 0.5 * base;
    const proteinCalories = 0.2 * base;
    const fatCalories = 0.3 * base;

    const gramsCarbs = Math.round(carbsCalories / 4);
    const gramsProtein = Math.round(proteinCalories / 4);
    const gramsFat = Math.round(fatCalories / 9);

    return {
        calorieRange: { lower, upper },
        macros: {
            carbs: gramsCarbs,
            protein: gramsProtein,
            fat: gramsFat,
        },
        notes:
            "This is a rough, non-medical estimate for general wellbeing. " +
            "For personal medical or dietary advice, please consult a qualified professional.",
    };
}

function displayRecommendation(rec) {
    const { calorieRange, macros, notes } = rec;

    resultContent.innerHTML = `
        <p><strong>Estimated daily energy:</strong> ${calorieRange.lower}–${calorieRange.upper} kcal</p>
        <p><strong>Approximate macronutrients (per day):</strong></p>
        <ul>
            <li>Carbohydrates: <strong>${macros.carbs} g</strong></li>
            <li>Protein: <strong>${macros.protein} g</strong></li>
            <li>Fat: <strong>${macros.fat} g</strong></li>
        </ul>
        <p class="small-text">${notes}</p>
    `;

    resultSection.hidden = false;
}