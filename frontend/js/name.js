document.addEventListener('DOMContentLoaded', function () {
    const firstInput = window.gameFields?.firstName || document.getElementById('firstName');
    const lastInput  = window.gameFields?.lastName  || document.getElementById('lastName');
    const firstErr   = document.getElementById('firstName-error');
    const lastErr    = document.getElementById('lastName-error');

    if (!firstInput && !lastInput) return;

    function validateOneName(fieldId, input, errEl) {
        if (!input || !errEl) return true;

        const decoded = (window.getLiveDecodedValue
            ? window.getLiveDecodedValue(fieldId)
            : (input.value || '')
        ).trim();

        if (!decoded) {
            errEl.style.display = 'none';
            errEl.textContent = '';
            input.classList.remove('error');
            return true;
        }

        if (!/^[A-Za-z ]+$/.test(decoded)) {
            errEl.textContent = 'Name contains invalid characters';
            errEl.style.display = 'block';
            input.classList.add('error');
            return false;
        }

        errEl.style.display = 'none';
        errEl.textContent = '';
        input.classList.remove('error');
        return true;
    }

    if (firstInput && firstErr) {
        firstInput.addEventListener('input', () =>
            validateOneName('firstName', firstInput, firstErr)
        );
    }
    if (lastInput && lastErr) {
        lastInput.addEventListener('input', () =>
            validateOneName('lastName', lastInput, lastErr)
        );
    }

    window.validateFirstNameLive = () =>
        validateOneName('firstName', firstInput, firstErr);
    window.validateLastNameLive  = () =>
        validateOneName('lastName',  lastInput,  lastErr);
});