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

const voiceBtn = document.getElementById('voice-btn');
const voiceStatus = document.getElementById('voice-status');

let recognition = null;
let isListeningContinuous = false;

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
    breakdownText.textContent = 'Tap the voice assistant button once, then speak freely!';
}

function computeConversions() {
    const rawValue = mainInput.value.trim();
    const currentBase = parseInt(inputBaseSelect.value);

    globalError.textContent = '';

    if (!rawValue || rawValue === '-' ) {
        clearOutputsOnly();
        return;
    }

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

    const binStr = decimalVal >= 0 ? decimalVal.toString(2) : '-' + Math.abs(decimalVal).toString(2);
    const octStr = decimalVal >= 0 ? decimalVal.toString(8).toUpperCase() : '-' + Math.abs(decimalVal).toString(8).toUpperCase();
    const hexStr = decimalVal >= 0 ? decimalVal.toString(16).toUpperCase() : '-' + Math.abs(decimalVal).toString(16).toUpperCase();
    
    resBinary.textContent = binStr;
    resDecimal.textContent = decimalVal.toString(10);
    resOctal.textContent = octStr;
    resHex.textContent = hexStr;

    if (decimalVal >= 0) {
        let bcdResult = decimalVal.toString(10).split('').map(digit => {
            return parseInt(digit).toString(2).padStart(4, '0');
        }).join(' ');
        resBcd.textContent = bcdResult;
    } else {
        resBcd.textContent = 'N/A (Negative)';
    }

    if (decimalVal >= -127 && decimalVal <= 127) {
        let absBin = Math.abs(decimalVal).toString(2).padStart(8, '0');
        if (decimalVal < 0) {
            absBin = absBin.split('').map(bit => bit === '0' ? '1' : '0').join('');
        }
        resOnes.textContent = absBin;
    } else {
        resOnes.textContent = 'Out of 8-bit range (-127 to 127)';
    }

    if (decimalVal >= -128 && decimalVal <= 127) {
        let twosVal = decimalVal < 0 ? (256 + decimalVal) : decimalVal;
        resTwos.textContent = twosVal.toString(2).padStart(8, '0');
    } else {
        resTwos.textContent = 'Out of 8-bit range (-127 to 127)';
    }

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
    breakdownText.textContent = 'Tap the voice assistant button once, then speak freely!';
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

// Single-Tap Continuous Hands-Free Voice Toggle
function toggleVoiceAssistant() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Speech recognition is not supported on this browser. Please use Chrome.");
        return;
    }

    if (isListeningContinuous) {
        // Stop listening if already active
        if (recognition) {
            recognition.stop();
        }
        isListeningContinuous = false;
        voiceBtn.classList.remove('listening');
        voiceStatus.textContent = "Tap to Start Voice Assistant";
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true; // Stays active continuously after one tap

    recognition.onstart = function() {
        isListeningContinuous = true;
        voiceBtn.classList.add('listening');
        voiceStatus.textContent = "Listening continuously... Speak anytime!";
    };

    recognition.onresult = function(event) {
        const lastResultIndex = event.results.length - 1;
        const speechText = event.results[lastResultIndex][0].transcript.toLowerCase();
        
        parseVoiceCommand(speechText);
    };

    recognition.onerror = function(event) {
        // Ignore minor no-speech timeout errors and keep listening
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
            voiceStatus.textContent = "Error: " + event.error;
        }
    };

    recognition.onend = function() {
        // Automatically restart if mobile browser shuts it down due to silence
        if (isListeningContinuous) {
            try {
                recognition.start();
            } catch (e) {}
        }
    };

    try {
        recognition.start();
    } catch (e) {
        alert("Could not start microphone. Please check permissions.");
    }
}

function parseVoiceCommand(text) {
    let numberMatch = text.match(/-?\d+/);
    
    if (!numberMatch) return;

    let detectedNumber = numberMatch[0];

    if (text.includes('binary')) {
        inputBaseSelect.value = "2";
    } else if (text.includes('octal')) {
        inputBaseSelect.value = "8";
    } else if (text.includes('hex') || text.includes('hexadecimal')) {
        inputBaseSelect.value = "16";
    } else {
        inputBaseSelect.value = "10";
    }

    mainInput.value = detectedNumber;
    computeConversions();
    voiceStatus.textContent = `Heard: "${text}" (Listening...)`;
}