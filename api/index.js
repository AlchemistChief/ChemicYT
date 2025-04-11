const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data.json'), 'utf-8'))

app.use(express.static(path.join(__dirname, '../public-dist')))

app.get('/api/data', (req, res) => {
    res.json(data)
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public-dist/index.html'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, '../public-dist/styles.css'));
});

app.get('/client.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../public-dist/client.js'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../favicon.ico'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})