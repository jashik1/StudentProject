// Keys for localStorage
const INFO_STATE_KEY = 'ikbw_info_state'; // "It could be worse" info state
const HAS_PLAYED_KEY = 'ikbw_has_played';

// Possible info states:
//  'initial'  -> first visit / before any login attempt
//  'loginFail'-> user attempted login at least once
//  'full'     -> user has played the game
function getInfoState() {
    const stored = localStorage.getItem(INFO_STATE_KEY);
    if (stored === 'loginFail' || stored === 'full') return stored;

    // If they've played the game once, we upgrade to 'full'
    const hasPlayed = localStorage.getItem(HAS_PLAYED_KEY) === 'true';
    if (hasPlayed) return 'full';

    return 'initial';
}

function setInfoState(state) {
    const current = localStorage.getItem(INFO_STATE_KEY);

    // Once we are in 'full', never go backwards
    if (current === 'full') {
        return;
    }

    // Otherwise, allow 'initial' -> 'loginFail' or 'full'
    localStorage.setItem(INFO_STATE_KEY, state);
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

// insert a fixed decorative element behind the title so it stays static
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('title-deco')) {
        const d = document.createElement('div');
        d.id = 'title-deco';
        document.body.appendChild(d);
    }
});

// Award display: show costume5.png on the right if localStorage flag is set
function showAwardIfEarned() {
    try {
        const has = localStorage.getItem('ikbw_award') === 'true';
        if (!has) return;
    } catch (e) { return; }

    if (document.getElementById('award-container')) return; // already shown

    const container = document.createElement('div');
    container.id = 'award-container';
    container.style.position = 'fixed';
    container.style.right = '1.5rem';
    container.style.top = '6rem';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '0.5rem';

    const img = document.createElement('img');
    img.src = 'costume5.png';
    img.alt = 'Award';
    img.style.maxWidth = '10rem';
    img.style.height = 'auto';
    img.style.background = 'transparent';
    img.style.boxShadow = 'none';
    img.style.borderRadius = '0';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = "get rid of that thing ^";
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '0.9rem';
    btn.style.padding = '0.4rem 0.6rem';

    btn.addEventListener('click', () => {
        try { localStorage.removeItem('ikbw_award'); } catch (e) {}
        container.remove();
    });

    // try to align near the Play button: place container to the right of the play button
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const playBtn = document.getElementById('registerButton');
    if (playBtn) {
        // clear fixed right so we can set left
        container.style.right = 'auto';

        // position after image loads so we have correct dimensions
        const applyPosition = () => {
            const pRect = playBtn.getBoundingClientRect();
            const iw = img.offsetWidth || (10 * rootFontSize);
            const ih = img.offsetHeight || (iw);

            // vertical center aligned with play button (keep current vertical level)
            let topPx = pRect.top + (pRect.height / 2) - (ih / 2);

            // place to the right of play button using rem-based shift
            const SHIFT_RIGHT_REM = 25; // rem, increase to move further right
            const playRightRem = (pRect.left + pRect.width) / rootFontSize;
            let leftRem = playRightRem + SHIFT_RIGHT_REM;

            // clamp so the award doesn't go off-screen on small viewports
            const viewportWidthRem = window.innerWidth / rootFontSize;
            const viewportHeightPx = window.innerHeight;

            // ensure leftRem leaves at least 0.5rem margin and the image fits
            const imgWidthRem = iw / rootFontSize;
            const MIN_MARGIN_REM = 0.5;
            const maxLeftRem = Math.max(MIN_MARGIN_REM, viewportWidthRem - imgWidthRem - MIN_MARGIN_REM);
            if (leftRem > maxLeftRem) leftRem = maxLeftRem;
            if (leftRem < MIN_MARGIN_REM) leftRem = MIN_MARGIN_REM;

            // clamp vertical so it stays fully visible
            const MIN_MARGIN_PX = 8;
            if (topPx < MIN_MARGIN_PX) topPx = MIN_MARGIN_PX;
            if (topPx + ih > viewportHeightPx - MIN_MARGIN_PX) topPx = Math.max(MIN_MARGIN_PX, viewportHeightPx - ih - MIN_MARGIN_PX);

            // apply positions in rem
            container.style.top = (topPx / rootFontSize) + 'rem';
            container.style.left = leftRem + 'rem';
        };

        // keep it responsive: reposition on resize/scroll
        const reposition = () => { try { applyPosition(); } catch (e) {} };
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, { passive: true });

        if (img.complete) applyPosition(); else img.addEventListener('load', applyPosition);
    }

    container.appendChild(img);
    container.appendChild(btn);
    document.body.appendChild(container);
}

document.addEventListener('DOMContentLoaded', showAwardIfEarned);

