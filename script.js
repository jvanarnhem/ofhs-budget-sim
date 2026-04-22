const professions = [
    { name: "Nurse", gross: 6500, happiness: 70 },
    { name: "Artist", gross: 3200, happiness: 100 },
    // Add 10 more...
];

let gameState = {
    currentBalance: 0,
    creditCardDebt: 0,
    monthlyHappiness: 100,
    currentMonth: 1
};

// The logic for the "Pro" features
function processMonth() {
    // 1. Subtract Fixed Costs
    // 2. Apply Interest to Credit Card Debt (if any)
    // 3. Roll a Random "Life Event"
    // 4. Update the UI
}
