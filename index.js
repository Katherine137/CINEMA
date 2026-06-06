const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log('Carpeta uploads/ creada');
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const conexion = mysql.createConnection({
    host:'127.0.0.1',
    port:3307,
    user:'root',
    password:'root',
    database:'cine',
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

conexion.connect((error)=>{
    if(error){
        console.log('Error conectando a la base de datos:', error.message);
        console.log('Asegúrate de que MySQL esté en ejecución y los datos de conexión sean correctos.');
    }else{
        console.log('Conectado a MySQL');
    }
});

app.get('/api/peliculas',(req,res)=>{

    conexion.query(
        'SELECT * FROM peliculas',
        (error,resultado)=>{
            if(error){
                res.status(500).json(error);
            }else{
                res.json(resultado);
            }
        }
    );

});

app.post('/api/peliculas', upload.single('url_video'), (req,res)=>{

    const {titulo, director, anio, genero, url_imagen} = req.body;
    const url_video = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
    INSERT INTO peliculas(titulo, director, anio, genero, url_imagen, url_video)
    VALUES(?,?,?,?,?,?)
    `;

    conexion.query(
        sql,
        [titulo, director, anio, genero, url_imagen, url_video],
        (error,resultado)=>{
            if(error){
                res.status(500).json(error);
            }else{
                res.json({
                    mensaje:'Pelicula creada'
                });
            }
        }
    );

});

app.put('/api/peliculas/:id', upload.single('url_video'), (req, res) => {
    const { id } = req.params;
    const { titulo, director, anio, genero, url_imagen, url_video_actual } = req.body;
    const url_video = req.file ? `/uploads/${req.file.filename}` : (url_video_actual || null);

    const sql = `UPDATE peliculas SET titulo=?, director=?, anio=?, genero=?, url_imagen=?, url_video=? WHERE id=?`;

    conexion.query(sql, [titulo, director, anio, genero, url_imagen, url_video, id], (error, resultado) => {
        if (error) res.status(500).json(error);
        else res.json({ mensaje: 'Pelicula actualizada' });
    });
});

app.delete('/api/peliculas/:id',(req,res)=>{

    const {id} = req.params;

    conexion.query(
        'DELETE FROM peliculas WHERE id=?',
        [id],
        (error,resultado)=>{
            if(error){
                res.status(500).json(error);
            }else{
                res.json({
                    mensaje:'Pelicula eliminada'
                });
            }
        }
    );

});


app.get('/cine', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
    res.redirect('/cine');
});

app.listen(3000,()=>{
    console.log('Servidor corriendo en puerto 3000');
});
