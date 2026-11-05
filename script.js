const inputValue = document.getElementById('inputValue');
const inputBase = document.getElementById('inputBase');
const errorMsg = document.getElementById('errorMsg');

const resBinary = document.getElementById('resBinary');
const resDecimal = document.getElementById('resDecimal');
const resOctal = document.getElementById('resOctal');
const resHex = document.getElementById('resHex');

const twosComplementText = document.getElementById('twosComplementText');
const breakdownContent = document.getElementById('breakdownContent');

// Regex patterns to validate inputs based on their base
const validationRules = {
    2: /^[01]+$/,
    10: /^-?[0-9]+$/,
    8: /^[0-7]+$/,
    16: /^[0-9a-fA-F]+$/
};

function validateInput(val, base) {
    if (val === '') return true;
    return validationRules[base].test(val);
}

function computeConversions() {
    const valStr = inputValue.value.trim();
    errorMsg.textContent = '';

    if (valStr === '') {
        resetOutputs();
        return;
    }

    const base = parseInt(inputBase.value);

    // Check validation
    if (!validateInput(valStr, base)) {
        errorMsg.textContent = `Invalid input! Base ${base} only accepts valid characters for that system.`;
        resetOutputs();
        return;
    }

    // Convert input string to decimal integer using built-in parseInt(str, radix)
    let decimalValue = parseInt(valStr, base);

    if (isNaN(decimalValue)) {
        resetOutputs();
        return;
    }

    // Generate output conversions using built-in .toString(radix)
    resBinary.textContent = decimalValue >= 0 ? (decimalValue >>> 0).toString(2) : '-' + Math.abs(decimalValue).toString(2);
    resDecimal.textContent = decimalValue.toString(10);
    resOctal.textContent = decimalValue >= 0 ? (decimalValue >>> 0).toString(8) : '-' + Math.abs(decimalValue).toString(8);
    resHex.textContent = (decimalValue >= 0 ? (decimalValue >>> 0).toString(16) : '-' + Math.abs(decimalValue).toString(16)).toUpperCase();

    // Handle Stretch Goal: 2's Complement for negative binary numbers
    if (base === 10 && decimalValue < 0) {
        let absVal = Math.abs(decimalValue);
        let bits = absVal <= 127 ? 8 : (absVal <= 32767 ? 16 : 32);
        let mask = (1 << bits) - 1;
        let twosComp = ((decimalValue & mask) >>> 0).toString(2).padStart(bits, '0');
        twosComplementText.textContent = `${bits}-bit 2's Complement representation: ${twosComp}`;
    } else if (decimalValue < 0) {
        twosComplementText.textContent = `2's Complement is best calculated when input base is Decimal. (Decimal: ${decimalValue})`;
    } else {
        twosComplementText.textContent = `Number is positive. 2's complement is identical to standard binary.`;
    }

    // Handle Stretch Goal: Step-by-Step Breakdown
    generateBreakdown(valStr, base, decimalValue);
}

function generateBreakdown(valStr, base, dec) {
    let steps = `1. Input parsed in Base ${base}: "${valStr}"\n`;
    steps += `2. Converted to Intermediate Decimal (Base 10): ${dec}\n`;
    steps += `3. System Conversions via radix functions:\n`;
    steps += `   • Binary (Base 2): ${dec >= 0 ? (dec >>> 0).toString(2) : '-' + Math.abs(dec).toString(2)}\n`;
    steps += `   • Octal (Base 8): ${dec >= 0 ? (dec >>> 0).toString(8) : '-' + Math.abs(dec).toString(8)}\n`;
    steps += `   • Hexadecimal (Base 16): ${(dec >= 0 ? (dec >>> 0).toString(16) : '-' + Math.abs(dec).toString(16)).toUpperCase()}`;
    
    breakdownContent.textContent = steps;
}

function resetOutputs() {
    resBinary.textContent = '-';
    resDecimal.textContent = '-';
    resOctal.textContent = '-';
    resHex.textContent = '-';
    twosComplementText.textContent = 'Enter a valid decimal number to view.';
    breakdownContent.textContent = 'Type a value above to see the calculation steps.';
}

// Event Listeners for Real-Time Typing
inputValue.addEventListener('input', computeConversions);
inputBase.addEventListener('change', () => {
    inputValue.value = ''; // Clear input on base switch to prevent immediate mismatches
    resetOutputs();
});