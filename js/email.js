document.addEventListener('DOMContentLoaded', () => {
    const emailInp = window.gameFields?.email || document.getElementById('email');
    const recInp   = window.gameFields?.recoveryEmail || document.getElementById('recoveryEmail');
    const emailErr = document.getElementById('email-error');
    const recErr   = document.getElementById('recoveryEmail-error');

    if (!emailInp && !recInp) return;

    function validateSingleEmail(fieldId, input, errEl) {
        if (!input || !errEl) return true;

        const decoded = (window.getLiveDecodedValue
            ? window.getLiveDecodedValue(fieldId)
            : (input.value || '')
        ).trim();

        console.log('[EmailLive]', fieldId, 'decoded:', decoded);

        if (!decoded) {
            errEl.style.display = 'none';
            errEl.textContent = '';
            input.classList.remove('error');
            return true;
        }

        if (!isValidEmail(decoded)) {
            errEl.textContent = 'Email is not valid.';
            errEl.style.display = 'block';
            input.classList.add('error');
            return false;
        }

        errEl.style.display = 'none';
        errEl.textContent = '';
        input.classList.remove('error');
        return true;
    }

    if (emailInp && emailErr) {
        emailInp.addEventListener('input', () =>
            validateSingleEmail('email', emailInp, emailErr)
        );
    }
    if (recInp && recErr) {
        recInp.addEventListener('input', () =>
            validateSingleEmail('recoveryEmail', recInp, recErr)
        );
    }

    window.validateEmailLive = function () {
        const ok1 = validateSingleEmail('email', emailInp, emailErr);
        const ok2 = validateSingleEmail('recoveryEmail', recInp, recErr);
        return ok1 && ok2;
    };
});