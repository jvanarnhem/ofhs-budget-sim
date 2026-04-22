const professions = [
    { name: "Public School Teacher", gross: 4200, tax: 0.18 },
    { name: "Registered Nurse", gross: 6500, tax: 0.22 },
    { name: "Software Engineer", gross: 9200, tax: 0.28 },
    { name: "Electrician", gross: 5500, tax: 0.20 },
    { name: "Social Worker", gross: 4000, tax: 0.15 },
    { name: "Graphic Designer", gross: 4800, tax: 0.18 },
    { name: "Retail Manager", gross: 3600, tax: 0.12 },
    { name: "Chef de Cuisine", gross: 5000, tax: 0.20 },
    { name: "Dental Hygienist", gross: 6000, tax: 0.22 },
    { name: "Police Officer", gross: 5800, tax: 0.20 },
    { name: "Barista/Freelancer", gross: 2800, tax: 0.10 },
    { name: "Accountant", gross: 6800, tax: 0.24 }
];

const socialScenarios = [
    { text: "Best friend's 21st Birthday: Fancy Dinner & Drinks.", cost: 150, happy: 15 },
    { text: "Concert of a lifetime! Front row seats available.", cost: 300, happy: 25 },
    { text: "New phone needed! Your screen is completely shattered.", cost: 800, happy: 10 },
    { text: "Weekend road trip to the coast with friends.", cost: 400, happy: 20 },
    { text: "Designer clothing sale: 50% off retail prices.", cost: 200, happy: 12 },
    { text: "Streaming Subs & Gaming: Buy the 'Ultimate Edition'.", cost: 90, happy: 8 },
    { text: "Car Repair: That weird noise finally broke something.", cost: 500, happy: -10 },
    { text: "Professional Development: A weekend workshop.", cost: 120, happy: 5 },
    { text: "Gym Membership & New Workout Gear.", cost: 130, happy: 12 },
    { text: "Family Visit: Buying gifts and a nice dinner.", cost: 250, happy: 15 }
];

let state = {
    month: 1, bank: 2000, debt: 0, happiness: 80,
    job: null, housing: 0, carPay: 0, 
    totalEarned: 0, totalSpent: 0
};

