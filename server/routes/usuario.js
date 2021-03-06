const express = require('express')
const app = express()
const Usuario = require('../models/usuario')
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion')

const bcrypt = require('bcryptjs');
const _ = require('underscore');

// Cualquier usuario puede hacerlo

app.get('/usuario', verificaToken, function(req, res) {

    // Podemos obtener información suministrada por el token del peticionario
    // console.log(req.usuario);
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    let filtro = { estado: true };
    Usuario.find(filtro, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Usuario.countDocuments(filtro, (err, conteo) => {
                res.json({
                    ok: true,
                    usuario: req.usuario,
                    total: conteo,
                    usuarios
                })
            })

        })
})

app.get('/usuario/:id', function(req, res) {
    let id = req.params.id
    res.json({
        id
    })
})

// Crear usuario lo puede hacer un usuario no autenticado
app.post('/usuario', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuarioDB
        })

    })


})

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id

    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, context: 'query', useFindAndModify: false }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuarioDB
        })

    })

})

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id

    // Opción 1: Borramos el registro fisicamente de la base de datos
    /*Usuario.findByIdAndRemove(id, (err,usuarioDB) => {
        
        if (err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                err:{message:'Usuario no encontrado'}
            })
        }

        res.json({
            ok:true,
            usuario: usuarioDB
        } )

    }) */

    // Opción 2: Actualizamos el campo estado

    let cambiaEstado = { estado: false };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'Usuario no encontrado' }
            })
        }

        res.json({
            ok: true,
            usuarioDB
        })

    })

})



module.exports = app;