function updateInfoText() {
    const infoTextEl = document.getElementById('infoText');
    if (!infoTextEl) return;

    const state = getInfoState();

    if (state === 'full') {
        infoTextEl.innerHTML = `
            <p><strong>Welcome to "It could be worse"!</strong></p>
            <p>
                This minigame takes some of the worst UI patterns you can imagine and turns them into a registration form.
                To keep it at least somewhat playable, we left out the truly impossible ones, but everything else is still
                designed to be really annoying.
            </p>
            <p>
                Login on this screen is intentionally impossible – you can play again
                by clicking on the "Click to register" link.
            </p>
            <p>In a far far away timeline, login is the <strong>hardmode</strong> version of the game, where you need to both write what you registered with AND the gimmicks are even worse - think writing morse code by binary. Unfortunately, we are in no such timeline.
            </p>
        `;
    } else if (state === 'loginFail') {
        infoTextEl.innerHTML = `
            <p><strong>Hmm… that didn't work.</strong></p>
            <p>
                Looks like this login isn't going to get you very far.
            </p>
            <p>
                Maybe creating a brand new account will help…
            </p>
        `;
    } else {
        // 'initial'
        infoTextEl.innerHTML = `
            <p><strong>Welcome to "It could be worse"!</strong></p>
            <p>
                So, why don't you just click the play button and see what happens?
            </p>
            <p>
                Good luck!
            </p>
        `;
    }
}

const btn = document.getElementById('registerButton');
const letterSpans = btn ? btn.querySelectorAll('.falling-button-text span') : [];

const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const loginCloseBtn = document.getElementById('loginClose');
const loginError = document.getElementById('loginError');
const gotoRegister = document.getElementById('gotoRegister');

function isValidEmail(value) {
    value = value.trim();
    if (!value) return false;

    // No spaces allowed
    if (/\s/.test(value)) return false;

    const atIndex = value.indexOf('@');
    if (atIndex <= 0) return false; // no @, or nothing before it

    const local = value.slice(0, atIndex);
    const domain = value.slice(atIndex + 1);

    if (!local || !domain) return false;

    // Local part: letters, digits, dot, underscore, plus, hyphen
    if (!/^[A-Za-z0-9._+-]+$/.test(local)) return false;

    // Domain must contain at least one dot
    const lastDot = domain.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === domain.length - 1) {
        return false;
    }

    const domainName = domain.slice(0, lastDot);
    const tld = domain.slice(lastDot + 1);

    if (!domainName || !tld) return false;

    // Domain name: letters, digits, hyphen, but not starting/ending with hyphen
    if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/.test(domainName)) return false;
    if (domainName.startsWith('-') || domainName.endsWith('-')) return false;

    // TLD: letters only, 2+ chars
    if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

    return true;
}

function showLoginModal() {
    if (!loginModal) return;
    loginError.style.display = 'none';
    loginForm.reset();
    loginModal.style.display = 'flex';
}

function hideLoginModal() {
    if (!loginModal) return;
    loginModal.style.display = 'none';
}

// BUTTON HOVER ANIMATION RESET
if (btn) {
    btn.addEventListener('mouseenter', () => {
        letterSpans.forEach(span => {
            span.style.animation = 'none';
            void span.offsetHeight; // trigger reflow
            span.style.animation = '';
        });
    });

    // Instead of direct redirect, open login modal
    btn.addEventListener('click', () => {
        showLoginModal();
    });
}

// LOGIN FORM always fails
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('loginEmail');
        const pwdInput = document.getElementById('loginPassword');

        const email = (emailInput?.value || '').trim();
        const pwd = (pwdInput?.value || '').trim();

        // Basic validations:
        if (!email || !pwd) {
            loginError.textContent = 'Email and password cannot be empty.';
            loginError.style.display = 'block';
            return;
        }

        if (!isValidEmail(email)) {
            loginError.textContent = 'Your email is not valid.';
            loginError.style.display = 'block';
            return;
        }

        // Valid-looking credentials -> we "fail" and advance info state
        setInfoState('loginFail');
        loginError.textContent = 'Login failed. Please try again.';
        loginError.style.display = 'block';

        // Optionally pop the info panel again to explain
        showInfoPanel();
    });
}

// Cancel button closes modal
if (loginCloseBtn) {
    loginCloseBtn.addEventListener('click', () => {
        hideLoginModal();
    });
}

// Click to register goes to game.html
if (gotoRegister) {
    gotoRegister.addEventListener('click', () => {
        window.location.href = 'game.html';
    });
}

// Optional: click backdrop to close
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target.classList.contains('login-modal-backdrop')) {
            hideLoginModal();
        }
    });
}

