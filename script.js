const inputs = {
    binary: document.getElementById('binary'),
    decimal: document.getElementById('decimal'),
    octal: document.getElementById('octal'),
    hex: document.getElementById('hex')
};

const errors = {
    binary: document.getElementById('binary-err'),
    decimal: document.getElementById('decimal-err'),
    octal: document.getElementById('octal-err'),
    hex: document.getElementById('hex-err')
};

// Map inputs to their respective radix (base)
const bases = {
    binary: 2,
    decimal: 10,
    octal: 8,
    hex: 16
};

// Validation patterns for each base
const patterns = {
    binary: /^[0-1]*$/,
    decimal: /^[0-9]*$/,
    octal: /^[0-7]*$/,
    hex: /^[0-9a-fA-F]*$/
};

function clearErrors() {
    Object.keys(errors.keys || errors).forEach(key => {
        errors[key].textContent = '';
    });
}

// Convert input value across all fields dynamically
function handleConversion(sourceBase, value) {
    clearErrors();
    
    if (!value.trim()) {
        clearAllFields(sourceBase);
        return;
    }

    // Validate characters against base constraints
    if (!patterns[sourceBase].test(value)) {
        errors[sourceBase].textContent = `Invalid character for Base ${bases[sourceBase]}`;
        return;
    }

    try {
        // Parse input value to base-10 integer
        let decimalValue = parseInt(value, bases[sourceBase]);

        if (isNaN(decimalValue)) {
            clearAllFields(sourceBase);
            return;
        }

        // Update all other fields except the one currently focused by the user
        Object.keys(inputs).forEach(base => {
            if (base !== sourceBase) {
                inputs[base].value = decimalValue.toString(bases[base]).toUpperCase();
            }
        });
    } catch (e) {
        errors[sourceBase].textContent = "Conversion error";
    }
}

// Attach event listeners to all input elements
Object.keys(inputs).forEach(base => {
    inputs[base].addEventListener('input', (e) => {
        handleConversion(base, e.target.value);
    });
});

function clearAllFields(except = null) {
    Object.keys(inputs).forEach(base => {
        if (base !== except) {
            inputs[base].value = '';
        }
    });
    clearErrors();
}

function clearAll() {
    Object.keys(inputs).forEach(base => {
        inputs[base].value = '';
    });
    clearErrors();
}

// Copy content feature
function copyValue(baseKey) {
    const val = inputs[baseKey].value;
    if (val) {
        navigator.clipboard.writeText(val);
        const btn = inputs[baseKey].nextElementSibling;
        const originalText = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1200);
    }
}