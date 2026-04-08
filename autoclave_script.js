const tools = [
    "stitches", "antibiotics", "sponge", "scalpel",
    "anesthetic", "clamp", "defibrillator", "pins",
    "splint", "antiseptic", "labkit", "ultrasound", "transfusion"
];

const displayNames = {
    "stitches": "Stitches", "antibiotics": "Antibiotics", "sponge": "Sponge",
    "scalpel": "Scalpel", "anaesthetic": "Anaesthetic", "clamp": "Clamp",
    "defibrillator": "Defibrillator", "pins": "Pins", "splint": "Splint",
    "antiseptic": "Antiseptic", "labkit": "Lab Kit", "ultrasound": "Ultrasound",
    "transfusion": "Transfusion"
};

// 1. Automatically generate all the inputs on the website
window.onload = function() {
    const invGrid = document.getElementById("inventoryGrid");
    const blackGrid = document.getElementById("blacklistGrid");
    const priceGrid = document.getElementById("pricesGrid");

    tools.forEach(t => {
        let label = t.charAt(0).toUpperCase() + t.slice(1);
        
        // Build Hybrid Inventory Inputs (Full-Width Slider + Number)
        invGrid.innerHTML += `
        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
            <label style="width: 100px; font-weight: bold;">${label}:</label>
            <input type="range" id="inv_slider_${t}" min="0" max="200" step="1" value="0" 
                style="flex-grow: 1; cursor: pointer;" 
                oninput="document.getElementById('inv_${t}').value = this.value">
            <input type="number" id="inv_${t}" value="0" min="0"
                style="width: 80px; padding: 5px;" 
                oninput="document.getElementById('inv_slider_${t}').value = this.value">
        </div>`;
        
        // Build Blacklist Checkboxes
        blackGrid.innerHTML += `<div><label><input type="checkbox" id="black_${t}"> ${label}</label></div>`;
        
        // Build Hybrid Pricing Inputs (Full-Width Slider + Text)
        priceGrid.innerHTML += `
        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
            <label style="width: 100px; font-weight: bold;">${label}:</label>
            <input type="range" id="slider_${t}" min="0" max="20" step="0.01" value="0" 
                style="flex-grow: 1; cursor: pointer;" 
                oninput="document.getElementById('price_${t}').value = this.value">
            <input type="text" id="price_${t}" value="0" 
                style="width: 80px; padding: 5px;" 
                oninput="document.getElementById('slider_${t}').value = parsePrice(this.value)">
        </div>`;
    });
};

// 2. Toggle between Manual and Packs using Buttons
function setMethod(method) {
    // Update the hidden input value
    document.getElementById("inputMethod").value = method;

    // Show/Hide the correct sections
    document.getElementById("manualSection").style.display = method === "manual" ? "block" : "none";
    document.getElementById("packsSection").style.display = method === "packs" ? "block" : "none";
    document.getElementById("packPricesSection").style.display = method === "packs" ? "block" : "none";

    // Visually update the buttons (making the active one darker)
    document.getElementById("btnManual").style.background = method === "manual" ? "#0056b3" : "#007bff";
    document.getElementById("btnPacks").style.background = method === "packs" ? "#0056b3" : "#007bff";
}

// 3. Helper to parse fractions (like "1/200")
function parsePrice(val) {
    if (typeof val === 'string' && val.includes("/")) {
        let parts = val.split("/");
        return parseFloat(parts[0]) / parseFloat(parts[1]) || 0;
    }
    return parseFloat(val) || 0;
}

