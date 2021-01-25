//==========================
// Puerto
//==========================

process.env.PORT = process.env.PORT || 3000;


//==========================
// Entorno
//==========================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==========================
// Vencimiemto del token
// 60 segundos
// 60 minutos
// 24 horas
// 30 minutos
//==========================

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;


//==========================
// SEED de autentificacion
// Será una variable de entorno de Heroku
//==========================

process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

//==========================
// Base de datos
//==========================

let urlDB

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

// Para trabajar en Riu
// urlDB = 'mongodb+srv://user:user@cluster0.xbkbv.mongodb.net/cafe?retryWrites=true&w=majority'

process.env.URLDB = urlDB;

//==========================
// Google client id
//==========================

process.env.CLIENT_ID = process.env.CLIENT_ID || '743040606145-c0e7v38t205p93kqb740f2uuklbf1di7.apps.googleusercontent.com';