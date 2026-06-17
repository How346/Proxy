export default async function handler(req, res) {
    // 1. Attach the VIP CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle browser preflight checks
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 2. Validate the URL parameter
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing "url" parameter in the request.' });
    }

    try {
        // 3. Fetch the actual video segment/manifest from the target server
        const response = await fetch(targetUrl, {
            headers: {
                // Disguise the proxy as a standard Chrome browser
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Target server responded with status: ${response.status}` });
        }

        // 4. Pass the original Content-Type back to the downloader
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // 5. Convert the response to binary buffer and send it
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        return res.status(200).send(buffer);

    } catch (error) {
        return res.status(500).json({ error: 'Proxy failed to execute fetch.', details: error.message });
    }
}
