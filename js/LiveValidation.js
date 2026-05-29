(function () {
    function getRaw(fieldId) {
        if (window.gameFields && window.gameFields[fieldId]) {
            return window.gameFields[fieldId].value || '';
        }
        const input = document.getElementById(fieldId);
        return input ? input.value || '' : '';
    }

    function getType(fieldId) {
        if (!window.assignedTypes) return null;
        return window.assignedTypes[fieldId] || null;
    }

    function getDecoded(fieldId) {
        const raw = getRaw(fieldId);
        const type = getType(fieldId);

        console.log('[LiveDecode] field:', fieldId, 'type:', type ? type.key : '(none)', 'raw:', raw);

        if (!type) return raw;

        if (type.key === 'binaryCode') {
            const decoded = binaryToText(raw);
            console.log('[LiveDecode] binary field:', fieldId, 'decoded:', decoded);
            return decoded;
        }
        if (type.key === 'morseCode') {
            const decoded = morseToText(raw);
            console.log('[LiveDecode] morse field:', fieldId, 'decoded:', decoded);
            return decoded;
        }
        return raw;
    }

    function getFinalValue(fieldId) {
        const type = getType(fieldId);
        const raw = getRaw(fieldId);

        if (type && type.key === 'numbersByWords') {
            const digits = wordsToDigits(raw);
            console.log('[LiveDecode] numbersByWords ->', digits);
            return digits;
        }

        if (type && type.key === 'ageDropdown') {
            const num = ageWordsToNumber(raw);
            console.log('[LiveDecode] ageDropdown ->', num);
            return (num !== null) ? String(num) : '';
        }

        return getDecoded(fieldId);
    }

    window.getLiveRawValue     = getRaw;
    window.getLiveDecodedValue = getDecoded;
    window.getLiveFinalValue   = getFinalValue;
})();