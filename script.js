const professions = [
    { name: "Registered Nurse", gross: 6500, tax: 0.22 },
    { name: "Public School Teacher", gross: 4200, tax: 0.18 },
    { name: "Electrician", gross: 5200, tax: 0.20 },
    { name: "Software Engineer", gross: 9500, tax: 0.28 },
    { name: "Graphic Designer", gross: 4000, tax: 0.15 },
    { name: "Retail Manager", gross: 3500, tax: 0.12 },
    { name: "Social Worker", gross: 3800, tax: 0.15 },
    { name: "Construction Foreman", gross: 5800, tax: 0.20 },
    { name: "Accountant", gross: 6200, tax: 0.22 },
    { name: "Barista / Freelancer", gross: 2800, tax: 0.10 }
];

let state = {
    month: 1,
    bank: 2000, // Starting savings
    debt: 0,
    happiness: 80,
    job: null,
    housing: 0,
    carPayment: 0,
    fixedCosts: 250 // Utilities, Phone, etc.
};

// UI Elements
const careerSelect = document.getElementById('career-select');
const eventLog = document.getElementById('event-log');

// Initialization
professions.forEach((p, index) => {
    let opt = document.createElement('option');
    opt.value = index;
    opt.textContent = `${p.name} ($${p.gross}/mo)`;
    careerSelect.appendChild(opt);
});

// Amortization Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
function calculateMonthlyPayment(principal, annualRate, years) {
    if (principal <= 100) return principal; // Handling bus pass/cash
    let i = annualRate / 12;
    let n = years * 12;
    let payment = principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return payment;
}

document.getElementById('start-btn').addEventListener('click', () => {
    const pIndex = careerSelect.value;
    state.job = professions[pIndex];
    state.housing = parseFloat(document.getElementById('housing-select').value);
    
    // Calculate Car Amortization (4.5% interest over 5 years)
    let carPrincipal = parseFloat(document.getElementById('car-select').value);
    state.carPayment = calculateMonthlyPayment(carPrincipal, 0.045, 5);

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('sim-screen').classList.remove('hidden');
    log(`Game Started. Career: ${state.job.name}.`);
    updateUI();
});

function log(msg) {
    eventLog.innerHTML = `> Month ${state.month}: ${msg}<br>` + eventLog.innerHTML;
}

function updateUI() {
    document.getElementById('bank-balance').textContent = `$${state.bank.toFixed(2)}`;
    document.getElementById('debt-balance').textContent = `$${state.debt.toFixed(2)}`;
    document.getElementById('happiness-bar').style.width = `${state.happiness}%`;
    document.getElementById('month-display').textContent = `Month ${state.month}`;
}

document.getElementById('next-month-btn').addEventListener('click', () => {
    // 1. Income
    let netIncome = state.job.gross * (1 - state.job.tax);
    state.bank += netIncome;

    // 2. Expenses
    let food = parseFloat(document.getElementById('food-choice').value);
    let totalOut = state.housing + state.carPayment + state.fixedCosts + food;
    state.bank -= totalOut;

    // 3. Debt Logic (Compound Interest)
    if (state.bank < 0) {
        state.debt += Math.abs(state.bank);
        state.bank = 0;
        log(`<span class="danger">Overdraft! Debt increased to $${state.debt.toFixed(2)}</span>`);
    }

    if (state.debt > 0) {
        state.debt *= 1.02; // 2% Monthly Interest (approx 24% APR)
        state.happiness -= 5;
    }

    // 4. Random Events
    const events = [
        { text: "Your car needs a new battery. Pay $150.", impact: -150, h: -5 },
        { text: "Birthday money from Grandma! +$100.", impact: 100, h: 10 },
        { text: "Steam Sale! You bought 5 games you won't play. -$60.", impact: -60, h: 15 },
        { text: "Minor illness. Doctor co-pay: -$50.", impact: -50, h: -10 }
    ];
    let ev = events[Math.floor(Math.random() * events.length)];
    state.bank += ev.impact;
    state.happiness += ev.h;
    log(ev.text);

    // Caps
    state.happiness = Math.max(0, Math.min(100, state.happiness));
    state.month++;
    updateUI();
});
