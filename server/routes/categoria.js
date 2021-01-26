const express = require('express')
const app = express()
const Categoria = require('../models/categoria')
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

const _ = require('underscore');

// =============================
// Mostrar todas las categorias
// =============================
app.get('/categoria', verificaToken, (req, res) => {
    Categoria
        .find()
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            Categoria.countDocuments((err, conteo) => {
                res.json({
                    ok: true,
                    total: conteo,
                    categorias
                });
            });
        })
});

// =============================
// Mostrar una categoria por id
// =============================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id

    Categoria.findById(id, (err, categoria) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria no encontrada' }
            })
        }

        res.json({
            ok: true,
            categoria,
        });
    })


});

// =============================
// Crear una categoria
// =============================
app.post('/categoria', verificaToken, (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: 'No se creó la categoria'
            })
        }

        res.json({
            ok: true,
            categoriaDB
        })

    })

});

// =============================
// Actualiza la categoria
// =============================
app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id

    let body = _.pick(req.body, ['descripcion', 'usuario']);

    Categoria.findByIdAndUpdate(id, body, { new: true, context: 'query', useFindAndModify: false }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: 'No se actualizó la categoria'
            })
        }

        res.json({
            ok: true,
            categoriaDB
        })

    })

});

// =============================
// Borrado de la categoria (sólo administrador)
// =============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id

    // Opción 1: Borramos el registro fisicamente de la base de datos
    Categoria.findByIdAndRemove(id, { useFindAndModify: false }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Categoria  no encontrada' }
            })
        }

        res.json({
            ok: true,
            usuario: categoriaDB
        })

    })

});


module.exports = app;