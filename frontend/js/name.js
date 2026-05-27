document.addEventListener('DOMContentLoaded', function () {
    // Live validation for first and last name: no digits or symbol characters.
    // Uses the same visual style as confirm-password errors (`.confirm-error`).

    const firstInput = window.gameFields?.firstName || document.getElementById('firstName');
    const lastInput = window.gameFields?.lastName || document.getElementById('lastName');
    const firstErr = document.getElementById('firstName-error');
    const lastErr = document.getElementById('lastName-error');

    if (!firstInput && !lastInput) return;

    function tryDecodeBinary(raw) {
        if (!raw) return { ok: true, value: '' };
        const s = raw.trim();
        if (/[^01\s]/.test(s)) return { ok: false, reason: 'Invalid binary' };
        const chunks = s.includes(' ') ? s.split(/\s+/) : (s.match(/.{1,8}/g) || []);
        if (chunks.length === 0) return { ok: false, reason: 'Invalid binary' };
        if (!s.includes(' ') && s.length % 8 !== 0) return { ok: false, reason: 'invalid binary' };
        let out = '';
        for (const chunk of chunks) {
            if (chunk.length !== 8) return { ok: false, reason: 'Invalid binary' };
            if (/[^01]/.test(chunk)) return { ok: false, reason: 'Invalid binary' };
            out += String.fromCharCode(parseInt(chunk, 2));
        }
        return { ok: true, value: out };
    }

    function tryDecodeMorse(raw) {
        if (!raw) return { ok: true, value: '' };
        const s = raw.trim();
        if (/[^.\-\s\/]/.test(s)) return { ok: false, reason: 'Invalid morse code' };
        const decoded = morseToText(s);
        if (decoded.indexOf('?') !== -1) return { ok: false, reason: 'Invalid morse code' };
        return { ok: true, value: decoded };
    }

    function validateNameField(input, errEl) {
        if (!input || !errEl) return;
        const raw = (input.value || '').trim();
        if (!raw) {
            errEl.style.display = 'none';
            errEl.textContent = '';
            input.classList.remove('error');
            return;
        }

        // If the raw input looks like binary or morse, try decoding it regardless
        const isBinaryLike = /^[01\s]+$/.test(raw);
        const isMorseLike = /^[.\-\s\/]+$/.test(raw);

        if (isBinaryLike) {
            const res = tryDecodeBinary(raw);
            if (!res.ok) {
                errEl.textContent = res.reason;
                errEl.style.display = 'block';
                input.classList.add('error');
                return;
            }
            const decoded = res.value.trim();
            if (!/^[A-Za-z ]+$/.test(decoded)) {
                errEl.textContent = 'Name contains invalid characters';
                errEl.style.display = 'block';
                input.classList.add('error');
                return;
            }
            errEl.style.display = 'none'; errEl.textContent = ''; input.classList.remove('error');
            return;
        }

        if (isMorseLike) {
            const res = tryDecodeMorse(raw);
            if (!res.ok) {
                errEl.textContent = res.reason;
                errEl.style.display = 'block';
                input.classList.add('error');
                return;
            }
            const decoded = res.value.trim();
            if (!/^[A-Za-z ]+$/.test(decoded)) {
                errEl.textContent = 'Name contains invalid characters';
                errEl.style.display = 'block';
                input.classList.add('error');
                return;
            }
            errEl.style.display = 'none'; errEl.textContent = ''; input.classList.remove('error');
            return;
        }

        // Default: validate raw input (oldPhoneKeypad and scrambled keyboard already produce letters)
        const ok = /^[A-Za-z ]+$/.test(raw);
        if (!ok) {
            errEl.textContent = 'Name contains invalid characters';
            errEl.style.display = 'block';
            input.classList.add('error');
        } else {
            errEl.style.display = 'none';
            errEl.textContent = '';
            input.classList.remove('error');
        }
    }

    if (firstInput && firstErr) {
        firstInput.addEventListener('input', () => validateNameField(firstInput, firstErr));
    }
    if (lastInput && lastErr) {
        lastInput.addEventListener('input', () => validateNameField(lastInput, lastErr));
    }
});
