const tools = [
    "ai_brain", "cyborg_diplomat", "galactibolt", "gigablaster",
    "growton_torpedo", "hypershields", "quadriscanner", "space_meds",
    "star_supplies", "stellar_documents", "tactical_drone", "teleporter_charge"
];

// 1. The Dictionary: Maps the internal ID to the pretty display name
const displayNames = {
    "ai_brain": "AI Brain",
    "cyborg_diplomat": "Cyborg Diplomat",
    "galactibolt": "Galactibolt",
    "gigablaster": "Gigablaster",
    "growton_torpedo": "Growton Torpedo",
    "hypershields": "Hypershields",
    "quadriscanner": "Quadriscanner",
    "space_meds": "Space Meds",
    "star_supplies": "Star Supplies",
    "stellar_documents": "Stellar Documents",
    "tactical_drone": "Tactical Drone",
    "teleporter_charge": "Teleporter Charge"
};

// 2. Automatically generate all the inputs on the website
window.onload = function() {
    const invGrid = document.getElementById("inventoryGrid");
    const blackGrid = document.getElementById("blacklistGrid");
    const priceGrid = document.getElementById("pricesGrid");

    tools.forEach(t => {
        // We pull the perfect name right out of our dictionary
        let label = displayNames[t]; 
        
        // Build Hybrid Inventory Inputs
        invGrid.innerHTML += `
        <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
            <label style="width: 160px; font-weight: bold;">${label}:</label>
            <input type="range" id="inv_slider_${t}" min="0" max="200" step="1" value="0" 
                style="flex-grow: 1; cursor: pointer;" 
                oninput="document.getElementById('inv_${t}').value = this.value">
            <input type="number" id="inv_${t}" value="0" min="0"
                style="width: 80px; padding: 5px;" 
                oninput="document.getElementById('inv_slider_${t}').value = this.value">
        </div>`;
        
        // Build Blacklist Checkboxes
        blackGrid.innerHTML += `<div><label><input type="checkbox" id="black_${t}"> ${label}</label></div>`;
        
        // Build Hybrid Pricing Inputs
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

// 3. Toggle between Manual and Packs
function setMethod(method) {
    document.getElementById("inputMethod").value = method;
    document.getElementById("manualSection").style.display = method === "manual" ? "block" : "none";
    document.getElementById("packsSection").style.display = method === "packs" ? "block" : "none";
    document.getElementById("packPricesSection").style.display = method === "packs" ? "block" : "none";

    document.getElementById("btnManual").style.background = method === "manual" ? "#0056b3" : "#007bff";
    document.getElementById("btnPacks").style.background = method === "packs" ? "#0056b3" : "#007bff";
}

// 4. Helper to parse fractions
function parsePrice(val) {
    if (typeof val === 'string' && val.includes("/")) {
        let parts = val.split("/");
        return parseFloat(parts[0]) / parseFloat(parts[1]) || 0;
    }
    return parseFloat(val) || 0;
}

// 5. The Main Engine
function runSimulation() {
    let userInventory = {};
    let restrictedTools = [];
    let prices = {};
    let method = document.getElementById("inputMethod").value;
    let packCount = parseInt(document.getElementById("packCount").value) || 0;

    tools.forEach(t => {
        if (method === "packs") {
            userInventory[t] = packCount * 5;
        } else {
            userInventory[t] = parseInt(document.getElementById(`inv_${t}`).value) || 0;
        }
        
        if (document.getElementById(`black_${t}`).checked) {
            restrictedTools.push(t);
        }
        
        prices[t] = parsePrice(document.getElementById(`price_${t}`).value);
    });

    let initialValue = tools.reduce((sum, t) => sum + (userInventory[t] * prices[t]), 0);

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

    document.getElementById("resultsSection").style.display = "block";
    
    // Updated Inventory HTML to use the dictionary
    let invHTML = "<ul>";
    tools.forEach(t => {
        if (inventoryCopy[t] > 0) {
            let mark = restrictedTools.includes(t) ? " 🔒 [RESTRICTED]" : "";
            invHTML += `<li>${displayNames[t]}: ${inventoryCopy[t]}${mark}</li>`;
        }
    });
    if (method === "packs" && packCount > 0) {
        invHTML += `<li>Star Fuel: ${packCount * 25} (From Packs)</li>`;
    }
    invHTML += "</ul>";
    document.getElementById("inventoryResult").innerHTML = invHTML;

    // Profitability HTML
    let finalToolsValue = tools.reduce((sum, t) => sum + (inventoryCopy[t] * prices[t]), 0);
    let profitHTML = "";

    if (method === "packs") {
        let packCost = parsePrice(document.getElementById("packCost").value);
        let starFuelPrice = parsePrice(document.getElementById("starFuelPrice").value); 
        
        let totalInvestment = packCount * packCost;
        let starFuelValue = (packCount * 25) * starFuelPrice;
        let totalRevenue = finalToolsValue + starFuelValue;
        let profit = totalRevenue - totalInvestment;

        profitHTML += `<p>Total Investment: ${totalInvestment.toFixed(4)} WLs</p>`;
        profitHTML += `<p>Revenue from Tools: ${finalToolsValue.toFixed(4)} WLs</p>`;
        profitHTML += `<p>Revenue from Star Fuel: ${starFuelValue.toFixed(4)} WLs</p>`;
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