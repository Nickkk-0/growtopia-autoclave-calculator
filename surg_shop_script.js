const tools = [
    "stitches", "antibiotics", "sponge", "scalpel",
    "anaesthetic", "clamp", "defibrillator", "pins",
    "splint", "antiseptic", "labkit", "ultrasound", "transfusion"
];

const displayNames = {
    "stitches": "Stitches", "antibiotics": "Antibiotics", "sponge": "Sponge",
    "scalpel": "Scalpel", "anaesthetic": "Anaesthetic", "clamp": "Clamp",
    "defibrillator": "Defibrillator", "pins": "Pins", "splint": "Splint",
    "antiseptic": "Antiseptic", "labkit": "Lab Kit", "ultrasound": "Ultrasound",
    "transfusion": "Transfusion"
};

// 1. Generate the Pricing Sliders
window.onload = function() {
    const priceGrid = document.getElementById("pricesGrid");

    tools.forEach(t => {
        let label = displayNames[t]; 
        priceGrid.innerHTML += `
        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
            <label style="width: 160px; font-weight: bold;">${label}:</label>
            <input type="range" id="slider_${t}" min="0" max="20" step="0.01" value="0" 
                style="flex-grow: 1; cursor: pointer;" 
                oninput="document.getElementById('price_${t}').value = this.value">
            <input type="text" id="price_${t}" value="0" 
                style="width: 80px; padding: 5px;" 
                oninput="document.getElementById('slider_${t}').value = parsePrice(this.value)">
        </div>`;
    });
};

// 2. Parse Fractions
function parsePrice(val) {
    if (typeof val === 'string' && val.includes("/")) {
        let parts = val.split("/");
        return parseFloat(parts[0]) / parseFloat(parts[1]) || 0;
    }
    return parseFloat(val) || 0;
}

// 3. Calculate Direct Shop Profit
function calculateShop() {
    let packCount = parseInt(document.getElementById("packCount").value) || 0;
    let packCost = parsePrice(document.getElementById("packCost").value);
    let surgEPrice = parsePrice(document.getElementById("surgEPrice").value);

    let toolsRevenue = 0;
    
    // Add up the value of selling 20 of each tool per pack
    tools.forEach(t => {
        let price = parsePrice(document.getElementById(`price_${t}`).value);
        toolsRevenue += (packCount * 20) * price;
    });

    let totalInvestment = packCount * packCost;
    let surgERevenue = (packCount * 5) * surgEPrice;
    let totalRevenue = toolsRevenue + surgERevenue;
    let profit = totalRevenue - totalInvestment;

    // Render Results
    document.getElementById("resultsSection").style.display = "block";
    let profitHTML = "";

    profitHTML += `<p>Total Investment: ${totalInvestment.toFixed(4)} WLs</p>`;
    profitHTML += `<p>Revenue from Tools: ${toolsRevenue.toFixed(4)} WLs</p>`;
    profitHTML += `<p>Revenue from Surg-E: ${surgERevenue.toFixed(4)} WLs</p>`;
    profitHTML += `<p><strong>Total Revenue: ${totalRevenue.toFixed(4)} WLs</strong></p><hr>`;
    
    if (profit > 0) profitHTML += `<p class="profit">Result: PROFIT of ${profit.toFixed(4)} WLs 🎉</p>`;
    else if (profit < 0) profitHTML += `<p class="loss">Result: LOSS of ${Math.abs(profit).toFixed(4)} WLs 📉</p>`;
    else profitHTML += `<p>Result: BREAK EVEN (0 WLs) ⚖️</p>`;

    document.getElementById("profitResult").innerHTML = profitHTML;
}