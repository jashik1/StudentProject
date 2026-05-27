(function () {

    // --- Pre-taken name lists ---

    const easterEggTaken = new Set([
        'jashik1', 'jashik', 'jachym', 'toni', 'tony', 't_eno', 'brackentavis'
    ].map(s => s.toLowerCase()));

    // Generate all 1-char combos (a-z, 0-9)
    const oneCombos = [];
    for (let c = 97; c <= 122; c++) oneCombos.push(String.fromCharCode(c)); // a-z
    for (let d = 0; d <= 9; d++) oneCombos.push(String(d));                 // 0-9

    // Generate all 3-char combos (a-z, 0-9) — 36^3 = 46,656 entries
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const threeCombos = [];
    for (let i = 0; i < chars.length; i++)
        for (let j = 0; j < chars.length; j++)
            for (let k = 0; k < chars.length; k++)
                threeCombos.push(chars[i] + chars[j] + chars[k]);

    const preTakenSet = new Set([...oneCombos, ...threeCombos, ...easterEggTaken]);

    function isPreTaken(name) {
        return preTakenSet.has(name.toLowerCase());
    }

    // --- State ---

    // Usernames the player has gotten "taken" on (non-pre-taken ones)
    const playerTakenNames = new Set();
    let takenCount = 0;          // how many non-pre-taken "taken" results so far
    let availableReached = false; // whether we've shown "available" once

    let checkTimer = null;
    const CHECK_DELAY = 2000; // ms before showing result

    // --- DOM setup ---

    document.addEventListener('DOMContentLoaded', function () {
        const input = gameFields.username;
        if (!input) return;

        // Prefer the existing markup placeholders so CSS classes apply
        const errEl = document.getElementById('username-error');
        const goodEl = document.getElementById('username-good');

        // If page didn't provide them, create a fallback status element
        let fallback = null;
        if (!errEl && !goodEl) {
            fallback = document.createElement('div');
            fallback.id = 'username-status';
            fallback.style.cssText = 'font-size:12px; margin-top:4px; display:none;';
            input.parentNode.insertBefore(fallback, input.nextSibling);
        }

        // type: 'error' | 'good' | 'info'
        function setStatus(text, type) {
            // Clear both targets
            if (errEl) {
                errEl.textContent = '';
                errEl.style.display = 'none';
                errEl.classList.remove('username-error', 'username-info');
                errEl.style.color = '';
            }
            if (goodEl) {
                goodEl.textContent = '';
                goodEl.style.display = 'none';
                goodEl.classList.remove('username-good');
                goodEl.style.color = '';
            }
            if (fallback) {
                fallback.textContent = '';
                fallback.style.display = 'none';
                fallback.classList.remove('username-error', 'username-good', 'username-info');
                fallback.style.color = '';
            }

            if (type === 'error') {
                if (errEl) {
                    errEl.textContent = text;
                    errEl.classList.add('username-error');
                    errEl.style.display = 'block';
                } else if (fallback) {
                    fallback.textContent = text;
                    fallback.classList.add('username-error');
                    fallback.style.display = 'block';
                }
            } else if (type === 'good') {
                if (goodEl) {
                    goodEl.textContent = text;
                    goodEl.classList.add('username-good');
                    goodEl.style.display = 'block';
                } else if (fallback) {
                    fallback.textContent = text;
                    fallback.classList.add('username-good');
                    fallback.style.display = 'block';
                }
            } else {
                // info / neutral: use username-info class so CSS variables apply
                if (errEl) {
                    errEl.textContent = text;
                    errEl.classList.add('username-info');
                    errEl.style.display = 'block';
                } else if (fallback) {
                    fallback.textContent = text;
                    fallback.classList.add('username-info');
                    fallback.style.display = 'block';
                }
            }
        }

        function clearStatus() {
            if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; errEl.classList.remove('username-info'); errEl.style.color = ''; }
            if (goodEl) { goodEl.style.display = 'none'; goodEl.textContent = ''; }
            if (fallback) { fallback.style.display = 'none'; fallback.textContent = ''; fallback.classList.remove('username-info'); fallback.style.color = ''; }
        }

        function tryDecodeBinary(raw) {
            if (!raw) return { ok: true, value: '' };
            const s = raw.trim();
            if (/[^01\s]/.test(s)) return { ok: false, reason: 'invalid binary' };
            const chunks = s.includes(' ') ? s.split(/\s+/) : (s.match(/.{1,8}/g) || []);
            if (chunks.length === 0) return { ok: false, reason: 'invalid binary' };
            if (!s.includes(' ') && s.length % 8 !== 0) return { ok: false, reason: 'invalid binary' };
            let out = '';
            for (const chunk of chunks) {
                if (chunk.length !== 8) return { ok: false, reason: 'invalid binary' };
                if (/[^01]/.test(chunk)) return { ok: false, reason: 'invalid binary' };
                out += String.fromCharCode(parseInt(chunk, 2));
            }
            return { ok: true, value: out };
        }

        function tryDecodeMorse(raw) {
            if (!raw) return { ok: true, value: '' };
            const s = raw.trim();
            if (/[^.\-\s\/]/.test(s)) return { ok: false, reason: 'invalid morse code' };
            const decoded = morseToText(s);
            if (decoded.indexOf('?') !== -1) return { ok: false, reason: 'invalid morse code' };
            return { ok: true, value: decoded };
        }

        // Try decoding input as binary or morse when it looks like those formats.
        // Returns {ok, value, reason?}
        function tryDecodeUsername(raw) {
            if (!raw) return { ok: true, value: '' };

            // If user typed only 0/1 and spaces -> binary-like
            const isBinaryLike = /^[01\s]+$/.test(raw.trim());
            // If user typed only dots/dashes/slashes/spaces -> morse-like
            const isMorseLike = /^[.\-\s\/]+$/.test(raw.trim());

            // If explicitly assigned type exists, prefer that decoder
            const assigned = assignedTypes['username'];
            if (assigned && assigned.key === 'binaryCode') return tryDecodeBinary(raw);
            if (assigned && assigned.key === 'morseCode') return tryDecodeMorse(raw);

            if (isBinaryLike) return tryDecodeBinary(raw);
            if (isMorseLike) return tryDecodeMorse(raw);

            // Not encoded, return as-is
            return { ok: true, value: raw };
        }

        function triggerCheck(raw) {
            if (!raw) { clearStatus(); return; }

            if (checkTimer) clearTimeout(checkTimer);
            checkTimer = setTimeout(function () {
                const dec = tryDecodeUsername(raw);
                    if (!dec.ok) { setStatus(dec.reason, 'error'); return; }
                    const name = (dec.value || '').trim().toLowerCase();
                    if (!name) { clearStatus(); return; }

                // Pre-taken: always "taken", doesn't count toward the 3
                if (isPreTaken(name)) {
                    setStatus('✗ Username taken', 'error');
                    return;
                }

                // Already gotten "taken" on this name before (player's own taken list)
                if (playerTakenNames.has(name)) {
                    setStatus('✗ Username taken', 'error');
                    return;
                }

                // If we've already reached "available", any new valid name is also available
                if (availableReached) {
                    setStatus('✓ Username available!', 'good');
                    return;
                }

                // Still need 3 "taken" results
                    if (takenCount < 3) {
                    playerTakenNames.add(name);
                    takenCount++;
                    setStatus('✗ Username taken', 'error');
                    return;
                }

                // takenCount === 3: this one is finally available
                availableReached = true;
                setStatus('✓ Username available!', 'good');

            }, CHECK_DELAY);
        }

        input.addEventListener('input', function () {
            // Reset timer if already checking, handles both real keypresses and synthetic events (phone keypad, scrambled keyboard)
            if (checkTimer) {
                clearTimeout(checkTimer);
                checkTimer = null;
            }

            const raw = input.value;
            if (!raw) {
                clearStatus();
                return;
            }

            setStatus('Checking availability...', 'info');
            triggerCheck(raw);
        });
    });

})();