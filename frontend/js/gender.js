document.addEventListener('DOMContentLoaded', () => {
    const genderInput = window.gameFields?.gender || document.getElementById('gender');
    const genderErr   = document.getElementById('gender-error');
    if (!genderInput || !genderErr) return;

    function validateGenderField() {
        const decoded = (window.getLiveDecodedValue ? window.getLiveDecodedValue('gender') : genderInput.value || '').trim();

        if (!decoded) {
            genderErr.style.display = 'none';
            genderErr.textContent = '';
            genderInput.classList.remove('error');
            return true;
        }

        if (!/^[A-Za-z ]+$/.test(decoded)) {
            genderErr.textContent = 'Gender contains invalid characters';
            genderErr.style.display = 'block';
            genderInput.classList.add('error');
            return false;
        }

        genderErr.style.display = 'none';
        genderErr.textContent = '';
        genderInput.classList.remove('error');
        return true;
    }

    genderInput.addEventListener('input', validateGenderField);
    window.validateGenderLive = validateGenderField;
});