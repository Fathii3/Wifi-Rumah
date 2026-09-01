// Vercel Serverless Function Proxy
module.exports = async (req, res) => {
    // CORS Header
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

    let apiHost = "";

    // 1. Ambil dari Edge Config
    if (process.env.EDGE_CONFIG) {
        try {
            const response = await fetch(process.env.EDGE_CONFIG);
            if (response.ok) {
                const config = await response.json();
                const items = config.items || {};
                if (items.API_HOST) apiHost = items.API_HOST;
            }
        } catch (e) {
            console.error("Gagal mengambil API_HOST dari Edge Config:", e.message);
        }
    }

    // 2. Fallback Environment Variables
    if (!apiHost) {
        apiHost = process.env.API_HOST;
    }

    if (!apiHost) {
        return res.status(500).json({
            error: "Konfigurasi 'API_HOST' belum terpasang di Edge Config maupun Environment Variables Vercel."
        });
    }

    try {
        // Ambil data router dari backend scraper lokal via tunnel
        const response = await fetch(`${apiHost}/api/devices`, {
            headers: {
                'bypass-tunnel-reminder': 'true',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Backend scraper mengembalikan status error: ${response.status}`
            });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            error: `Gagal terhubung ke backend scraper lokal. Pastikan server.js dan Ngrok Anda aktif. Detail: ${error.message}`
        });
    }
};
