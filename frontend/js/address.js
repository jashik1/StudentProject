document.addEventListener('DOMContentLoaded', () => {
    const addrInput = window.gameFields?.address || document.getElementById('address');
    const addrErr   = document.getElementById('address-error');
    if (!addrInput || !addrErr) return;

    function validateAddressLive() {
        const decoded = (window.getLiveDecodedValue ? window.getLiveDecodedValue('address') : addrInput.value || '').trim();

        if (!decoded) {
            addrErr.style.display = 'none';
            addrErr.textContent = '';
            addrInput.classList.remove('error');
            return true;
        }

        if (decoded.length < 8) {
            addrErr.textContent = 'Address must be at least 8 characters long.';
            addrErr.style.display = 'block';
            addrInput.classList.add('error');
            return false;
        }

        if (!/^[A-Za-z0-9 ,.\-]+$/.test(decoded)) {
            addrErr.textContent = 'Address contains invalid characters.';
            addrErr.style.display = 'block';
            addrInput.classList.add('error');
            return false;
        }

        addrErr.style.display = 'none';
        addrErr.textContent = '';
        addrInput.classList.remove('error');
        return true;
    }

    addrInput.addEventListener('input', validateAddressLive);
    window.validateAddressLive = validateAddressLive;
});