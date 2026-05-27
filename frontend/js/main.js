localStorage.setItem('ikbw_has_played', 'true');
localStorage.setItem('ikbw_info_state', 'full');

// Requirement toggle
const FORM_TEST_MODE = false;  // true = no requirements, false = normal validation
console.log('[FORM_TEST_MODE]', FORM_TEST_MODE ? 'ON' : 'OFF');

const FORM_ALLOW_EMPTY = false;
console.log('[FORM_ALLOW_EMPTY]', FORM_ALLOW_EMPTY ? 'ON' : 'OFF');

if (FORM_TEST_MODE || FORM_ALLOW_EMPTY) {
    // remove required attributes from all inputs in the form
    const formEl = document.getElementById('registerForm');
    if (formEl) {
        formEl.querySelectorAll('input[required]').forEach(inp => {
            inp._wasRequired = true; // remember it was required
            inp.removeAttribute('required');
        });
    }
    console.log('[FORM_TEST_MODE] Removed required attributes from inputs');
}

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        // Update icon based on current theme
        const current = getStoredTheme && getStoredTheme();
        if (current === 'dark') {
            themeBtn.textContent = '☀';
        } else {
            themeBtn.textContent = '☾';
        }

        themeBtn.addEventListener('click', () => {
            if (typeof toggleTheme === 'function') {
                toggleTheme();
                const t = getStoredTheme();
                themeBtn.textContent = (t === 'dark') ? '☀' : '☾';
            }
        });
    }
});

