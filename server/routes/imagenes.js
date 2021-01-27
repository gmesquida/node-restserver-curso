const express = require('express');
const app = express();

const { verificaTokenImg } = require('../middlewares/autenticacion')

const path = require('path');
const fs = require('fs');

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg)

    } else {
        let pathnoImg = path.resolve(__dirname, `../assets/no-image.jpg`);
        res.sendFile(pathnoImg)
    }

})

module.exports = app;