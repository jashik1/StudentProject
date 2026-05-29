
      const morse_map = {
            'a': '.-',   'b': '-...', 'c': '-.-.', 'd': '-..',
            'e': '.',    'f': '..-.', 'g': '--.',  'h': '....',
            'i': '..',   'j': '.---', 'k': '-.-',  'l': '.-..',
            'm': '--',   'n': '-.',   'o': '---',  'p': '.--.',
            'q': '--.-', 'r': '.-.',  's': '...',  't': '-',
            'u': '..-',  'v': '...-', 'w': '.--',  'x': '-..-',
            'y': '-.--', 'z': '--..',
            '0': '-----', '1': '.----', '2': '..---', '3': '...--',
            '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', '@': '.--.-.', '.': '.-.-.-', '+': '.-.-.'
        };

        // Inverse map: morse → letter
        const morse_reverse = {};
        Object.keys(morse_map).forEach(ch => {
            morse_reverse[morse_map[ch]] = ch;
        });

        // Decode Morse where letters are separated by spaces, words by " / " or "   "
        function morseToText(morseStr) {
            morseStr = morseStr.trim();
            if (!morseStr) return '';

            // Support:
            // - ".... . .-.. .-.. ---"           (letters separated by space)
            // - ".... . .-.. .-.. --- / .--"     (words separated by /)
            // - "....   .-.-   ..."             (words by 3+ spaces)
            const words = morseStr.split(/\s{2,}|\s*\/\s*/); // split on 2+ spaces or "/"
            const decodedWords = [];

            for (const word of words) {
                const letters = word.split(/\s+/);
                let decodedWord = '';

                for (const letterCode of letters) {
                    const ch = morse_reverse[letterCode];
                    if (!ch) {
                        // unknown morse sequence, keep a question mark
                        decodedWord += '?';
                    } else {
                        decodedWord += ch;
                    }
                }

                decodedWords.push(decodedWord);
            }

            return decodedWords.join(' ');
        }

        //Binary to text converter

        function binaryToText(binaryStr) {
            binaryStr = binaryStr.trim();
            if (!binaryStr) return '';
            let chunks = [];
            if (binaryStr.includes(' ')) {
                chunks = binaryStr.split(/\s+/);
            } else {
                for (let i = 0; i < binaryStr.length; i += 8) {
                    chunks.push(binaryStr.slice(i, i + 8));
                }
            }
            let result = '';
            for (const chunk of chunks) {
                if (chunk.length !== 8 || /[^01]/.test(chunk)) continue;
                const code = parseInt(chunk, 2);
                result += String.fromCharCode(code);
            }
            console.log('[binaryToText] raw:', binaryStr, 'decoded:', result);
            return result;
        }
        //Words to digits converter
        function wordsToDigits(value) {
            const map = {
                zero: '0',
                one: '1',
                two: '2',
                three: '3',
                four: '4',
                five: '5',
                six: '6',
                seven: '7',
                eight: '8',
                nine: '9'
            };

            const trimmed = value.trim();
            if (!trimmed) return '';

            const parts = trimmed.split(/\s+/);
            let out = '';

            for (const word of parts) {
                const d = map[word];
                if (d === undefined) {
                    return '';
                }
                out += d;
            }

            return out;
        }

        // Numbers by words validation
        function isNumbersByWordsValid(value) {
            const allowed = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

            const trimmed = value.trim();
            if (!trimmed) return false; // must not be empty

            const parts = trimmed.split(/\s+/); // split by spaces
            return parts.every(word => allowed.includes(word));
        }
        // Email validation
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

            // Local part: allow letters, digits, dot, underscore, plus, hyphen
            // (you can tighten this if you want)
            if (!/^[A-Za-z0-9._+-]+$/.test(local)) return false;

            // Domain must contain at least one dot
            const lastDot = domain.lastIndexOf('.');
            if (lastDot <= 0 || lastDot === domain.length - 1) {
                // no dot, or dot at start, or dot at end
                return false;
            }

            const domainName = domain.slice(0, lastDot); // e.g. "example.co"
            const tld = domain.slice(lastDot + 1);       // e.g. "uk", "com"

            if (!domainName || !tld) return false;

            // Domain name part: letters, digits, hyphen, but not starting/ending with hyphen
            // and no consecutive dots/hyphens
            if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/.test(domainName)) return false;
            if (domainName.startsWith('-') || domainName.endsWith('-')) return false;

            // TLD: letters only, 2+ chars (e.g. "com", "net", "cz")
            if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

            return true;
            }
            

            function ageNumberToWords(n) {
            const ones = [
                "", "one", "two", "three", "four", "five",
                "six", "seven", "eight", "nine"
            ];
            const teens = [
                "ten", "eleven", "twelve", "thirteen", "fourteen",
                "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
            ];
            const tens = [
                "", "", "twenty", "thirty", "forty",
                "fifty", "sixty", "seventy", "eighty", "ninety"
            ];

            if (n === 0) return "zero";
            if (n === 100) return "one hundred";

            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];

            const t = Math.floor(n / 10);
            const o = n % 10;
            if (o === 0) return tens[t];
            return tens[t] + " " + ones[o];
        }

        // reverse: words -> number for age dropdown
        function ageWordsToNumber(str) {
            str = (str || "").trim().toLowerCase();
            if (!str) return null;
            if (str === "one hundred") return 100;

            const mapOnes = {
                "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4,
                "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9
            };
            const mapTeens = {
                "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
                "fifteen": 15, "sixteen": 16,
                "seventeen": 17, "eighteen": 18, "nineteen": 19
            };
            const mapTens = {
                "twenty": 20, "thirty": 30, "forty": 40,
                "fifty": 50, "sixty": 60, "seventy": 70,
                "eighty": 80, "ninety": 90
            };

            if (mapTeens[str] !== undefined) return mapTeens[str];
            if (mapOnes[str] !== undefined) return mapOnes[str];
            if (mapTens[str] !== undefined) return mapTens[str];

            const parts = str.split(/\s+/);
            if (parts.length === 2) {
                const t = mapTens[parts[0]];
                const o = mapOnes[parts[1]];
                if (t !== undefined && o !== undefined) return t + o;
            }

            return null;
        }    

        function calculateAgeFromDateString(dateStr) {
        // expect "YYYY-MM-DD"
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;

        const [year, month, day] = dateStr.split('-').map(Number);
        const birthDate = new Date(year, month, day);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
        }