const infoBtn = document.getElementById('infoButton');
const infoPanel = document.getElementById('infoPanel');

function showInfoPanel() {
    if (!infoPanel) return;
    updateInfoText();                 // set text based on current state
    infoPanel.style.display = 'block';
    requestAnimationFrame(() => {
        infoPanel.classList.add('show');
    });
}

function hideInfoPanel() {
    if (!infoPanel) return;
    infoPanel.classList.remove('show');
    setTimeout(() => {
        if (!infoPanel.classList.contains('show')) {
            infoPanel.style.display = 'none';
        }
    }, 200);
}

if (infoBtn) {
    infoBtn.addEventListener('click', () => {
        // button animation
        infoBtn.classList.add('animate');
        setTimeout(() => infoBtn.classList.remove('animate'), 300);

        // toggle panel
        if (infoPanel.style.display === 'block' && infoPanel.classList.contains('show')) {
            hideInfoPanel();
        } else {
            showInfoPanel();
        }
    });
}
// close when clicking elsewhere
 document.addEventListener('click', (e) => {
     if (infoPanel && infoPanel.style.display === 'block') {
         const isButton = infoBtn.contains(e.target);
         const isPanel = infoPanel.contains(e.target);
         if (!isButton && !isPanel) {
             hideInfoPanel();
         }
     }
 });

// Title mouse-follow effect: translate the heading within an elliptical boundary
(function () {
    const title = document.querySelector('.falling-title');
    if (!title) return;

    // compute center and ellipse radii
    function computeBounds() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const r = title.getBoundingClientRect();
        // make horizontal movement less sensitive (narrower ellipse)
        const rx = Math.max(70, r.width * 0.22); // horizontal radius (smaller)
        // increase vertical movement so it moves more up/down
        const ry = Math.max(24, r.height * 0.9);  // vertical radius (larger)
        return { centerX, centerY, rx, ry };
    }

    let { centerX, centerY, rx, ry } = computeBounds();
    window.addEventListener('resize', () => {
        const b = computeBounds();
        centerX = b.centerX; centerY = b.centerY; rx = b.rx; ry = b.ry;
    });

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const SMOOTH = 0.12;

    function onMove(e) {
        const x = e.clientX;
        const y = e.clientY;

        // normalized distance from center in range [-1,1]
        const nx = Math.max(-1, Math.min(1, (x - centerX) / centerX));
        const ny = Math.max(-1, Math.min(1, (y - centerY) / centerY));

        // map to ellipse border proportionally
        targetX = nx * rx;
        targetY = ny * ry;
    }

    document.addEventListener('mousemove', onMove);

    function tick() {
        currentX += (targetX - currentX) * SMOOTH;
        currentY += (targetY - currentY) * SMOOTH;
        // keep base translateX(-50%) for centering, then add pixel offsets
        title.style.transform = `translate(-50%, 0) translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
})();

// Play button: slight repelling movement away from the mouse
(function () {
    const play = document.getElementById('registerButton');
    if (!play) return;

    // small radii so movement is subtle
    let centerX = window.innerWidth / 2;
    let centerY = window.innerHeight / 2;
    const compute = () => {
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;
    };
    window.addEventListener('resize', compute);

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    const SMOOTH = 0.18;
    // increase radii so movement is clearly noticeable but still small
    const RX = 40; // horizontal push distance (px)
    const RY = 28; // vertical push distance (px)

    function onMove(e) {
        const nx = Math.max(-1, Math.min(1, (e.clientX - centerX) / centerX));
        const ny = Math.max(-1, Math.min(1, (e.clientY - centerY) / centerY));

        // invert magnitude: closer mouse (|n| small) -> larger movement (1-|n|)
        const fx = 1 - Math.abs(nx);
        const fy = 1 - Math.abs(ny);

        // direction: opposite to mouse; if mouse exactly centered on an axis, default to positive direction
        const sx = nx === 0 ? 1 : Math.sign(nx);
        const sy = ny === 0 ? -1 : Math.sign(ny); // prefer up when perfectly centered vertically

        // Reduce excessive movement when very close by applying a soft attenuation factor:
        // factor = 0.75 when fx==1 (mouse centered), smoothly approaching 1 when mouse moves outwards.
        const attenX = 0.75 + 0.25 * (1 - fx);
        const attenY = 0.75 + 0.25 * (1 - fy);

        targetX = -sx * fx * RX * attenX;
        targetY = -sy * fy * RY * attenY;
    }

    document.addEventListener('mousemove', onMove);

    function tick() {
        currentX += (targetX - currentX) * SMOOTH;
        currentY += (targetY - currentY) * SMOOTH;
        // compose with base centering translate
        play.style.transform = `translate(-50%, -50%) translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
})();