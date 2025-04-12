const express = require('express')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process');


const app = express()
const PORT = process.env.PORT || 3000
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '/data.json'), 'utf-8'))

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')))

app.get('/data.json', (req, res) => {res.json(data)})
app.get('/index.html', (req, res) => {res.sendFile(path.join(__dirname, '../public/index.html'));});
app.get('/styles.css', (req, res) => {res.sendFile(path.join(__dirname, '../public/styles.css'));});
app.get('/client.js', (req, res) => {res.sendFile(path.join(__dirname, '../public/client.js'));});
app.get('favicon.ico', (req, res) => {res.sendFile(path.join(__dirname, '../public/favicon.ico'));});


app.post('/api/download', (req, res) => {
    const { url, type } = req.body;

    if (!url || !type) {
        return res.status(400).json({ error: 'Missing required parameters: url or type' });
    }

    const scriptPath = path.join(__dirname, '/download.py');

    // Execute the Python script
    console.log(`Request received, executing downlaod.py`)
    const { execFile } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    // generate a unique temp file path for the "custom channel"
    const channelPath = path.join('/tmp', `channel_${Date.now()}.json`);

    execFile('python3', [scriptPath, url, type, channelPath], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute Python script', details: error.message });
        }

        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
            // optionally don't return here if stderr is just logs
        }

        console.log("Python script stdout:", stdout); // can include download logs

        try {
            // read the custom channel output (safe from extra logs)
            const raw = fs.readFileSync(channelPath, 'utf-8');
            const result = JSON.parse(raw);

            if (result.error) {
                console.error(`Python script error: ${result.error}`);
                return res.status(500).json({ error: result.error, details: 'Python script error' });
            }

            const filePath = result.file_path;
            if (fs.existsSync(filePath)) {
                const filename = path.basename(filePath);
                res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
                res.download(filePath, filename, (err) => {
                    if (err) {
                        console.error(`Error sending file: ${err.message}`);
                    } else {
                        console.log(`File sent successfully: ${filePath}`);
                    }
                });
            } else {
                console.error("File not found after download");
                return res.status(500).json({ error: "File not found after download", details: "The file path does not exist after download" });
            }
        } catch (err) {
            console.error('Error parsing custom output channel:', err);
            return res.status(500).json({ error: 'Error processing output', details: err.message });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})