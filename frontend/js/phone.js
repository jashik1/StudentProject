document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = window.gameFields?.phoneNumber || document.getElementById('phoneNumber');
    const phoneErr   = document.getElementById('phoneNumber-error');
    if (!phoneInput || !phoneErr) return;

    function validatePhoneLive() {
        const type = window.assignedTypes && window.assignedTypes.phoneNumber;
        const raw = window.getLiveRawValue ? window.getLiveRawValue('phoneNumber') : (phoneInput.value || '');
        const trimmedRaw = raw.trim();

        if (!trimmedRaw) {
            phoneErr.style.display = 'none';
            phoneErr.textContent = '';
            phoneInput.classList.remove('error');
            return true;
        }

        if (type && type.key === 'numbersByWords') {
            if (!isNumbersByWordsValid(trimmedRaw)) {
                phoneErr.textContent = 'Use number words "zero" to "nine" only.';
                phoneErr.style.display = 'block';
                phoneInput.classList.add('error');
                return false;
            }
            // words look ok; final numeric checks happen in main.js
            phoneErr.style.display = 'none';
            phoneErr.textContent = '';
            phoneInput.classList.remove('error');
            return true;
        }

        // For other types, validate final numeric string
        const finalVal = (window.getLiveFinalValue ? window.getLiveFinalValue('phoneNumber') : trimmedRaw).trim();

        if (!/^\d+$/.test(finalVal)) {
            phoneErr.textContent = 'Phone must contain only digits.';
            phoneErr.style.display = 'block';
            phoneInput.classList.add('error');
            return false;
        }
        if (finalVal.length < 3 || finalVal.length > 15) {
            phoneErr.textContent = 'Phone Number is not valid.';
            phoneErr.style.display = 'block';
            phoneInput.classList.add('error');
            return false;
        }

        phoneErr.style.display = 'none';
        phoneErr.textContent = '';
        phoneInput.classList.remove('error');
        return true;
    }

    phoneInput.addEventListener('input', validatePhoneLive);
    window.validatePhoneLive = validatePhoneLive;
});