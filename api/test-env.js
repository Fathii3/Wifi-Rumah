// Endpoint tes untuk melihat variabel lingkungan di Vercel (Tanpa membocorkan token/password)
module.exports = async (req, res) => {
    const keys = Object.keys(process.env).map(key => {
        // Cek jika nilainya ada
        const hasValue = !!process.env[key];
        // Sensor sebagian nilai untuk keamanan
        let maskedValue = "null/undefined";
        if (hasValue) {
            const val = process.env[key];
            if (val.length > 15) {
                maskedValue = val.slice(0, 10) + "..." + val.slice(-5);
            } else {
                maskedValue = "terisi";
            }
        }
        return { key, hasValue, value: maskedValue };
    });

    return res.status(200).json({
        message: "Diagnostic Environment Variables",
        variables: keys
    });
};
