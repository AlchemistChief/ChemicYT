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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public-dist/index.html'))
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})