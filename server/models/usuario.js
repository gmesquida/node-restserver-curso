
const mongoose  =require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role valido'
}

let usuarioSchema = new Schema({
    nombre:{
        type: String,
        required: [true,'El nombre es necesario']
    },
    email:{
        type: String,
        unique: true,
        required: [true,'El correo es necesario']
    },
    password:{
        type: String,
        required: [true,'La contraseña es necesaria']
    },
    img:{
        type: String,
        required: false
    },
    role:{
        type: String,
        required: [true,'El correo es necesario'],
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado:{
        type: Boolean,
        default: true,
        required: [true,'El estado es obligatorio']
    },
    google:{
        type: Boolean,
        default: false,
        required: [true,'El campo google es necesario']
    }

});

usuarioSchema.methods.toJSON = function(){
    let user = this;
    let userOBject = user.toObject();
    delete userOBject.password;
    return userOBject;
}

// Apply the uniqueValidator plugin to userSchema.
usuarioSchema.plugin(uniqueValidator,{message: '{PATH} debe de ser único'});

module.exports = mongoose.model('Usuario', usuarioSchema);