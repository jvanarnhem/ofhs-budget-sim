const professions = [
    { name: "Teacher", gross: 4200, tax: 0.18 },
    { name: "Software Engineer", gross: 8500, tax: 0.28 },
    { name: "Nurse", gross: 6200, tax: 0.22 },
    { name: "Barista", gross: 2600, tax: 0.10 },
    { name: "Electrician", gross: 5500, tax: 0.20 },
    { name: "Designer", gross: 4800, tax: 0.18 },
    { name: "Retail Manager", gross: 3800, tax: 0.15 },
    { name: "Chef", gross: 4000, tax: 0.15 },
    { name: "Analyst", gross: 7000, tax: 0.25 },
    { name: "Social Worker", gross: 4100, tax: 0.15 },
    { name: "Mechanic", gross: 5200, tax: 0.20 },
    { name: "Artist", gross: 3000, tax: 0.12 }
];

const extraChoices = [
    { id: 'vacation', text: "Weekend Trip", cost: 600, happy: 20 },
    { id: 'clothes', text: "New Wardrobe Pieces", cost: 150, happy: 8 },
    { id: 'concert', text: "Concert Tickets", cost: 200, happy: 12 },
    { id: 'dining', text: "Fancy Dinner Out", cost: 100, happy: 5 },
    { id: 'gaming', text: "New Video Game/Sub", cost: 70, happy: 6 },
    { id: 'gym', text: "Premium Gym Class", cost: 80, happy: 7 }
];

let state = {
    month: 1, bank: 1500, debt: 0, happiness: 75,
    job: null, housing: 0, carPay: 0, 
    totalEarned: 0, totalSpent: 0, history: []
};

// Initialize Profession List
const careerSel = document.getElementById('career-select');
professions.forEach((p, i) => {
    let opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.name;
    careerSel.appendChild(opt);
});

// Start Game
document.getElementById('start-btn').addEventListener('click', () => {
    state.job = professions[careerSel.value];
    state.housing = parseFloat(document.getElementById('housing-select').value);
    
    let principal = parseFloat(document.getElementById('car-principal').value);
    state.carPay = principal > 0 ? (principal * (0.00375 * Math.pow(1.00375, 60)) / (Math.pow(1.00375, 60) - 1)) : 0;

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('sim-screen').classList.remove('hidden');
    state.history.push({ bank: state.bank, happy: state.happiness });
    renderChoices();
    updateUI();
});

function renderChoices() {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    // Pick 4 random options each month
    const shuffled = extraChoices.sort(() => 0.5 - Math.random()).slice(0, 4);
    shuffled.forEach(choice => {
        container.innerHTML += `
            <div class="choice-item">
                <input type="checkbox" class="monthly-opt" data-cost="${choice.cost}" data-happy="${choice.happy}">
                <div><strong>${choice.text}</strong><br><span class="small">$${choice.cost} | +${choice.happy} Mood</span></div>
            </div>`;
    });
}

function updateUI() {
    document.getElementById('bank-balance').textContent = `$${Math.round(state.bank)}`;
    document.getElementById('debt-balance').textContent = `$${Math.round(state.debt)}`;
    document.getElementById('happiness-bar').style.width = `${state.happiness}%`;
    document.getElementById('month-display').textContent = `Month ${state.month} / 24`;
    
    let net = state.job.gross * (1 - state.job.tax);
    document.getElementById('income-display').textContent = `$${Math.round(net)}`;

    if (state.happiness < 30) document.getElementById('happiness-bar').style.background = 'var(--danger)';
    else document.getElementById('happiness-bar').style.background = 'var(--success)';
}

document.getElementById('next-month-btn').addEventListener('click', () => {
    if (state.month >= 24) return;

    let netIncome = state.job.gross * (1 - state.job.tax);
    let monthlyBills = state.housing + state.carPay + 400; // 400 = base food/utilities
    
    // Calculate chosen extras
    let extraCost = 0;
    let extraHappy = 0;
    document.querySelectorAll('.monthly-opt:checked').forEach(el => {
        extraCost += parseFloat(el.getAttribute('data-cost'));
        extraHappy += parseFloat(el.getAttribute('data-happy'));
    });

    // Financial Logic
    state.bank += netIncome;
    state.bank -= (monthlyBills + extraCost);
    state.totalEarned += netIncome;
    state.totalSpent += (monthlyBills + extraCost);

    // Debt & Interest
    if (state.bank < 0) {
        state.debt += Math.abs(state.bank);
        state.bank = 0;
    }
    
    if (state.debt > 0) {
        state.debt *= 1.018; // 1.8% monthly interest
        state.happiness -= 8; // Debt Stress Penalty
        log(`<span class="danger-text">Interest added to debt. Stress is rising.</span>`);
    }

    // Happiness Logic
    state.happiness += extraHappy;
    state.happiness -= 5; // Natural monthly "grind" fatigue
    
    // Random Life Event
    if (Math.random() > 0.7) {
        const events = [
            { t: "Emergency Room Visit", c: 500, h: -15 },
            { t: "Found $50 in laundry", c: -50, h: 5 },
            { t: "Car Repair", c: 300, h: -10 }
        ];
        let e = events[Math.floor(Math.random() * events.length)];
        state.bank -= e.c;
        state.happiness += e.h;
        log(`EVENT: ${e.t} (-$${e.c})`);
    }

    state.happiness = Math.max(0, Math.min(100, state.happiness));
    state.month++;

    if (state.month > 24) {
        showFinalResults();
    } else {
        renderChoices();
        updateUI();
        log(`Month ${state.month-1} complete.`);
    }
});

function log(m) {
    const logBox = document.getElementById('event-log');
    logBox.innerHTML = `> ${m}<br>` + logBox.innerHTML;
}

function showFinalResults() {
    document.getElementById('sim-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    const score = (state.bank - state.debt) + (state.happiness * 100);
    let rank = "Struggling";
    if (score > 10000) rank = "Financial Master";
    else if (score > 5000) rank = "Stable & Happy";

    document.getElementById('final-stats').innerHTML = `
        <h3>Rank: ${rank}</h3>
        <p>Total Savings: $${Math.round(state.bank)}</p>
        <p>Total Debt: $${Math.round(state.debt)}</p>
        <p>Final Happiness: ${state.happiness}%</p>
        <p>Net Worth: $${Math.round(state.bank - state.debt)}</p>
    `;
}
