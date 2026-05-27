(function () {
    // Get raw value from gameFields or direct by id
    function getRaw(fieldId) {
        if (window.gameFields && window.gameFields[fieldId]) {
            return window.gameFields[fieldId].value || '';
        }
        const input = document.getElementById(fieldId);
        return input ? input.value || '' : '';
    }

    // Decode like your "decodedValues" in main.js (binary/morse)
    function getDecoded(fieldId) {
        const raw = getRaw(fieldId);
        const type = window.assignedTypes && window.assignedTypes[fieldId];
        if (!type) return raw;

        if (type.key === 'binaryCode') {
            return binaryToText(raw);
        }
        if (type.key === 'morseCode') {
            return morseToText(raw);
        }
        // other minigames (scrambledKeyboard, oldPhoneKeypad...) already produce normal text
        return raw;
    }

    // Get the "final display" value like finalDisplayValues in main.js
    function getFinalValue(fieldId) {
        const type = window.assignedTypes && window.assignedTypes[fieldId];

        if (type && type.key === 'numbersByWords') {
            return wordsToDigits(getRaw(fieldId));
        }

        if (type && type.key === 'ageDropdown') {
            const num = ageWordsToNumber(getRaw(fieldId));
            return (num !== null) ? String(num) : '';
        }

        return getDecoded(fieldId);
    }

    window.getLiveRawValue = getRaw;
    window.getLiveDecodedValue = getDecoded;
    window.getLiveFinalValue = getFinalValue;
})();