const form = document.getElementById("registerForm");
const modal = document.getElementById("confirmModal");
const summaryDiv = document.getElementById("confirmSummary");
const confirmBackBtn = document.getElementById("confirmBack");
const confirmSubmitBtn = document.getElementById("confirmSubmit");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (FORM_TEST_MODE) {
        // Minimal logic: just build a basic summary from raw values
        const summaryDiv = document.getElementById("confirmSummary");
        const modal = document.getElementById("confirmModal");
        let html = '';

        Object.keys(gameFields).forEach(fieldId => {
            const input = gameFields[fieldId];
            if (!input) return;
            const label = document.querySelector(`label[for="${input.id}"]`);
            const labelText = label ? label.textContent : fieldId;
            let displayValue = input.value;

            if (fieldId === 'phoneNumber') {
                const trimmed = (displayValue || '').trim();
                if (trimmed && !trimmed.startsWith('+')) {
                    displayValue = '+' + trimmed;
                }
            }

            html += `<p><strong>${labelText}:</strong> ${displayValue}</p>`;
        });

        summaryDiv.innerHTML = html;
        modal.style.display = 'flex';
        console.log('[FORM_TEST_MODE] Submit bypassed validations, built summary from raw values.');
        return; // skip the full validation below
    }

        const pwd = gameFields.password;
        if (!pwd || !pwd.value.trim()) {
            if (!FORM_ALLOW_EMPTY) {
                pwd && pwd.focus();
                return;
            }
        }

        const confirmNums = [1, 2, 3];
        let anyConfirmUsed = false;

        for (const i of confirmNums) {
            const input = window.confirmPasswordInputs[i];
            if (!input) continue;

            const val = input.value.trim();
            const group = document.getElementById(`confirmPassword${i}-group`);
            const isVisible = !group || group.style.display !== 'none';

            if (val && isVisible) {
                anyConfirmUsed = true;
            }
        }

        if (anyConfirmUsed) {
            for (const i of confirmNums) {
                const input = window.confirmPasswordInputs[i];
                if (!input) continue;

                const group = document.getElementById(`confirmPassword${i}-group`);
                const isVisible = !group || group.style.display !== 'none';
                const val = input.value.trim();

                // If this confirm is visible and empty → block
                if (isVisible && !val && !FORM_ALLOW_EMPTY) {
                    input.focus();
                    return;
                }

                // If it has a value but doesn't match → validateConfirmPassword shows error
                if (val && !window.validateConfirmPassword(i)) {
                    input.focus();
                    return;
                }
            }
        }

    // Names
    if (!FORM_ALLOW_EMPTY || gameFields.firstName.value.trim()) {
        if (window.validateFirstNameLive && !window.validateFirstNameLive()) {
            gameFields.firstName.focus();
            return;
        }
    }
    if (!FORM_ALLOW_EMPTY || gameFields.lastName.value.trim()) {
        if (window.validateLastNameLive && !window.validateLastNameLive()) {
            gameFields.lastName.focus();
            return;
        }
    }

    // Gender
    if (!FORM_ALLOW_EMPTY || gameFields.gender.value.trim()) {
        if (window.validateGenderLive && !window.validateGenderLive()) {
            gameFields.gender.focus();
            return;
        }
    }

    // Age / Phone
    if (!FORM_ALLOW_EMPTY || gameFields.age.value.trim()) {
        if (window.validateAgeLive && !window.validateAgeLive()) {
            gameFields.age.focus();
            return;
        }
    }
    if (!FORM_ALLOW_EMPTY || gameFields.phoneNumber.value.trim()) {
        if (window.validatePhoneLive && !window.validatePhoneLive()) {
            gameFields.phoneNumber.focus();
            return;
        }
    }

    // Emails
    if (!FORM_ALLOW_EMPTY || gameFields.email.value.trim() || gameFields.recoveryEmail.value.trim()) {
        if (window.validateEmailLive && !window.validateEmailLive()) {
            if (gameFields.email.value.trim()) {
                gameFields.email.focus();
            } else {
                gameFields.recoveryEmail.focus();
            }
            return;
        }
    }

    // Address
    if (!FORM_ALLOW_EMPTY || gameFields.address.value.trim()) {
        if (window.validateAddressLive && !window.validateAddressLive()) {
            gameFields.address.focus();
            return;
        }
    }

    //    Build a "decoded" view of the form without changing the inputs
    //    - For binaryCode fields: decode 0/1 to text
    //    - For others: use input.value as-is
    const decodedValues = {};
    Object.keys(gameFields).forEach(fieldId => {
        const input = gameFields[fieldId];
        const type = assignedTypes[fieldId];
        if (!input) return;

        const raw = input.value; // what the user actually sees

        if (type && type.key === 'binaryCode') {
            decodedValues[fieldId] = binaryToText(raw);
        } else if (type && type.key === 'morseCode') {
            decodedValues[fieldId] = morseToText(raw);
        } else {
            decodedValues[fieldId] = raw;
        }
    });

    //  Validate numbersByWords fields on the RAW text (what the user typed)
    let numbersByWordsError = null;
    Object.keys(gameFields).forEach(fieldId => {
        const input = gameFields[fieldId];
        const type = assignedTypes[fieldId];
        if (!input || !type) return;

        if (type.key === 'numbersByWords') {
            if (!isNumbersByWordsValid(input.value)) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                const labelText = label ? label.textContent : fieldId;
                numbersByWordsError = `Field "${labelText}" must contain only lowercase number words (zero–nine).`;
            }
        }
    });

    if (numbersByWordsError) {
        alert(numbersByWordsError);
        return; // leave everything as typed
    }

    //    Build another view with "converted" values for nice display:
    //    - numbersByWords: convert "one two" -> "12"
    //    - others: use decodedValues
    const finalDisplayValues = {};
    Object.keys(gameFields).forEach(fieldId => {
        const input = gameFields[fieldId];
        const type = assignedTypes[fieldId];
        if (!input) return;

        const decoded = decodedValues[fieldId];

        if (type && type.key === 'numbersByWords') {
            finalDisplayValues[fieldId] = wordsToDigits(input.value);
        } else if (type && type.key === 'ageDropdown') {
            // convert "fifty eight" -> "58"
            const num = ageWordsToNumber(input.value); // defined in helpers.js or games.js
            finalDisplayValues[fieldId] = (num !== null) ? String(num) : '';
        } else {
            finalDisplayValues[fieldId] = decoded;
        }
    });

    //  Validate name fields, allow only letters and spaces
    const nameFields = ['firstName', 'lastName'];
    for (const fieldId of nameFields) {
        const input = gameFields[fieldId];
        if (!input) continue;

        const value = (finalDisplayValues[fieldId] || '').trim();
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent : fieldId;

        if (!value && !FORM_ALLOW_EMPTY) {
            alert(`Your ${labelText} cannot be empty.`);
            return;
        }

        // Allow letters and spaces only
        if (!/^[A-Za-z ]+$/.test(value)) {
            alert(`Your ${labelText} contains invalid characters.`);
            return;
        }
    }

    // Validate gender: only letters (and spaces), no digits or special characters
   const gender = ['gender'];
    for (const fieldId of gender) {
        const input = gameFields[fieldId];
        if (!input) continue;

        const value = (finalDisplayValues[fieldId] || '').trim();
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent : fieldId;

        if (!value && !FORM_ALLOW_EMPTY) {
            alert(`Your ${labelText} cannot be empty.`);
            return;
        }

        // Allow letters and spaces only
        if (!/^[A-Za-z ]+$/.test(value)) {
            alert(`Your ${labelText} contains invalid characters.`);
            return;
        }
    }

    //  Validate age and phoneNumber: after decoding/conversion they must be digits only
    const numericFields = ['age', 'phoneNumber'];

    for (const fieldId of numericFields) {
        const input = gameFields[fieldId];
        if (!input) continue;

        // Use the final display value for validation
        const value = (finalDisplayValues[fieldId] || '').trim();
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent : fieldId;

        if (!value && !FORM_ALLOW_EMPTY) {
            alert(`Your ${labelText} cannot be empty.`);
            return;
        }

        if (!/^\d+$/.test(value)) {
            alert(`Your ${labelText} must be a number.`);
            return;
        }

        if (fieldId === 'phoneNumber') {
            if (!/^\d+$/.test(value)) {
                alert(`Your ${labelText} must contain only digits.`);
                return;
            }
            if (value.length < 3 || value.length > 15) {
                alert(`Your Phone Number isn't valid.`);
                return;
            }
        }
    }

    //  Validate emails using decoded values (binary emails become text here)
    const emailFields = ['email', 'recoveryEmail'];
    for (const fieldId of emailFields) {
        const input = gameFields[fieldId];
        if (!input) continue;

        const value = (decodedValues[fieldId] || '').trim();
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent : 'email';

        if (!value && !FORM_ALLOW_EMPTY) {
            alert(`Your ${labelText} cannot be empty.`);
            return;
        }

        if (!isValidEmail(value)) {
            alert(`Your ${labelText} isn't valid.`);
            return;
        }
    }

    //  Validate that age matches birth date

    {
        const ageStr = (finalDisplayValues['age'] || '').trim();
        const birthStr = (finalDisplayValues['birthDate'] || '').trim();

        if (ageStr && birthStr) {
            const ageNum = parseInt(ageStr, 10);
            if (isNaN(ageNum)) {
                alert('Your Age must be a number.');
                return; // stop, do not show summary
            }

            const computedAge = calculateAgeFromDateString(birthStr);
            if (computedAge === null) {
                alert('Your Birth Date is not valid.');
                return; // stop
            }

            const tolerance = 0; // or 1 if you want off-by-one allowed
            if (Math.abs(computedAge - ageNum) > tolerance) {
                alert(`Your Age doesn't match your Birth Date.`);
                return; // stop here
            }
        }
    }


    //  All validation passed; build summary using finalDisplayValues
    let html = '';
    Object.keys(gameFields).forEach(fieldId => {
        const input = gameFields[fieldId];
        if (!input) return;
        const label = document.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent : fieldId;
        let displayValue = finalDisplayValues[fieldId] ?? input.value;
        if (fieldId === 'phoneNumber') {
            // Prepend a + only if not already present
            const trimmed = (displayValue || '').trim();
            if (trimmed && !trimmed.startsWith('+')) {
                displayValue = '+' + trimmed;
            }
        }
        html += `<p><span class="summary-label">${labelText}:</span> ${displayValue}</p>`;
    });

    summaryDiv.innerHTML = html;
    modal.style.display = 'flex';
});


// Back button: close popup and allow editing
confirmBackBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Confirm button: final submit (you can replace alert with real submit logic)
confirmSubmitBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    // Here you could send data to a server. For now:
    alert('Form finally submitted!');
    // You could also reset:
    // form.reset();
});
// Confirm button: final submit (you can replace alert with real submit logic)
confirmSubmitBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    // Mark that the user completed registration so index can show an award
    try { localStorage.setItem('ikbw_award', 'true'); } catch (e) { /* ignore */ }
    // Here you could send data to a server. For now:
    alert('Form finally submitted!');
    // You could also reset:
    // form.reset();
});