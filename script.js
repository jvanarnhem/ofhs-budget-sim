// 1. Expanded Narrative Choice Pool
const socialScenarios = [
    { text: "It's your best friend's 21st birthday! The group is heading to a fancy steakhouse.", cost: 120, happy: 15, context: "Social" },
    { text: "Your car's 'Check Engine' light came on. The mechanic says it's a minor sensor.", cost: 250, happy: -10, context: "Maintenance" },
    { text: "A new expansion for your favorite video game just dropped. All your friends are playing.", cost: 70, happy: 12, context: "Hobby" },
    { text: "Your cousin is getting married in another state. Flights and hotel are expensive.", cost: 850, happy: 20, context: "Family" },
    { text: "Limited edition sneakers drop today. You've wanted these for months.", cost: 210, happy: 15, context: "Shopping" },
    { text: "You're feeling burnt out. A weekend 'Staycation' at a local spa sounds perfect.", cost: 300, happy: 25, context: "Self-Care" },
    { text: "A professional networking dinner. Might help your career long-term.", cost: 60, happy: 5, context: "Career" },
    { text: "The local fair is in town. Rides, junk food, and games!", cost: 80, happy: 10, context: "Social" }
];

let state = {
    month: 1, bank: 1500, debt: 0, happiness: 75,
    job: null, housing: 0, carPay: 0, 
    totalEarned: 0, totalSpent: 0
};

// ... (Previous Profession & Start Logic Remains the Same) ...

function renderChoices() {
    const container = document.getElementById('choices-container');
    container.innerHTML = '<h4>This Month\'s Dilemmas:</h4>';
    
    // Pick 3 random narrative scenarios
    const currentScenarios = socialScenarios.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    currentScenarios.forEach((s, i) => {
        container.innerHTML += `
            <div class="choice-item">
                <input type="checkbox" class="monthly-opt" 
                    data-cost="${s.cost}" 
                    data-happy="${s.happy}" 
                    data-text="${s.text}"
                    onchange="updateLedger()">
                <div class="scenario-text">
                    <p><strong>${s.context}:</strong> ${s.text}</p>
                    <span class="small">Cost: $${s.cost} | Mood: +${s.happy}</span>
                </div>
            </div>`;
    });
    updateLedger(); // Initialize ledger
}

function updateLedger() {
    const ledger = document.getElementById('ledger-details');
    let netIncome = state.job.gross * (1 - state.job.tax);
    let housing = state.housing;
    let car = state.carPay;
    let essentials = 400; // Food & Utilities
    
    // Calculate selected extras
    let extraCost = 0;
    let selectedItems = "";
    document.querySelectorAll('.monthly-opt:checked').forEach(el => {
        let cost = parseFloat(el.getAttribute('data-cost'));
        extraCost += cost;
        selectedItems += `<li>${el.getAttribute('data-text').substring(0, 20)}...: -$${cost}</li>`;
    });

    let interest = state.debt * 0.018;
    let totalOut = housing + car + essentials + extraCost + interest;
    let surplus = netIncome - totalOut;

    ledger.innerHTML = `
        <ul style="list-style: none; padding: 0;">
            <li style="color: green;"><strong>+ Net Income: $${Math.round(netIncome)}</strong></li>
            <li>- Rent/Housing: $${Math.round(housing)}</li>
            <li>- Car Payment: $${Math.round(car)}</li>
            <li>- Essentials: $400</li>
            ${selectedItems}
            ${interest > 0 ? `<li class="danger-text">- Debt Interest: $${Math.round(interest)}</li>` : ''}
            <hr>
            <li class="${surplus < 0 ? 'danger-text' : ''}">
                <strong>Monthly Surplus: $${Math.round(surplus)}</strong>
            </li>
        </ul>
    `;
}

// Update the "Next Month" button logic to give feedback
document.getElementById('next-month-btn').addEventListener('click', () => {
    let extraHappy = 0;
    let choiceCount = 0;

    document.querySelectorAll('.monthly-opt:checked').forEach(el => {
        extraHappy += parseFloat(el.getAttribute('data-happy'));
        choiceCount++;
    });

    // Provide instant feedback in the log
    if(choiceCount === 0) {
        log("You stayed home all month. Saved money, but felt a bit lonely.");
    } else {
        log(`You chose ${choiceCount} social activities. Mood improved by ${extraHappy} points!`);
    }

    // ... (rest of the math logic from previous version) ...
    
    // Refresh for next month
    if (state.month <= 24) {
        renderChoices();
        updateUI();
    }
});
