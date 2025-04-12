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
    execFile('python', [scriptPath, url, type], (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ error: 'Failed to execute Python script', details: error.message });
    }

    if (stderr) {
        console.error(`Python script stderr: ${stderr}`);
        return res.status(500).json({ error: 'Python script stderr', details: stderr });
    }

    console.log("Python script stdout:", stdout); // Add this log to see the raw output

    try {
        const result = JSON.parse(stdout.trim());

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
        console.error('Error parsing Python script output:', err);
        return res.status(500).json({ error: 'Error processing Python script output', details: err.message });
    }
});

});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})