// 4. The Main Engine
function runSimulation() {
    let userInventory = {};
    let restrictedTools = [];
    let prices = {};
    let method = document.getElementById("inputMethod").value;
    let packCount = parseInt(document.getElementById("packCount").value) || 0;

    // Collect all data from the HTML page
    tools.forEach(t => {
        if (method === "packs") {
            userInventory[t] = packCount * 20;
        } else {
            userInventory[t] = parseInt(document.getElementById(`inv_${t}`).value) || 0;
        }
        
        if (document.getElementById(`black_${t}`).checked) {
            restrictedTools.push(t);
        }
        
        prices[t] = parsePrice(document.getElementById(`price_${t}`).value);
    });

    let initialValue = tools.reduce((sum, t) => sum + (userInventory[t] * prices[t]), 0);

    // Run the Chain Reaction Loop
    let inventoryCopy = { ...userInventory };
    while (true) {
        let toolToAutoclave = tools.find(t => !restrictedTools.includes(t) && inventoryCopy[t] >= 20);
        if (!toolToAutoclave) break;

        let sets = Math.floor(inventoryCopy[toolToAutoclave] / 20);
        inventoryCopy[toolToAutoclave] -= sets * 20;

        tools.forEach(t => {
            if (t !== toolToAutoclave) inventoryCopy[t] += sets;
        });
    }

    // --- RENDER RESULTS ---
    document.getElementById("resultsSection").style.display = "block";
    
    // 1. Inventory HTML
    let invHTML = "<ul>";
    tools.forEach(t => {
        if (inventoryCopy[t] > 0) {
            let mark = restrictedTools.includes(t) ? " 🔒 [RESTRICTED]" : "";
            invHTML += `<li>${t.charAt(0).toUpperCase() + t.slice(1)}: ${inventoryCopy[t]}${mark}</li>`;
        }
    });
    if (method === "packs" && packCount > 0) {
        invHTML += `<li>Surg-E: ${packCount * 5} (From Packs)</li>`;
    }
    invHTML += "</ul>";
    document.getElementById("inventoryResult").innerHTML = invHTML;

    // 2. Profitability HTML
    let finalToolsValue = tools.reduce((sum, t) => sum + (inventoryCopy[t] * prices[t]), 0);
    let profitHTML = "";

    if (method === "packs") {
        let packCost = parsePrice(document.getElementById("packCost").value);
        let surgEPrice = parsePrice(document.getElementById("surgEPrice").value);
        
        let totalInvestment = packCount * packCost;
        let surgEValue = (packCount * 5) * surgEPrice;
        let totalRevenue = finalToolsValue + surgEValue;
        let profit = totalRevenue - totalInvestment;

        profitHTML += `<p>Total Investment: ${totalInvestment.toFixed(4)} WLs</p>`;
        profitHTML += `<p>Revenue from Tools: ${finalToolsValue.toFixed(4)} WLs</p>`;
        profitHTML += `<p>Revenue from Surg-E: ${surgEValue.toFixed(4)} WLs</p>`;
        profitHTML += `<p><strong>Total Revenue: ${totalRevenue.toFixed(4)} WLs</strong></p><hr>`;
        
        if (profit > 0) profitHTML += `<p class="profit">Result: PROFIT of ${profit.toFixed(4)} WLs 🎉</p>`;
        else if (profit < 0) profitHTML += `<p class="loss">Result: LOSS of ${Math.abs(profit).toFixed(4)} WLs 📉</p>`;
        else profitHTML += `<p>Result: BREAK EVEN (0 WLs) ⚖️</p>`;
        
    } else {
        let profit = finalToolsValue - initialValue;
        
        profitHTML += `<p>Initial Inventory Value: ${initialValue.toFixed(4)} WLs</p>`;
        profitHTML += `<p>Final Inventory Value: ${finalToolsValue.toFixed(4)} WLs</p><hr>`;
        
        if (profit > 0) profitHTML += `<p class="profit">Result: PROFIT of ${profit.toFixed(4)} WLs 🎉</p>`;
        else if (profit < 0) profitHTML += `<p class="loss">Result: LOSS of ${Math.abs(profit).toFixed(4)} WLs 📉</p>`;
        else profitHTML += `<p>Result: BREAK EVEN (0 WLs) ⚖️</p>`;
    }

    document.getElementById("profitResult").innerHTML = profitHTML;
}