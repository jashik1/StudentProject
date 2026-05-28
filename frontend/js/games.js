const gameFields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    username: document.getElementById('username'),
    gender: document.getElementById('gender'),
    age: document.getElementById('age'),
    email: document.getElementById('email'),
    address: document.getElementById('address'),
    birthDate: document.getElementById('birthDate'),
    recoveryEmail: document.getElementById('recoveryEmail'),
    phoneNumber: document.getElementById('phoneNumber'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword')
    // ^^ deprecated, we have confirmPassword1–9 now
};
const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;
// Define confirm password segments and their available types
const confirmPasswordSegments = [
    { fields: [1], typeKey: null },      // Segment 1: fields 1-3
    { fields: [2], typeKey: null },      // Segment 2: fields 4-6
    { fields: [3], typeKey: null }       // Segment 3: fields 7-9
];

// Available types for confirm passwords with allowed segments
const confirmPasswordAvailableTypes = [
    {
        key: 'scrambledKeyboard',
        allowedOn: ['confirmPassword:1', 'confirmPassword:2', 'confirmPassword:3']
    },
    {
        key: 'binaryCode',
        allowedOn: ['confirmPassword:1', 'confirmPassword:2', 'confirmPassword:3']
    },
    {
        key: 'oldPhoneKeypad',
        allowedOn: ['confirmPassword:1', 'confirmPassword:2', 'confirmPassword:3']
    },
    {
        key: 'morseCode',
        allowedOn: ['confirmPassword:1', 'confirmPassword:2', 'confirmPassword:3']
    }
];

// Assign random types to segments (no duplicates between segments)
function assignConfirmPasswordTypes() {
    const usedTypes = [];

    confirmPasswordSegments.forEach((segment, segmentIndex) => {
        const segmentLabel = `confirmPassword:${segment.fields[0]}`;

        // Find types allowed on this segment and not yet used
        const availableForThisSegment = confirmPasswordAvailableTypes.filter(t =>
            t.allowedOn.includes(segmentLabel) && !usedTypes.includes(t.key)
        );

        if (availableForThisSegment.length === 0) {
            // If we've run out of allowed types, reset and use any allowed type
            availableForThisSegment.push(
                ...confirmPasswordAvailableTypes.filter(t => t.allowedOn.includes(segmentLabel))
            );
        }

        if (availableForThisSegment.length === 0) {
            console.error(`No types available for segment ${segmentLabel}`);
            return;
        }

        // Pick a random type from available options
        const randomIndex = Math.floor(Math.random() * availableForThisSegment.length);
        segment.typeKey = availableForThisSegment[randomIndex].key;
        usedTypes.push(segment.typeKey);
    });
}

// Helper function to get segment type key for a field number
function getConfirmPasswordTypeKey(fieldNum) {
    for (const segment of confirmPasswordSegments) {
        if (segment.fields.includes(fieldNum)) {
            return segment.typeKey;
        }
    }
    return null;
}

// Higher/Lower for age

function setupHigherLowerNumber(input, config) {
    const { box, msgEl, btnLower, btnHigher, min, max, start } = config;

    if (!box || !msgEl || !btnLower || !btnHigher) return;

    box.style.display = 'block';
    input.readOnly = true;

    // Overall allowed range
    let low = min;
    let high = max;

    // Current guess
    let current = start != null ? start : Math.floor((low + high) / 2);

    function update() {
        msgEl.textContent = `Press Higher or Lower to set your age.`;
        input.value = String(current);
    }

    update();

    btnLower.addEventListener('click', () => {
        if (current <= low) {
            msgEl.textContent = `Your age can't be lower than ${low} based on your answers.`;
            return;
        }

        high = current - 1;

        if (low > high) {
            msgEl.textContent = `Your answers don't make sense anymore.`;
            return;
        }

        // Pick a random new guess in [low, high]
        current = Math.floor(Math.random() * (high - low + 1)) + low;
        update();
    });

    btnHigher.addEventListener('click', () => {
        if (current >= high) {
            msgEl.textContent = `Your age can't be higher than ${high} based on your answers.`;
            return;
        }

        low = current + 1;

        if (low > high) {
            msgEl.textContent = `Your answers don't make sense anymore.`;
            return;
        }

        // Pick a random new guess in [low, high]
        current = Math.floor(Math.random() * (high - low + 1)) + low;
        update();
    });
}

