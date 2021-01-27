const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const path = require('path');
const fs = require('fs');

const Usuario = require('../models/usuario')
const Producto = require('../models/producto')


app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // Tipos validos
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipo no validao',
                tiposValidos: tiposValidos.join(', '),
                tipoRecibida: tipo
            }
        });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: 'No se ha seleccionado ningún archivo.'
        });
    }

    let archivo = req.files.archivo;

    // Extensiones validas
    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    let nombreSplit = archivo.name.split('.');
    let extension = nombreSplit[nombreSplit.length - 1];


    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extensiones no validas.',
                extensionesValidas: extensionesValidas.join(', '),
                extensionRecibida: extension
            }
        });
    }

    // Cambiamos el nombre del archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension}`;

    // Nombre del archivo en nuestra carpeta
    let uploadPath = path.resolve(__dirname, '../../uploads/' + tipo + '/' + nombreArchivo);

    //console.log(uploadPath);

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Una vez la imagen esta cargada, actualizamos el usuario o producto

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo)
            return res;
        }

        if (tipo === 'productos') {
            imagenProducto(id, res, nombreArchivo)
            return res;
        }

        res.json({
            ok: true,
            message: 'File uploaded!'
        });
    });
});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }

        // Borramos la imagen actual
        borraArchivo(usuarioDB.img, 'usuarios');

        // Grabamos la nueva
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                usuarioGuardado
            })

        });


    })

}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            })
        }

        // Borramos la imagen actual
        if (productoDB.img) {
            borraArchivo(productoDB.img, 'productos');
        }


        // Grabamos la nueva
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                productoGuardado
            })

        });

    })


}

function borraArchivo(nombreImagen, tipo) {
    // Borramos la imagen actual
    let pathImagenAct = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    // console.log(pathImagenAct);

    if (fs.existsSync(pathImagenAct)) {
        fs.unlinkSync(pathImagenAct);
    }
}

module.exports = app;