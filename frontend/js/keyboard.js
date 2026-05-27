const keyAmount = 20;
(function () {
    const chars = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '@', '.', ',', ';', '\'', '"', '/', '\\', '-', '_', '+', '=', '?', '!', '#', '$', '%', '&', '*', '(', ')',
        'č', 'š', 'ž', 'ý', 'ě'
    ];

    const keyboardEl = document.createElement('div');
    keyboardEl.id = 'scrambled-keyboard';
    keyboardEl.className = 'scrambled-keyboard';
    keyboardEl.setAttribute('aria-hidden', 'true');

    // append inside container so we can position relative to it
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(keyboardEl);
    } else {
        document.body.appendChild(keyboardEl); // fallback
    }

    // prevent keyboard from stealing focus
    keyboardEl.addEventListener('pointerdown', e => e.preventDefault());

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // pick n distinct random characters (no duplicates)
    function sampleWithoutReplacement(arr, n) {
        const copy = arr.slice();
        shuffle(copy);
        return copy.slice(0, Math.min(n, copy.length));
    }

    function buildLayout() {
        keyboardEl.innerHTML = '';

        // mainRow: grid of 10 random characters
        const mainRow = document.createElement('div');
        mainRow.style.display = 'grid';
        mainRow.style.gridTemplateColumns = 'repeat(10, 36px)';
        mainRow.style.gap = '6px';
        mainRow.style.marginBottom = '6px';

        // controlRow: single row of control buttons
        const controlRow = document.createElement('div');
        controlRow.style.display = 'grid';
        controlRow.style.gridTemplateColumns = 'repeat(5, auto)';
        controlRow.style.gap = '6px';

        const layout = sampleWithoutReplacement(chars, keyAmount);
        layout.forEach(k => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = k;
            b.dataset.key = k;
            mainRow.appendChild(b);
        });

        ['Backspace', 'Space', 'Clear', 'Shuffle', 'Close'].forEach(label => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = label;
            b.dataset.key = label;
            controlRow.appendChild(b);
        });

        keyboardEl.appendChild(mainRow);
        keyboardEl.appendChild(controlRow);
    }

    let activeInput = null;

    function showFor(input) {
        activeInput = input;
        keyboardEl.style.display = 'block';

        const rect = input.getBoundingClientRect();
        const container = document.querySelector('.container');
        const containerRect = container
            ? container.getBoundingClientRect()
            : { left: 0, top: 0 };

        const topPx = rect.bottom - containerRect.top + 8; // px
        const fieldCenter = (rect.left + rect.right) / 2 - containerRect.left; // px

        // use rem units so keyboard scales with root font-size
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

        // center keyboard on the input using measured width (px -> rem)
        const kbWidth = keyboardEl.offsetWidth || 320; // px fallback
        let leftPx = fieldCenter - (kbWidth / 2);

        // clamp within container width
        const containerWidth = containerRect.width || window.innerWidth;
        const MIN_MARGIN_PX = 8;
        const maxLeftPx = Math.max(0, containerWidth - kbWidth - MIN_MARGIN_PX);
        if (leftPx < MIN_MARGIN_PX) leftPx = MIN_MARGIN_PX;
        if (leftPx > maxLeftPx) leftPx = maxLeftPx;

        // horizontal nudge in rem (increase to move further right)
        const H_SHIFT_REM = 13;

        keyboardEl.style.top = (topPx / rootFontSize) + 'rem';
        keyboardEl.style.left = (leftPx / rootFontSize + H_SHIFT_REM) + 'rem';

        keyboardEl.setAttribute('aria-hidden', 'false');

        // let the browser apply display/top/left, then animate to visible
        requestAnimationFrame(() => {
            keyboardEl.classList.add('visible');
        });
    }

    function hide() {
        keyboardEl.classList.remove('visible');
        keyboardEl.setAttribute('aria-hidden', 'true');
        activeInput = null;
        setTimeout(() => {
            if (!keyboardEl.classList.contains('visible')) {
                keyboardEl.style.display = 'none';
            }
        }, 200);
    }

    // Button handling
    keyboardEl.addEventListener('pointerup', (ev) => {
        const btn = ev.target.closest('button');
        if (!btn) return;

        if (!activeInput) {
            const ae = document.activeElement;
            if (ae && ae.classList && ae.classList.contains('type-scrambled-keyboard')) {
                activeInput = ae;
            } else {
                const any = document.querySelector('.type-scrambled-keyboard');
                if (any) activeInput = any; else return;
            }
        }

        const key = btn.dataset.key;

        if (key === 'Shuffle') { buildLayout(); return; }
        if (key === 'Close') { hide(); activeInput?.focus(); return; }
        if (key === 'Clear') { activeInput.value = ''; activeInput?.focus(); return; }

        activeInput.focus();

        const supportsSelection =
            typeof activeInput.selectionStart === 'number' &&
            typeof activeInput.selectionEnd === 'number' &&
            typeof activeInput.setSelectionRange === 'function';

        const start = supportsSelection ? activeInput.selectionStart : activeInput.value.length;
        const end = supportsSelection ? activeInput.selectionEnd : start;

        if (key === 'Backspace') {
            if (supportsSelection) {
                if (start !== end) {
                    try { activeInput.setRangeText('', start, end, 'end'); }
                    catch {
                        activeInput.value = activeInput.value.slice(0, start) + activeInput.value.slice(end);
                    }
                    try { activeInput.setSelectionRange(start, start); } catch { }
                } else if (start > 0) {
                    try { activeInput.setRangeText('', start - 1, end, 'end'); }
                    catch {
                        activeInput.value = activeInput.value.slice(0, start - 1) + activeInput.value.slice(end);
                    }
                    try { activeInput.setSelectionRange(start - 1, start - 1); } catch { }
                }
            } else {
                activeInput.value = activeInput.value.slice(0, -1);
            }
            activeInput.dispatchEvent(new Event('input', { bubbles: true }));
            activeInput.focus();
            return;
        }

        const ch = (key === 'Space') ? ' ' : key;

        if (supportsSelection && typeof activeInput.setRangeText === 'function') {
            try {
                activeInput.setRangeText(ch, start, end, 'end');
                const newPos = typeof activeInput.selectionStart === 'number'
                    ? activeInput.selectionStart
                    : start + ch.length;
                try { activeInput.setSelectionRange(newPos, newPos); } catch { }
            } catch {
                const before = activeInput.value.slice(0, start);
                const after = activeInput.value.slice(end);
                activeInput.value = before + ch + after;
                try {
                    const pos = before.length + ch.length;
                    activeInput.setSelectionRange(pos, pos);
                } catch { }
            }
        } else {
            activeInput.value = activeInput.value + ch;
            try {
                const len = activeInput.value.length;
                activeInput.setSelectionRange(len, len);
            } catch { }
        }
        activeInput.dispatchEvent(new Event('input', { bubbles: true }));
        activeInput.focus();
    });

    // Hide when clicking outside
    document.addEventListener('pointerdown', (ev) => {
        const tgt = ev.target;
        const isInsideKeyboard = keyboardEl.contains(tgt);
        const isScrambledInput = tgt && tgt.closest && tgt.closest('.type-scrambled-keyboard');
        if (activeInput && !isInsideKeyboard && !isScrambledInput) {
            hide();
        }
    });

    function attachToInput(input) {
        input.classList.add('type-scrambled-keyboard');

        input.addEventListener('pointerdown', function () {
            activeInput = input;
            buildLayout();
            showFor(input);
        });

        input.addEventListener('focus', function () {
            activeInput = input;
            buildLayout();
            showFor(input);
        });

        input.addEventListener('keydown', function (e) {
            const allowed = ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Home', 'End'];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length === 1) e.preventDefault();
        });

        input.addEventListener('paste', function (e) { e.preventDefault(); });
    }

    window.scrambledKeyboardAttach = attachToInput;
    buildLayout();
})();