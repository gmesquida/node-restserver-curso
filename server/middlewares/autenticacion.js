
const jwt = require('jsonwebtoken');

// ===============================
// Verifir Token
// ===============================

let verificaToken = (req, res, next)=>{

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded)=>{
        if (err){
            return res.status(401).json({
                ok: false,
                err
            })
        }

        // Añadimos la información del usuario al request
        req.usuario = decoded.usuario;
 
        next();
    })



};

// ===============================
// Verifir AdminRole
// ===============================

let verificaAdmin_Role = (req, res, next)=>{
    
    let usuario = req.usuario;
    console.log(usuario.role);

    if (usuario.role !== 'ADMIN_ROLE'){
        return res.status(401).json({
            ok: false,
            err: {message:'El usuario no es administrador'}
        })
    }

    next();

};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}