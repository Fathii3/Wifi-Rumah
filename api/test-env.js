// Endpoint debug untuk mendiagnosis format data Edge Config di Vercel
module.exports = async (req, res) => {
    let edgeConfigData = null;
    let fetchError = null;
    let fetchStatus = null;
    
    if (process.env.EDGE_CONFIG) {
        try {
            const response = await fetch(process.env.EDGE_CONFIG);
            fetchStatus = response.status;
            if (response.ok) {
                const data = await response.json();
                
                // Sensor nilai sensitif sebelum dikirim ke response API
                edgeConfigData = {};
                for (const key of Object.keys(data)) {
                    const val = data[key];
                    if (key.includes('PASSWORD')) {
                        edgeConfigData[key] = "censored_length_" + (val ? val.length : 0);
                    } else if (typeof val === 'string' && val.length > 15) {
                        edgeConfigData[key] = val.slice(0, 10) + "..." + val.slice(-5);
                    } else {
                        edgeConfigData[key] = val;
                    }
                }
            } else {
                fetchError = `HTTP error! Status: ${response.status}`;
            }
        } catch (e) {
            fetchError = e.message;
        }
    } else {
        fetchError = "EDGE_CONFIG environment variable is not defined";
    }

    return res.status(200).json({
        message: "Diagnostic Edge Config Response",
        hasEdgeConfigEnv: !!process.env.EDGE_CONFIG,
        fetchStatus,
        fetchError,
        data: edgeConfigData
    });
};
