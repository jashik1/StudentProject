document.addEventListener('DOMContentLoaded', () => {
    const ageInput = window.gameFields?.age || document.getElementById('age');
    const ageErr   = document.getElementById('age-error');
    if (!ageInput || !ageErr) return;

    function validateAgeLive() {
        const type = window.assignedTypes && window.assignedTypes.age;
        const raw = window.getLiveRawValue ? window.getLiveRawValue('age') : (ageInput.value || '');
        const trimmedRaw = raw.trim();

        if (!trimmedRaw) {
            ageErr.style.display = 'none';
            ageErr.textContent = '';
            ageInput.classList.remove('error');
            return true;
        }

        if (type && type.key === 'numbersByWords') {
            if (!isNumbersByWordsValid(trimmedRaw)) {
                ageErr.textContent = 'Use number words "zero" to "nine" only.';
                ageErr.style.display = 'block';
                ageInput.classList.add('error');
                return false;
            }
            // final numeric will be checked later
            ageErr.style.display = 'none';
            ageErr.textContent = '';
            ageInput.classList.remove('error');
            return true;
        }

        if (type && type.key === 'ageDropdown') {
            const num = ageWordsToNumber(trimmedRaw);
            if (num === null || isNaN(num)) {
                ageErr.textContent = 'Age is not valid.';
                ageErr.style.display = 'block';
                ageInput.classList.add('error');
                return false;
            }
            if (num < 1 || num > 120) {
                ageErr.textContent = 'Age is out of valid range.';
                ageErr.style.display = 'block';
                ageInput.classList.add('error');
                return false;
            }
            ageErr.style.display = 'none';
            ageErr.textContent = '';
            ageInput.classList.remove('error');
            return true;
        }

        // Other games: use final numeric string
        const finalVal = (window.getLiveFinalValue ? window.getLiveFinalValue('age') : trimmedRaw).trim();

        if (!/^\d+$/.test(finalVal)) {
            ageErr.textContent = 'Age must be a number.';
            ageErr.style.display = 'block';
            ageInput.classList.add('error');
            return false;
        }

        ageErr.style.display = 'none';
        ageErr.textContent = '';
        ageInput.classList.remove('error');
        return true;
    }

    ageInput.addEventListener('input', validateAgeLive);
    window.validateAgeLive = validateAgeLive;
});