// Setup Profession Dropdown
const careerSel = document.getElementById('career-select');
professions.forEach((p, i) => {
    let opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${p.name} ($${p.gross}/mo)`;
    careerSel.appendChild(opt);
});

// Start Simulation
document.getElementById('start-btn').addEventListener('click', () => {
    state.job = professions[careerSel.value];
    state.housing = parseFloat(document.getElementById('housing-select').value);
    
    // Amortization: 5% interest, 5 years (60 mo)
    let p = parseFloat(document.getElementById('car-principal').value);
    let r = 0.05 / 12;
    state.carPay = p > 0 ? (p * (r * Math.pow(1+r, 60)) / (Math.pow(1+r, 60) - 1)) : 0;

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('sim-screen').classList.remove('hidden');
    renderScenarios();
    updateUI();
});

function renderScenarios() {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';
    // Shuffle and pick 3
    const choices = socialScenarios.sort(() => 0.5 - Math.random()).slice(0, 3);
    choices.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'choice-item';
        div.innerHTML = `
            <input type="checkbox" class="monthly-opt" data-cost="${s.cost}" data-happy="${s.happy}" onchange="updateLedger()">
            <div><strong>${s.text}</strong><br><span class="small">Cost: $${s.cost} | Mood: +${s.happy}</span></div>
        `;
        div.onclick = (e) => {
            if (e.target.type !== 'checkbox') {
                const cb = div.querySelector('input');
                cb.checked = !cb.checked;
                updateLedger();
            }
        };
        container.appendChild(div);
    });
    updateLedger();
}

function updateLedger() {
    let net = state.job.gross * (1 - state.job.tax);
    let housing = state.housing;
    let car = state.carPay;
    let essentials = 450; // Food, Heat, Phone
    let interest = state.debt * 0.02; // 24% APR divided by 12
    
    let extraCost = 0;
    document.querySelectorAll('.monthly-opt:checked').forEach(cb => {
        extraCost += parseFloat(cb.getAttribute('data-cost'));
    });

    let totalOut = housing + car + essentials + extraCost + interest;
    let surplus = net - totalOut;

    document.getElementById('ledger-details').innerHTML = `
        <ul style="list-style:none; padding:0;">
            <li style="color:green">+ Monthly Pay: $${Math.round(net)}</li>
            <li>- Rent/Housing: $${Math.round(housing)}</li>
            <li>- Car Payment: $${Math.round(car)}</li>
            <li>- Food/Utilities: $${essentials}</li>
            <li>- Extras: $${Math.round(extraCost)}</li>
            ${interest > 0 ? `<li class="danger-text">- Debt Interest: $${Math.round(interest)}</li>` : ''}
            <hr>
            <li class="${surplus < 0 ? 'danger-text' : ''}"><strong>SURPLUS: $${Math.round(surplus)}</strong></li>
        </ul>
    `;
}

function updateUI() {
    document.getElementById('bank-balance').textContent = `$${Math.round(state.bank)}`;
    document.getElementById('debt-balance').textContent = `$${Math.round(state.debt)}`;
    document.getElementById('happiness-bar').style.width = `${state.happiness}%`;
    document.getElementById('month-display').textContent = `Month ${state.month} / 24`;
    document.getElementById('income-display').textContent = `$${Math.round(state.job.gross * (1 - state.job.tax))}`;
}

document.getElementById('next-month-btn').addEventListener('click', () => {
    let net = state.job.gross * (1 - state.job.tax);
    let housing = state.housing;
    let car = state.carPay;
    let essentials = 450;
    let interest = state.debt * 0.02;
    
    let extraCost = 0;
    let extraHappy = 0;
    document.querySelectorAll('.monthly-opt:checked').forEach(cb => {
        extraCost += parseFloat(cb.getAttribute('data-cost'));
        extraHappy += parseFloat(cb.getAttribute('data-happy'));
    });

    // Final Math
    state.bank += net;
    state.bank -= (housing + car + essentials + extraCost + interest);
    state.happiness += (extraHappy - 6); // -6 is the "Monthly Grind" cost

    // Debt logic
    if (state.bank < 0) {
        state.debt += Math.abs(state.bank);
        state.bank = 0;
        log("Insufficient funds! The deficit was added to your credit card.");
    }
    
    if (state.debt > 0 && state.bank > 0) {
        // Automatically pay off debt if we have cash
        let payment = Math.min(state.bank, state.debt);
        state.bank -= payment;
        state.debt -= payment;
        log(`Paid $${Math.round(payment)} toward credit card debt.`);
    }

    state.happiness = Math.max(0, Math.min(100, state.happiness));
    state.totalEarned += net;
    
    if (state.month >= 24) {
        showResults();
    } else {
        state.month++;
        log(`Month ${state.month-1} paid and processed.`);
        renderScenarios();
        updateUI();
    }
});

function log(m) {
    const logBox = document.getElementById('event-log');
    logBox.innerHTML = `> ${m}<br>` + logBox.innerHTML;
}

function showResults() {
    document.getElementById('sim-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    let netWorth = state.bank - state.debt;
    let finalRating = "Survivor";
    if (netWorth > 20000 && state.happiness > 70) finalRating = "Life Master";
    else if (netWorth > 5000) finalRating = "Stable Professional";
    else if (state.debt > 5000) finalRating = "Debt Trapped";

    document.getElementById('final-stats').innerHTML = `
        <h2>Final Rating: ${finalRating}</h2>
        <p>Final Net Worth: $${Math.round(netWorth)}</p>
        <p>End Happiness: ${Math.round(state.happiness)}%</p>
        <p>Total Income Earned: $${Math.round(state.totalEarned)}</p>
        <hr>
        <p class="small">QR Reflection: Did your career choice match your lifestyle? <br>How much did interest impact your final balance?</p>
    `;
}
