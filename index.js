const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const conexion = mysql.createConnection({
    host:'mysql-peliculas',
    port:3306,
    user:'root',
    password:'root',
    database:'cine',
});

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

app.post('/api/peliculas',(req,res)=>{

    const {titulo, director, anio, genero} = req.body;

    const sql = `
    INSERT INTO peliculas(titulo, director, anio, genero)
    VALUES(?,?,?,?)
    `;

    conexion.query(
        sql,
        [titulo, director, anio, genero],
        (error,resultado)=>{
            if(error){
                res.status(500).json(error);
            }else{
                res.json({
                    mensaje:'Pelicula creado'
                });
            }
        }
    );

});

app.put('/api/peliculas/:id',(req,res)=>{

    const {id} = req.params;
    const {titulo, director, anio, genero} = req.body;

    const sql = `
    UPDATE peliculas
    SET titulo=?, director=?, anio=?, genero=?
    WHERE id=?
    `;

    conexion.query(
        sql,
        [titulo, director, anio, genero,id],
        (error,resultado)=>{
            if(error){
                res.status(500).json(error);
            }else{
                res.json({
                    mensaje:'Pelicula actualizada'
                });
            }
        }
    );

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

const paginaHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Películas - Cine</title>
    <style>
        body {
            margin: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: #faf9f7;
            color: #333;
        }
        .page {
            max-width: 1000px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .hero {
            text-align: center;
            padding: 20px 0 40px;
        }
        .hero h1 {
            margin: 0;
            font-size: 2.5rem;
            color: #111;
            font-weight: 600;
        }
        .hero p {
            margin: 10px auto 0;
            color: #666;
        }
        .card {
            background: #ffffff;
            border: 1px solid #eaeaea;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            padding: 30px;
        }
        .toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        .toolbar .status {
            color: #666;
            font-size: 0.95rem;
        }
        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.2s;
        }
        .button.primary {
            background: #222;
            color: white;
        }
        .button.primary:hover {
            background: #444;
        }
        form {
            display: grid;
            gap: 15px;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            margin-bottom: 30px;
        }
        input, select {
            width: 100%;
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            background: #fafafa;
            color: #333;
            font-size: 0.95rem;
            box-sizing: border-box;
        }
        input:focus, select:focus {
            outline: none;
            border-color: #222;
            background: #fff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
        }
        th, td {
            padding: 16px 10px;
            text-align: left;
            border-bottom: 1px solid #f0f0f0;
        }
        th {
            color: #555;
            font-weight: 500;
            font-size: 0.9rem;
            border-bottom: 2px solid #eaeaea;
        }
        .tag {
            display: inline-flex;
            padding: 4px 10px;
            border-radius: 6px;
            background: #f4f4f4;
            color: #555;
            font-size: 0.85rem;
        }
        .empty {
            padding: 40px 0;
            text-align: center;
            color: #888;
        }
        .action-buttons {
            display: flex;
            gap: 8px;
        }
        .action-buttons button {
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #ddd;
            border: none;
            cursor: pointer;
            font-size: 0.85rem;
            background: #fff;
            color: #333;
            transition: background 0.2s;
        }
        .action-buttons button.edit:hover {
            background: #f0f0f0;
        }
        .action-buttons button.delete {
            color: #d32f2f;
            border-color: #ffccc7;
            background: #fff2f0;
        }
        .action-buttons button.delete:hover {
            background: #ffccc7;
        }
        @media (max-width: 720px) {
            .toolbar {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <section class="hero">
            <h1>Películas del cine</h1>
        </section>
        <div class="card">
            <div class="toolbar">
                <div>
                    <div class="status" id="statusText">Cargando películas...</div>
                </div>
                <button class="button primary" id="refreshButton">Actualizar</button>
            </div>
            <form id="movieForm">
                <input id="titulo" name="titulo" placeholder="Título" required />
                <input id="director" name="director" placeholder="Director" required />
                <input id="anio" name="anio" type="number" min="1888" placeholder="Año" required />
                <select id="genero" name="genero" required>
                    <option value="">Género</option>
                    <option value="Acción">Acción</option>
                    <option value="Comedia">Comedia</option>
                    <option value="Drama">Drama</option>
                    <option value="Terror">Terror</option>
                    <option value="Aventura">Aventura</option>
                    <option value="Ciencia ficción">Ciencia ficción</option>
                    <option value="Romance">Romance</option>
                </select>
                <button type="submit" class="button primary">Agregar película</button>
            </form>
            <div id="tableWrapper"></div>
        </div>
    </div>
    <script>
        const apiBase = '/api/peliculas';
        const statusText = document.getElementById('statusText');
        const tableWrapper = document.getElementById('tableWrapper');
        const movieForm = document.getElementById('movieForm');
        const refreshButton = document.getElementById('refreshButton');

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        async function renderMovies() {
            statusText.textContent = 'Cargando películas...';
            try {
                const response = await fetch(apiBase);
                const movies = await response.json();
                if (!Array.isArray(movies)) throw new Error('No se pudo obtener la lista. Verifica la conexión a la base de datos.');
                statusText.textContent = 'Mostrando ' + movies.length + ' película(s)';
                tableWrapper.innerHTML = movies.length === 0 ? '<div class="empty">No hay películas registradas.</div>' : renderTable(movies);
            } catch (error) {
                statusText.textContent = 'Error al cargar películas';
                tableWrapper.innerHTML = '<div class="empty">' + escapeHtml(error.message) + '</div>';
            }
        }

        function renderTable(movies) {
            let rows = '';
            movies.forEach(movie => {
                rows += '<tr>' +
                    '<td>' + escapeHtml(movie.id) + '</td>' +
                    '<td>' + escapeHtml(movie.titulo) + '</td>' +
                    '<td>' + escapeHtml(movie.director) + '</td>' +
                    '<td>' + escapeHtml(movie.anio) + '</td>' +
                    '<td><span class="tag">' + escapeHtml(movie.genero) + '</span></td>' +
                    '<td><div class="action-buttons">' +
                    '<button class="edit" onclick="editMovie(' + movie.id + ')">Editar</button>' +
                    '<button class="delete" onclick="deleteMovie(' + movie.id + ')">Eliminar</button>' +
                    '</div></td>' +
                '</tr>';
            });
            return '<table>' +
                '<thead><tr><th>ID</th><th>Título</th><th>Director</th><th>Año</th><th>Género</th><th>Acciones</th></tr></thead>' +
                '<tbody>' + rows + '</tbody>' +
                '</table>';
        }

        async function deleteMovie(id) {
            if (!confirm('¿Eliminar esta película?')) return;
            await fetch(apiBase + '/' + id, { method: 'DELETE' });
            renderMovies();
        }

        async function editMovie(id) {
            const response = await fetch(apiBase);
            const movies = await response.json();
            const movie = movies.find(m => m.id === id);
            if (!movie) return;
            const titulo = prompt('Título', movie.titulo);
            if (titulo === null) return;
            const director = prompt('Director', movie.director);
            if (director === null) return;
            const anio = prompt('Año', movie.anio);
            if (anio === null) return;
            const genero = prompt('Género', movie.genero);
            if (genero === null) return;
            await fetch(apiBase + '/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, director, anio: Number(anio), genero })
            });
            renderMovies();
        }

        movieForm.addEventListener('submit', async event => {
            event.preventDefault();
            const formData = new FormData(movieForm);
            await fetch(apiBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo: formData.get('titulo'),
                    director: formData.get('director'),
                    anio: Number(formData.get('anio')),
                    genero: formData.get('genero')
                })
            });
            movieForm.reset();
            renderMovies();
        });

        refreshButton.addEventListener('click', renderMovies);
        window.deleteMovie = deleteMovie;
        window.editMovie = editMovie;
        renderMovies();
    </script>
</body>
</html>
`;

app.get('/vista', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(paginaHTML);
});

app.get('/', (req, res) => {
    res.redirect('/vista');
});

app.listen(3000,()=>{
    console.log('Servidor corriendo en puerto 3000');
});
