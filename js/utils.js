/**
 * Utility cn (classNames)
 * Menggabungkan class string, array, atau objek kondisional menjadi satu string rapi.
 * Contoh pemakaian:
 *   cn('p-4 rounded-xl', isActive && 'text-primary', { 'hidden': !isOpen })
 */
function cn(...inputs) {
    const classes = [];

    for (const input of inputs) {
        if (!input) continue;

        if (typeof input === 'string' || typeof input === 'number') {
            classes.push(input);
        } else if (Array.isArray(input)) {
            const inner = cn(...input);
            if (inner) classes.push(inner);
        } else if (typeof input === 'object') {
            for (const [key, value] of Object.entries(input)) {
                if (value) classes.push(key);
            }
        }
    }

    return classes.join(' ');
}

/**
 * Format tanggal standar Indonesia (DD Mon YYYY, HH:mm)
 * @param {string|number|Date} iso
 * @returns {string}
 */
function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${mon} ${year}, ${h}:${m}`;
}

/**
 * Salin teks ke clipboard dengan fallback
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    if (!text) return false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
    } catch (e) {
        console.error('Clipboard copy failed:', e);
        return false;
    }
}
