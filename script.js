const inputBaseSelect = document.getElementById('input-base');
const mainInput = document.getElementById('main-input');
const globalError = document.getElementById('global-error');

const resBinary = document.getElementById('res-binary');
const resDecimal = document.getElementById('res-decimal');
const resOctal = document.getElementById('res-octal');
const resHex = document.getElementById('res-hex');
const resBcd = document.getElementById('res-bcd');
const resOnes = document.getElementById('res-ones');
const resTwos = document.getElementById('res-twos');
const breakdownText = document.getElementById('breakdown-text');

// Validation patterns for each base
const basePatterns = {
    '2': /^[0-1]*$/,
    '10': /^-?[0-9]*$/,
    '8': /^[0-7]*$/,
    '16': /^[0-9a-fA-F]*$/
};

function clearAll() {
    mainInput.value = '';
    globalError.textContent = '';
    resBinary.textContent = '—';
    resDecimal.textContent = '—';
    resOctal.textContent = '—';
    resHex.textContent = '—';
    resBcd.textContent = '—';
    resOnes.textContent = '—';
    resTwos.textContent = '—';
    breakdownText.textContent = 'Enter a valid value above to observe the digital transformation logic.';
}

function computeConversions() {
    const rawValue = mainInput.value.trim();
    const currentBase = parseInt(inputBaseSelect.value);

    globalError.textContent = '';

    if (!rawValue || rawValue === '-' ) {
        clearOutputsOnly();
        return;
    }

    // Validate characters against constraints
    if (!basePatterns[currentBase].test(rawValue)) {
        globalError.textContent = `Invalid character for Base ${currentBase} system.`;
        clearOutputsOnly();
        return;
    }

    let decimalVal;
    try {
        decimalVal = parseInt(rawValue, currentBase);
        if (isNaN(decimalVal)) {
            clearOutputsOnly();
            return;
        }
    } catch (e) {
        clearOutputsOnly();
        return;
    }

    // Generate output values
    const binStr = decimalVal >= 0 ? decimalVal.toString(2) : '-' + Math.abs(decimalVal).toString(2);
    const octStr = decimalVal >= 0 ? decimalVal.toString(8).toUpperCase() : '-' + Math.abs(decimalVal).toString(8).toUpperCase();
    const hexStr = decimalVal >= 0 ? decimalVal.toString(16).toUpperCase() : '-' + Math.abs(decimalVal).toString(16).toUpperCase();
    
    resBinary.textContent = binStr;
    resDecimal.textContent = decimalVal.toString(10);
    resOctal.textContent = octStr;
    resHex.textContent = hexStr;

    // BCD conversion for non-negative decimal numbers
    if (decimalVal >= 0) {
        let bcdResult = decimalVal.toString(10).split('').map(digit => {
            return parseInt(digit).toString(2).padStart(4, '0');
        }).join(' ');
        resBcd.textContent = bcdResult;
    } else {
        resBcd.textContent = 'N/A (Negative)';
    }

    // 8-bit 1's Complement representation (-127 to 127)
    if (decimalVal >= -127 && decimalVal <= 127) {
        let absBin = Math.abs(decimalVal).toString(2).padStart(8, '0');
        if (decimalVal < 0) {
            // Invert bits for negative values
            absBin = absBin.split('').map(bit => bit === '0' ? '1' : '0').join('');
        }
        resOnes.textContent = absBin;
    } else {
        resOnes.textContent = 'Out of 8-bit range (-127 to 127)';
    }

    // 8-bit Two's Complement representation (-128 to 127)
    if (decimalVal >= -128 && decimalVal <= 127) {
        let twosVal = decimalVal < 0 ? (256 + decimalVal) : decimalVal;
        resTwos.textContent = twosVal.toString(2).padStart(8, '0');
    } else {
        resTwos.textContent = 'Out of 8-bit range (-128 to 127)';
    }

    // Step-by-Step Breakdown Logic
    updateBreakdown(rawValue, currentBase, decimalVal);
}

function clearOutputsOnly() {
    resBinary.textContent = '—';
    resDecimal.textContent = '—';
    resOctal.textContent = '—';
    resHex.textContent = '—';
    resBcd.textContent = '—';
    resOnes.textContent = '—';
    resTwos.textContent = '—';
    breakdownText.textContent = 'Enter a valid value above to observe the digital transformation logic.';
}

function updateBreakdown(val, base, dec) {
    let steps = `[1] Input Value: "${val}" in Base ${base}\n`;
    steps += `[2] Intermediate Conversion to Base 10 (Decimal):\n`;
    
    if (base === 10) {
        steps += `    -> Value is already in Decimal: ${dec}\n`;
    } else {
        steps += `    -> Parsed integer value = ${dec}\n`;
    }

    steps += `[3] Target Base Derivations:\n`;
    steps += `    -> Binary (Base 2): Repeated division by 2 -> ${dec.toString(2)}\n`;
    steps += `    -> Octal (Base 8): Grouping binary bits into triplets -> ${dec.toString(8).toUpperCase()}\n`;
    steps += `    -> Hexadecimal (Base 16): Grouping binary bits into quadruplets -> ${dec.toString(16).toUpperCase()}`;

    breakdownText.textContent = steps;
}

mainInput.addEventListener('input', computeConversions);
inputBaseSelect.addEventListener('change', () => {
    mainInput.value = '';
    clearOutputsOnly();
});

function copyText(elementId) {
    const text = document.getElementById(elementId).textContent;
    if (text && text !== '—') {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard: ' + text);
    }
}