// Higher/Lower for birth date

function setupHigherLowerDate(input, config) {
    const {
        box,
        msgEl,
        btnEarlier,
        btnLater,
        minDate,
        maxDate,
        startDate
    } = config;

    if (!box || !msgEl || !btnEarlier || !btnLater) return;

    box.style.display = 'block';
    input.readOnly = true;
    input.addEventListener('keydown', e => e.preventDefault());
    input.addEventListener('click', e => e.preventDefault());

    const DAY = 24 * 60 * 60 * 1000;

    let lowTime = minDate.getTime();
    let highTime = maxDate.getTime();
    let currentTime = startDate ? startDate.getTime()
        : Math.floor((lowTime + highTime) / 2);

    function formatDate(ts) {
        const d = new Date(ts);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function update() {
        const text = formatDate(currentTime);
        msgEl.textContent = `Use Earlier / Later to set your birth date.`;
        input.value = text;
    }

    function remainingDays() {
        return Math.floor((highTime - lowTime) / DAY) + 1;
    }

    function makeGuess() {
        if (lowTime > highTime) {
            msgEl.textContent = "Your answers don't make sense anymore.";
            btnEarlier.disabled = true;
            btnLater.disabled = true;
            return;
        }

        const days = remainingDays();

        // If there's only 1 possible day left, lock to it
        if (days <= 1) {
            currentTime = lowTime;
            const text = formatDate(currentTime);
            input.value = text;
            msgEl.textContent = `There's only one date left that fits your answers.`;
            btnEarlier.disabled = true;
            btnLater.disabled = true;
            return;
        }

        const range = highTime - lowTime;
        const offset = Math.floor(Math.random() * (range + 1));
        currentTime = lowTime + offset;
        update();
    }

    // Initial guess
    makeGuess();

    btnEarlier.addEventListener('click', () => {
        if (currentTime <= lowTime) {
            msgEl.textContent = `I can't go earlier than ${formatDate(lowTime)} based on your answers.`;
            return;
        }
        highTime = currentTime - DAY;
        makeGuess();
    });

    btnLater.addEventListener('click', () => {
        if (currentTime >= highTime) {
            msgEl.textContent = `I can't go later than ${formatDate(highTime)} based on your answers.`;
            return;
        }
        lowTime = currentTime + DAY;
        makeGuess();
    });
}
const fieldTypes = [
    // 1. Higher/Lower
    {
        key: 'higherLowerAge',
        allowedOn: ['age'],
        placeholder: 'Click higher or lower to get your age',
        cssClass: 'type-higher-lower'
    },

    {
        key: 'higherLowerBirthDate',
        allowedOn: ['birthDate'],
        placeholder: 'Click earlier or later to get your birth date',
        cssClass: 'type-higher-lower'
    },

    // 2. Gambling (roulette/slots) — only for age
    {
        key: 'gambling',
        allowedOn: ['age'],
        placeholder: 'Spin to get your age',
        cssClass: 'type-gambling'
    },

    // 3. Address via Google Maps zoom
    {
        key: 'mapZoom',
        allowedOn: ['address'],
        placeholder: 'Zoom the map all the way to your house',
        cssClass: 'type-map-zoom'
    },

    // 4. Display keyboard (on-screen, scrambled alphabet)
    {
        key: 'scrambledKeyboard',
        allowedOn: ['username', 'firstName', 'lastName', 'gender', 'password', 'confirmPassword', 'email', 'recoveryEmail', 'age', 'phoneNumber'],
        placeholder: 'Type using the on-screen keyboard',
        cssClass: 'type-scrambled-keyboard'
    },

    // 5. Morse code input
    {
        key: 'morseCode',
        allowedOn: ['username', 'firstName', 'lastName', 'gender', 'address', 'phoneNumber', 'email', 'recoveryEmail', 'age'],
        placeholder: 'Enter text using Morse code (. and - only)',
        cssClass: 'type-morse-code'
    },

    // 6. Binary code (only 0 and 1)
    {
        key: 'binaryCode',
        allowedOn: ['username', 'firstName', 'lastName', 'gender', 'password', 'phoneNumber', 'email', 'recoveryEmail', 'age'],
        placeholder: 'Enter text as ASCII binary (0 and 1 only)',
        cssClass: 'type-binary-code'
    },

    // 7. Old phone keypad typing (multi-press)
    {
        key: 'oldPhoneKeypad',
        allowedOn: ['username', 'firstName', 'lastName', 'gender', 'address'],
        placeholder: 'Use your number keypad to write (1 = !?.,1, 2 = abc2, 3 = def3 ... 0 = space0)',
        cssClass: 'type-old-phone-keypad'
    },

    // 8. Numbers by words (zero–nine only)
    {
        key: 'numbersByWords',
        allowedOn: ['phoneNumber', 'age'],
        placeholder: 'Write numbers as words (zero to nine)',
        cssClass: 'type-numbers-by-words'
    },

    // 9. Age dropdown (only for age)
    {
        key: 'ageDropdown',
        allowedOn: ['age'],
        placeholder: 'Choose your age from the dropdown',
        cssClass: 'type-age-dropdown'
    },

    // 10. One-letter keyboard
    {
        key: 'oneLetterKeyboard',
        allowedOn: ['username', 'firstName', 'lastName', 'gender', 'address', 'email', 'recoveryEmail', 'phoneNumber', 'password', 'confirmPassword'],
        placeholder: 'Use the buttons below to type letters',
        cssClass: 'type-one-letter-keyboard'
    }
];

// Detect presentation mode from URL
function isPresentationModeFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        return params.get('presentation') === '1';
    } catch (e) {
        return false;
    }
}

