const express = require('express')
const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process');

const app = express()
const PORT = process.env.PORT || 3000

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data.json'), 'utf-8'))

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

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/favicon.ico'));
});


app.post('/api/download', (req, res) => {
    const scriptPath = path.join(__dirname, 'python.py'); // Path to the Python script

    execFile('python', [scriptPath], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Python script: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute Python script' });
        }

        if (stderr) {
            console.error(`Python script stderr: ${stderr}`);
        }

        console.log(`Python script output: ${stdout}`);
        res.json({ message: 'Python script executed successfully', output: stdout });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})