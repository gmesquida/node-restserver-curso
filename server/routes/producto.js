const express = require('express')
const app = express()
const Producto = require('../models/producto')
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

const _ = require('underscore');


// =============================
// Buscar productos
// =============================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i')

    Producto
        .find({ nombre: regex })
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate([{ path: 'usuario', select: 'nombre email' }, { path: 'categoria' }])
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Producto
                .countDocuments({ nombre: regex })
                .exec((err, conteo) => {
                    res.json({
                        ok: true,
                        total: conteo,
                        productos
                    });
                });
        })
});



// =============================
// Mostrar todos los productos
// =============================
app.get('/producto', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto
        .find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate([{ path: 'usuario', select: 'nombre email' }, { path: 'categoria' }])
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Producto.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    total: conteo,
                    productos
                });
            });
        })
});

// =============================
// Mostrar una producto por id
// =============================
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id

    Producto
        .findById(id)
        .populate([{ path: 'usuario', select: 'nombre email' }, { path: 'categoria' }])
        .exec((err, producto) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Producto no encontrado' }
                })
            }

            res.json({
                ok: true,
                producto,
            });
        })


});

// =============================
// Crear un producto
// =============================
app.post('/producto', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        descripcion: body.descripcion,
        precioUni: body.precioUni,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: 'No se creó el producto'
            })
        }

        res.json({
            ok: true,
            productoDB
        })

    })

});

// =============================
// Actualiza el producto
// =============================
app.put('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id

    //let body = _.pick(req.body, ['descripcion', 'usuario']);
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, context: 'query', useFindAndModify: false }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: 'No se actualizó el producto'
            })
        }

        res.json({
            ok: true,
            productoDB
        })

    })

});

// =============================
// Borrado del producto (sólo administrador)
// Actualizamos el estado
// =============================
app.delete('/producto/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id

    let cambiaEstado = { disponible: false };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Usuario no encontrado' }
            })
        }

        res.json({
            ok: true,
            productoDB
        })

    })

});


module.exports = app;