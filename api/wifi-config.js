// Serverless Function Vercel (Config Wi-Fi)
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Default fallback
    let ssid = "Nama_Wifi_Contoh";
    let password = "PasswordContoh123";
    let encryption = "WPA";

    if (process.env.EDGE_CONFIG) {
        try {
            const response = await fetch(process.env.EDGE_CONFIG);
            if (response.ok) {
                const config = await response.json();
                const items = config.items || {};
                if (items.WIFI_SSID) ssid = items.WIFI_SSID;
                if (items.WIFI_PASSWORD) password = items.WIFI_PASSWORD;
                if (items.WIFI_ENCRYPTION) encryption = items.WIFI_ENCRYPTION;
            }
        } catch (e) {
            console.error("Gagal Edge Config:", e.message);
        }
    } else {
        if (process.env.WIFI_SSID) ssid = process.env.WIFI_SSID;
        if (process.env.WIFI_PASSWORD) password = process.env.WIFI_PASSWORD;
        if (process.env.WIFI_ENCRYPTION) encryption = process.env.WIFI_ENCRYPTION;
    }

    return res.status(200).json({ ssid, password, encryption });
};
