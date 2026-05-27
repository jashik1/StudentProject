const confirmPasswordInputs = {
    1: document.getElementById('confirmPassword1'),
    2: document.getElementById('confirmPassword2'),
    3: document.getElementById('confirmPassword3')
};

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        console.log('confirmPassword.js loaded');

        assignConfirmPasswordTypes();
        console.log('Types assigned:', confirmPasswordSegments);

        // Apply types to confirm password inputs
        confirmPasswordSegments.forEach(segment => {
            segment.fields.forEach(fieldNum => {
                const input = confirmPasswordInputs[fieldNum];
                const typeKey = segment.typeKey;

                console.log(`Applying ${typeKey} to field ${fieldNum}`);

                if (typeKey === 'scrambledKeyboard') {
                    input.placeholder = 'Type using the on-screen keyboard';
                    input.classList.add('type-scrambled-keyboard');
                    if (window.scrambledKeyboardAttach) {
                        window.scrambledKeyboardAttach(input);
                    }
                } else if (typeKey === 'binaryCode') {
                    input.placeholder = 'Enter text using Binary code (0 and 1 only)';
                    input.classList.add('type-binary-code');
                    input.addEventListener('keydown', function (e) {
                        if (['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) return;
                        if (e.key !== '0' && e.key !== '1') e.preventDefault();
                    });
                } else if (typeKey === 'oldPhoneKeypad') {
                    input.placeholder = 'Use your number keypad to write (1 = !?.,1, 2 = abc2, 3 = def3 ... 0 = space0)';
                    input.classList.add('type-old-phone-keypad');

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

                    let lastKey = null;
                    let lastTime = 0;
                    let pressIndex = 0;
                    const timeout = 800;

                    input.addEventListener('keydown', function (e) {
                        if (['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) return;
                        if (!map[e.key]) { e.preventDefault(); return; }
                        e.preventDefault();
                        const now = Date.now();

                        if (e.key !== lastKey || now - lastTime > timeout) {
                            input.value = input.value + map[e.key][0];
                            pressIndex = 0;
                        } else {
                            pressIndex = (pressIndex + 1) % map[e.key].length;
                            input.value = input.value.slice(0, -1) + map[e.key][pressIndex];
                        }

                        lastKey = e.key;
                        lastTime = now;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    });

                    input.addEventListener('blur', function () {
                        lastKey = null;
                        pressIndex = 0;
                    });
                } else if (typeKey === 'morseCode') {
                    input.placeholder = 'Enter text using Morse code (. and - only)';
                    input.classList.add('type-morse-code');
                    input.addEventListener('keydown', function (e) {
                        const allowedCtrl = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Home', 'End'];
                        if (allowedCtrl.includes(e.key)) return;
                        if (e.ctrlKey || e.metaKey || e.altKey) return;
                        if (e.key === '.' || e.key === '-' || e.key === ' ') return;
                        e.preventDefault();
                    });
                    input.addEventListener('paste', function (e) { e.preventDefault(); });
                }
            });
        });

        // Validation logic
        function getDecryptedValue(value, typeKey) {
            console.log(`Decrypting value "${value}" with type ${typeKey}`);
            if (typeKey === 'binaryCode') {
                const result = binaryToText(value);
                console.log(`Binary decoded to: "${result}"`);
                return result;
            }
            if (typeKey === 'morseCode') {
                const result = morseToText(value);
                console.log(`Morse decoded to: "${result}"`);
                return result;
            }
            return value;
        }

        function validateConfirmPassword(fieldNum) {
            const input = confirmPasswordInputs[fieldNum];
            const errorDiv = document.getElementById(`confirmPassword${fieldNum}-error`);
            const typeKey = getConfirmPasswordTypeKey(parseInt(fieldNum, 10));

            console.log(`Validating field ${fieldNum}, type: ${typeKey}`);

            if (!input) {
                console.error(`Input not found for field ${fieldNum}`);
                return false;
            }

            const raw = input.value || '';
            const trimmed = raw.trim();

            if (!trimmed) {
                errorDiv.style.display = 'none';
                input.classList.remove('error');
                return false;
            }

            if (!gameFields.password.value) {
                errorDiv.textContent = 'Enter a password first';
                errorDiv.style.display = 'block';
                return false;
            }

            const passwordType = assignedTypes['password'];
            const mainPassword = getDecryptedValue(gameFields.password.value, passwordType?.key);
            const confirmValue = getDecryptedValue(raw, typeKey);

            console.log(`  Main password decrypted: "${mainPassword}"`);
            console.log(`  Confirm decrypted: "${confirmValue}"`);
            console.log(`  Match: ${confirmValue === mainPassword}`);

            if (confirmValue !== mainPassword) {
                errorDiv.textContent = 'Passwords do not match';
                errorDiv.style.display = 'block';
                input.classList.add('error');
                return false;
            }

            errorDiv.style.display = 'none';
            input.classList.remove('error');
            return true;
        }

        // Expose to global so main.js can use them
        window.confirmPasswordInputs = confirmPasswordInputs;
        window.validateConfirmPassword = validateConfirmPassword;

        // Add input listeners to each confirm password field
        Object.keys(confirmPasswordInputs).forEach(num => {
            const input = confirmPasswordInputs[num];

            input.addEventListener('input', () => {
                console.log(`\n=== Input event on field ${num} ===`);
                console.log(`Current value: "${input.value}"`);

                if (input.value.length > 0) {
                    const isValid = validateConfirmPassword(num);
                    console.log(`Validation result: ${isValid}`);

                    if (isValid && gameFields.password.value) {
                        const current = parseInt(num, 10);
                        if (current < 3) {
                            const nextNum = current + 1;
                            const nextGroup = document.getElementById(`confirmPassword${nextNum}-group`);
                            const nextInput = confirmPasswordInputs[nextNum];
                            if (nextGroup && nextInput) {
                                console.log(`Showing field ${nextNum}`);
                                nextGroup.style.display = 'block';
                                nextInput.required = true;
                                nextInput.focus();
                            }
                        }
                    }
                }
            });
        });

        // Revalidate confirms when main password changes
        gameFields.password.addEventListener('input', () => {
            console.log('Password field changed');
            for (let i = 1; i <= 3; i++) {
                const input = confirmPasswordInputs[i];
                if (input.value) validateConfirmPassword(i);
            }
        });

    }, 100);
});