// Global flag
window.PRESENTATION_MODE = isPresentationModeFromUrl();
console.log('[PRESENTATION_MODE]', window.PRESENTATION_MODE ? 'ON' : 'OFF');

window.assignedTypes = {};
const assignedTypes = window.assignedTypes;


function applyTypeForField(fieldId, chosenType, input) {
    // Scrambled keyboard
    if (chosenType.key === 'scrambledKeyboard') {
        if (window.scrambledKeyboardAttach) {
            window.scrambledKeyboardAttach(input);
        }
    }

    // Morse code
    if (chosenType.key === 'morseCode') {
        if (isMobile && window.attachMorseKeyboard) {
            window.attachMorseKeyboard(input);
        } else {
            input.addEventListener('keydown', function (e) {
                const allowedCtrl = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Home', 'End'];
                if (allowedCtrl.includes(e.key)) return;
                if (e.ctrlKey || e.metaKey || e.altKey) return;
                if (e.key === '.' || e.key === '-' || e.key === ' ') return;
                e.preventDefault();
            });
            input.addEventListener('paste', function (e) {
                e.preventDefault();
            });
        }
    }

    // Gambling
        if (fieldId === 'age' && chosenType.key === 'gambling') {
            const slotMachine = document.getElementById('age-slot-machine');
            const spinBtn = document.getElementById('slot-spin');
            const msg = document.getElementById('slot-message');

            slotMachine.style.display = 'block';
            input.readOnly = true; // user can't type directly

            spinBtn.addEventListener('click', () => {
                const startTime = Date.now();
                const duration = 1000; // spin for 1s

                const interval = setInterval(() => {
                    const elapsed = Date.now() - startTime;

                    // show random 2-digit number inside the input while spinning
                    const rand = Math.floor(Math.random() * 100);
                    input.value = String(rand).padStart(2, '0');

                    if (elapsed >= duration) {
                        clearInterval(interval);

                        // Final age between 1 and 99
                        const finalAge = Math.floor(Math.random() * 99) + 1;
                        input.value = String(finalAge); // final value in the box

                        msg.textContent = 'Your age is ' + finalAge + '. Click again to re-spin.';
                    }
                }, 80);
            });
        }

        if (fieldId === 'address' && chosenType.key === 'mapZoom') {
            const mapWrapper = document.getElementById('address-map-wrapper');
            mapWrapper.style.display = 'block';

            // make typing impossible so they must use the map
            input.readOnly = true;

            // when they change text, update map via geocode
            input.addEventListener('change', () => {
                if (input.value.trim()) {
                    geocodeAddress(input.value.trim());
                }
            });
        }

        // old phone keypad
        if (chosenType.key === 'oldPhoneKeypad') {
            (function () {
                const map = {
                    '1': ['!', '?', '.', ',', '1'],
                    '2': ['a', 'b', 'c', '2'],
                    '3': ['d', 'e', 'f', '3'],
                    '4': ['g', 'h', 'i', '4'],
                    '5': ['j', 'k', 'l', '5'],
                    '6': ['m', 'n', 'o', '6'],
                    '7': ['p', 'q', 'r', 's', '7'],
                    '8': ['t', 'u', 'v', '8'],
                    '9': ['w', 'x', 'y', 'z', '9'],
                    '0': [' ', '0']
                };

                input.setAttribute('inputmode', 'numeric');
                input.setAttribute('pattern', '[0-9]*');

                let lastKey = null;
                let lastTime = 0;
                let pressIndex = 0;
                const timeout = 800; // ms to wait before starting a new letter

                input.addEventListener('keydown', function (e) {
                    // allow navigation and control keys
                    if (['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        return;
                    }

                    // only handle numeric keys that are part of the old-phone mapping
                    if (!map[e.key]) {
                        // block other printable keys (letters, symbols)
                        e.preventDefault();
                        return;
                    }

                    e.preventDefault();
                    const now = Date.now();

                    if (e.key !== lastKey || now - lastTime > timeout) {
                        // start a new character: append first letter for this key
                        input.value = input.value + map[e.key][0];
                        pressIndex = 0;
                    } else {
                        // cycle to next letter for the same key: replace last character
                        pressIndex = (pressIndex + 1) % map[e.key].length;
                        input.value = input.value.slice(0, -1) + map[e.key][pressIndex];
                    }

                    lastKey = e.key;
                    lastTime = now;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });

                // reset cycle when input loses focus
                input.addEventListener('blur', function () {
                    lastKey = null;
                    pressIndex = 0;
                });
            })();
        }

        // numbers-by-words: block digit key presses and paste (prevent numbers being entered)
        if (chosenType.key === 'numbersByWords') {
            (function () {
                input.addEventListener('keydown', function (e) {
                    // allow navigation and control keys
                    if (['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(e.key)) {
                        return;
                    }
                    if (e.ctrlKey || e.metaKey || e.altKey) return; // allow shortcuts

                    // block single-character digit keys
                    if (e.key && e.key.length === 1 && /[0-9]/.test(e.key)) {
                        e.preventDefault();
                        return;
                    }
                });

                // prevent paste of digits
                input.addEventListener('paste', function (e) {
                    e.preventDefault();
                });
            })();
        }

        // Binary code
        if (chosenType.key === 'binaryCode') {
            if (isMobile && window.attachBinaryKeyboard) {
                window.attachBinaryKeyboard(input);
            } else {
                // desktop behavior: block everything except 0/1/control keys
                input.addEventListener('keydown', function (e) {
                    if (['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        return;
                    }
                    if (e.key !== '0' && e.key !== '1') {
                        e.preventDefault();
                    }
                });
            }
                input.addEventListener('paste', function (e) {
                e.preventDefault();
            });
        }

        // Morse code
        if (chosenType.key === 'morseCode') {
            if (isMobile && window.attachMorseKeyboard) {
                window.attachMorseKeyboard(input);
            } else {
                // your existing desktop morse logic:
                input.addEventListener('keydown', function (e) {
                    const allowedCtrl = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Home', 'End'];
                    if (allowedCtrl.includes(e.key)) return;
                    if (e.ctrlKey || e.metaKey || e.altKey) return;
                    if (e.key === '.' || e.key === '-' || e.key === ' ') return;
                    e.preventDefault();
                });
                input.addEventListener('paste', function (e) {
                    e.preventDefault();
                });
            }
        }

        // Higher / Lower for age
        if (fieldId === 'age' && chosenType.key === 'higherLowerAge') {
            setupHigherLowerNumber(input, {
                box: document.getElementById('age-hilo'),
                msgEl: document.getElementById('age-hilo-message'),
                btnLower: document.getElementById('age-hilo-lower'),
                btnHigher: document.getElementById('age-hilo-higher'),
                min: 1,
                max: 99,
                start: 50
            });
        }

        // Higher / Lower for birth date
        if (fieldId === 'birthDate' && chosenType.key === 'higherLowerBirthDate') {
            const minDate = new Date(0, 0, 1);
            const maxDate = new Date(3000, 11, 31);
            const startDate = new Date(500, 0, 1);

            setupHigherLowerDate(input, {
                box: document.getElementById('birth-hilo'),
                msgEl: document.getElementById('birth-hilo-message'),
                btnEarlier: document.getElementById('birth-hilo-earlier'),
                btnLater: document.getElementById('birth-hilo-later'),
                minDate,
                maxDate,
                startDate
            });
        }

        // Age dropdown
        if (fieldId === 'age' && chosenType.key === 'ageDropdown') {
            const wrapper = document.getElementById('age-dropdown-wrapper');
            const optionsList = document.getElementById('age-options-list');
            const slot = document.getElementById('age-slot-machine');
            const hilo = document.getElementById('age-hilo');

            if (!wrapper || !optionsList) {
                console.error('Age dropdown elements missing');
                return;
            }

            // Hide other age games
            if (slot) slot.style.display = 'none';
            if (hilo) hilo.style.display = 'none';

            // Show dropdown UI
            wrapper.style.display = 'block';

            // Clear existing options
            optionsList.innerHTML = '';

            // Generate ages 1–100, ONLY words in the list
            for (let i = 1; i <= 100; i++) {
                const div = document.createElement('div');
                div.className = 'age-option-item';
                const words = ageNumberToWords(i);
                div.textContent = words;           // <- just words, no "i –"
                div.dataset.ageNumber = String(i);
                div.dataset.ageWords = words;
                optionsList.appendChild(div);
            }

            // Make input read-only and show it as the single “box”
            input.readOnly = true;
            input.placeholder = 'Click to choose your age';
            input.value = '';

            // Helper: position the list right below the input
            function positionList() {
                const inputRect = input.getBoundingClientRect();
                const containerRect = wrapper.getBoundingClientRect();

                const top = inputRect.bottom - containerRect.top;
                const left = inputRect.left - containerRect.left;
                const width = inputRect.width;

                optionsList.style.top = top + 'px';
                optionsList.style.left = left + 'px';
                optionsList.style.width = width + 'px';
            }

            // Position initially
            positionList();
            // Reposition on window resize (optional)
            window.addEventListener('resize', positionList);

            // Clicking the input toggles the list
            input.addEventListener('click', () => {
                // ensure position is correct before showing
                positionList();
                const visible = optionsList.style.display === 'block';
                optionsList.style.display = visible ? 'none' : 'block';
            });

            // Click outside to close
            document.addEventListener('click', (e) => {
                if (e.target === input) return;
                if (!optionsList.contains(e.target)) {
                    optionsList.style.display = 'none';
                }
            });

            // Pick an age
            optionsList.addEventListener('click', (e) => {
                const item = e.target.closest('.age-option-item');
                if (!item) return;

                const words = item.dataset.ageWords;
                input.value = words;   // show words in the field

                optionsList.style.display = 'none';
            });
        }


        if (chosenType.key === 'oneLetterKeyboard') {
            // shared state for all oneLetterKeyboard fields
            if (!window._oneLetterKeyboardInitialized) {
                window._oneLetterKeyboardInitialized = true;

                const widget = document.getElementById('one-letter-keyboard');
                const btnLeft = document.getElementById('olk-left');
                const btnRight = document.getElementById('olk-right');
                const btnOk = document.getElementById('olk-ok');
                const btnShift = document.getElementById('olk-shift');
                const letterSpan = document.getElementById('olk-letter');
                const container = document.querySelector('.container');

                if (!widget || !btnLeft || !btnRight || !btnOk || !btnShift || !letterSpan || !container) {
                    console.error('One-letter keyboard elements missing');
                } else {
                    // Base layout (unshifted)
                    const baseChars = "`1234567890-=qwertyuiop[]asdfghjkl;'\\zxcvbnm,./".split('');

                    // Shifted layout, same length & order
                    const shiftChars = "~!@#$%^&*()_+QWERTYUIOP{}ASDFGHJKL:\"\|ZXCVBNM<>?".split('');

                    let index = 0;
                    let currentInput = null;
                    let shiftOn = false; // shift state

                    function currentChar() {
                        const arr = shiftOn ? shiftChars : baseChars;
                        return arr[index];
                    }

                    function positionWidget() {
                        if (!currentInput) return;
                        const inputRect = currentInput.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();

                        const top = inputRect.bottom - containerRect.top + 4;
                        const left = (inputRect.left + inputRect.right) / 2 - containerRect.left;

                        widget.style.top = top + 'px';
                        widget.style.left = left + 'px';
                    }

                    function updateDisplay() {
                        letterSpan.textContent = currentChar();
                    }

                    function showWidgetForInput(targetInput) {
                        currentInput = targetInput;
                        index = 0;          // optional: always start at first char
                        shiftOn = false;    // optional: reset shift when shown
                        updateDisplay();

                        positionWidget();
                        widget.style.display = 'flex';
                        requestAnimationFrame(() => {
                            widget.classList.add('visible');
                        });
                    }

                    function hideWidget() {
                        widget.classList.remove('visible');
                        currentInput = null;
                        setTimeout(() => {
                            if (!widget.classList.contains('visible')) {
                                widget.style.display = 'none';
                            }
                        }, 220);
                    }

                    // global helper so each field can show widget
                    window.showOneLetterKeyboard = showWidgetForInput;
                    window.hideOneLetterKeyboard = hideWidget;

                    // avoid unfocusing the input on button clicks
                    [btnLeft, btnRight, btnOk, btnShift].forEach(btn => {
                        btn.addEventListener('mousedown', (e) => {
                            e.preventDefault(); // prevent focus change
                        });
                    });

                    // navigation
                    btnLeft.addEventListener('click', () => {
                        if (!currentInput) return;
                        index = (index - 1 + baseChars.length) % baseChars.length;
                        updateDisplay();
                        currentInput.focus();
                    });

                    btnRight.addEventListener('click', () => {
                        if (!currentInput) return;
                        index = (index + 1) % baseChars.length;
                        updateDisplay();
                        currentInput.focus();
                    });

                    // Shift toggle
                    btnShift.addEventListener('click', () => {
                        shiftOn = !shiftOn;
                        updateDisplay();
                        // optional: visual state
                        btnShift.classList.toggle('active', shiftOn);
                        currentInput && currentInput.focus();
                    });

                    // OK inserts the currently displayed character
                    btnOk.addEventListener('click', () => {
                        if (!currentInput) return;
                        const ch = currentChar();
                        const start = currentInput.selectionStart ?? currentInput.value.length;
                        const end = currentInput.selectionEnd ?? currentInput.value.length;

                        currentInput.value =
                            currentInput.value.slice(0, start) +
                            ch +
                            currentInput.value.slice(end);

                        const newPos = start + ch.length;
                        currentInput.setSelectionRange(newPos, newPos);
                        currentInput.dispatchEvent(new Event('input', { bubbles: true }));
                        currentInput.focus();
                    });

                    // reposition widget on window resize
                    window.addEventListener('resize', () => {
                        if (widget.style.display === 'block') {
                            positionWidget();
                        }
                    });
                }
            }

            // per-field setup (runs for each chosen field)
            (function () {
                const inputField = input; // local alias for clarity

                // prevent normal typing in this mode (except navigation)
                inputField.addEventListener('keydown', function (e) {
                    if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                        'Backspace', 'Delete', 'Home', 'End'].includes(e.key)) {
                        return;
                    }
                    if (e.ctrlKey || e.metaKey || e.altKey) return; // allow shortcuts

                    if (e.key && e.key.length === 1) {
                        e.preventDefault();
                    }
                });

                inputField.addEventListener('paste', function (e) {
                    e.preventDefault();
                });

                // show widget when this field gains focus
                inputField.addEventListener('focus', () => {
                    if (window.showOneLetterKeyboard) {
                        window.showOneLetterKeyboard(inputField);
                    }
                });

                // optional: hide on blur if nothing inside widget is focused
                inputField.addEventListener('blur', () => {
                    setTimeout(() => {
                        const widget = document.getElementById('one-letter-keyboard');
                        const active = document.activeElement;

                        const isInsideWidget = widget.contains(active);
                        const isAnotherOLKField = active &&
                            active !== inputField &&
                            active.classList &&
                            active.classList.contains('type-one-letter-keyboard');

                        if (!isInsideWidget && !isAnotherOLKField) {
                            if (window.hideOneLetterKeyboard) {
                                window.hideOneLetterKeyboard();
                            }
                        }
                    }, 0);
                });
            })();
        }
    }

// --- Mobile binary/morse keyboards ---

        (function () {
            const isMobile =
                /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                window.innerWidth <= 768;

            if (!isMobile) return; // only do this on mobile

            const container = document.querySelector('.container');
            const binaryWidget = document.getElementById('binary-keyboard');
            const morseWidget = document.getElementById('morse-keyboard');

            if (!container || !binaryWidget || !morseWidget) {
                console.warn('Mini keyboards not found in DOM.');
                return;
            }

            let currentInput = null;
            let currentWidget = null;

            function positionWidget(widget, input) {
                const inputRect = input.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const top = inputRect.bottom - containerRect.top + 4;
                const left = (inputRect.left + inputRect.right) / 2 - containerRect.left;

                widget.style.top = top + 'px';
                widget.style.left = left + 'px';
            }

            function showWidget(widget, input) {
                currentInput = input;
                currentWidget = widget;
                positionWidget(widget, input);
                widget.style.display = 'flex';
                requestAnimationFrame(() => {
                    widget.classList.add('visible');
                });
            }

            function hideWidget(widget) {
                widget.classList.remove('visible');
                setTimeout(() => {
                    if (!widget.classList.contains('visible')) {
                        widget.style.display = 'none';
                    }
                }, 200);
                if (currentWidget === widget) {
                    currentWidget = null;
                    currentInput = null;
                }
            }

            function insertAtCursor(input, text) {
                const start = input.selectionStart ?? input.value.length;
                const end = input.selectionEnd ?? input.value.length;
                input.value = input.value.slice(0, start) + text + input.value.slice(end);
                const newPos = start + text.length;
                input.setSelectionRange(newPos, newPos);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }

            function handleButtonClick(key) {
                if (!currentInput) return;

                if (key === 'backspace') {
                    const start = currentInput.selectionStart ?? currentInput.value.length;
                    const end = currentInput.selectionEnd ?? currentInput.value.length;
                    if (start === end && start > 0) {
                        // delete previous char
                        currentInput.value =
                            currentInput.value.slice(0, start - 1) +
                            currentInput.value.slice(end);
                        const newPos = start - 1;
                        currentInput.setSelectionRange(newPos, newPos);
                    } else {
                        // delete selection
                        currentInput.value =
                            currentInput.value.slice(0, start) +
                            currentInput.value.slice(end);
                        currentInput.setSelectionRange(start, start);
                    }
                    currentInput.dispatchEvent(new Event('input', { bubbles: true }));
                    currentInput.focus();
                    return;
                }

                if (key === 'clear') {
                    currentInput.value = '';
                    currentInput.dispatchEvent(new Event('input', { bubbles: true }));
                    currentInput.focus();
                    return;
                }

                if (key === 'close') {
                    hideWidget(currentWidget);
                    currentInput.blur();
                    return;
                }

                    if (key === 'space') {
                    key = ' ';
                }

                // normal character
                insertAtCursor(currentInput, key);
                currentInput.focus();
            }

            function wireWidget(widget) {
                widget.addEventListener('mousedown', e => e.preventDefault()); // prevent focus loss
                widget.addEventListener('click', e => {
                    const btn = e.target.closest('button[data-key]');
                    if (!btn) return;
                    const key = btn.dataset.key;
                    handleButtonClick(key);
                });
            }

            wireWidget(binaryWidget);
            wireWidget(morseWidget);

            // public attachers
            window.attachBinaryKeyboard = function (input) {
                if (!isMobile) return;
                // prevent native typing
                input.readOnly = true;
                input.addEventListener('focus', () => {
                    showWidget(binaryWidget, input);
                });
                input.addEventListener('blur', () => {
                    setTimeout(() => {
                        // hide only if focus isn't on widget
                        const active = document.activeElement;
                        if (!binaryWidget.contains(active)) {
                            hideWidget(binaryWidget);
                        }
                    }, 0);
                });
            };

            window.attachMorseKeyboard = function (input) {
                if (!isMobile) return;
                input.readOnly = true;
                input.addEventListener('focus', () => {
                    showWidget(morseWidget, input);
                });
                input.addEventListener('blur', () => {
                    setTimeout(() => {
                        const active = document.activeElement;
                        if (!morseWidget.contains(active)) {
                            hideWidget(morseWidget);
                        }
                    }, 0);
                });
            };

            // reposition on rotate/resize
            window.addEventListener('resize', () => {
                if (currentWidget && currentInput) {
                    positionWidget(currentWidget, currentInput);
                }
            });
        })();

// Minimal random assignment (no validation logic yet)
function assignRandomTypes() {
    Object.keys(gameFields).forEach(fieldId => {
        const input = gameFields[fieldId];
        if (!input) return;

        const possibleTypes = fieldTypes.filter(t => t.allowedOn.includes(fieldId));
        if (possibleTypes.length === 0) {
            return;
        }

        const randomIndex = Math.floor(Math.random() * possibleTypes.length);
        const chosenType = possibleTypes[randomIndex];

        assignedTypes[fieldId] = chosenType;
        input.placeholder = chosenType.placeholder;
        input.classList.add(chosenType.cssClass);

        applyTypeForField(fieldId, chosenType, input);
    });
}

function getTypeByKey(key) {
    return fieldTypes.find(t => t.key === key) || null;
}

function assignPresentationTypes() {
    // Clear any previous assignments
    Object.keys(assignedTypes).forEach(k => delete assignedTypes[k]);

    // Small helper to assign a specific type to a specific field
    function assignExact(fieldId, typeKey) {
        const t = getTypeByKey(typeKey);
        if (!t) {
            console.warn('Presentation: type not found', typeKey);
            return;
        }
        if (!t.allowedOn.includes(fieldId)) {
            console.warn(`Presentation: type "${typeKey}" not allowed on "${fieldId}"`);
            return;
        }
        const input = gameFields[fieldId];
        if (!input) return;

        assignedTypes[fieldId] = t;
        input.placeholder = t.placeholder;
        input.classList.add(t.cssClass);

        applyTypeForField(fieldId, t, input);
    }

    // Now choose what you want for the demo:
    assignExact('address', 'mapZoom');      
    assignExact('age', 'gambling');               
    assignExact('birthDate', 'higherLowerBirthDate');  
    assignExact('username', 'scrambledKeyboard');
    assignExact('firstName', 'oneLetterKeyboard');
    assignExact('lastName', 'oldPhoneKeypad');
    assignExact('gender', 'morseCode');
    assignExact('phoneNumber', 'numbersByWords');
    assignExact('email', 'binaryCode');
    assignExact('recoveryEmail', 'binaryCode');      
    assignExact('password', 'scrambledKeyboard'); 

    console.log('[Presentation] Assigned types:', JSON.stringify(assignedTypes, null, 2));
}

function applyMobileReadOnlyRules() {
    if (!isMobile) return;
    if (!window.assignedTypes) return;

    // Types that should *not* allow direct typing on mobile
    const blockTypingTypes = new Set([
        'scrambledKeyboard',
        'morseCode',
        'binaryCode',
        'oneLetterKeyboard',
        'higherLowerAge',
        'higherLowerBirthDate',
        'ageDropdown',
        'mapZoom'
        // add 'numbersByWords' here if you also want to block normal typing for that
    ]);

    Object.keys(window.assignedTypes).forEach(fieldId => {
        const type = window.assignedTypes[fieldId];
        if (!type || !blockTypingTypes.has(type.key)) return;

        const input = gameFields[fieldId];
        if (!input) return;

        // For these types, we want: no native keyboard, but still focusable
        input.readOnly = true;

        // For some of these you already had readOnly set (e.g. mapZoom, ageDropdown, higher/lower)
        // This just centralizes the logic so you don't miss scrambled/one-letter/etc.
    });
}

// Run on page load
if (window.PRESENTATION_MODE && typeof assignPresentationTypes === 'function') {
    assignPresentationTypes();
} else {
    assignRandomTypes();
}
console.log('Assigned types:', JSON.stringify(window.assignedTypes, null, 2));
applyMobileReadOnlyRules();