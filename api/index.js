const express = require('express')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process');

const app = express()
const PORT = process.env.PORT || 3000

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '/data.json'), 'utf-8'))

app.use(express.static(path.join(__dirname, '../public')))

app.get('/data.json', (req, res) => {
    res.json(data)
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/styles.css'));
});

app.get('/client.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/client.js'));
});

app.get('favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/favicon.ico'));
});


app.post('/api/download', (req, res) => {
    const { url, type } = req.body;

    if (!url || !type) {
        return res.status(400).json({ error: 'Missing required parameters: url or type' });
    }

    const scriptPath = path.join(__dirname, '/download.py');

    // Execute the Python script
    execFile('python', [scriptPath, url, type], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute Python script' });
        }

        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
        }

        // Extract the file path from the Python script output
        const filePath = stdout.trim();
        if (fs.existsSync(filePath)) {
            const filename = path.basename(filePath); // Extract the actual filename
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            res.download(filePath, filename, (err) => {
                if (err) {
                    console.error(`Error sending file: ${err.message}`);
                } else {
                    console.log(`File sent successfully: ${filePath}`);
                }
            });
        } else {
            res.status(500).json({ error: "File not found after download" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})