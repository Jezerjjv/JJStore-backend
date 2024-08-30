const express = require('express')
const { Pool } = require('pg');
const app = express()
const bodyParser = require("body-parser");
const cors = require("cors")
const pool = new Pool({
    user: 'postgres.wkoadqveehulpyedawoi',
    password: 'Playagrande.1991',
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
});

const PORT = process.env.PORT || 3977;

;
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/status", (request, response) => {
    response.status(200).send({ msg: "mensaje" })
});

app.get("/products", async (req, res) => {
    try {
        const query = "SELECT"
            + " p.id AS producto_id,"
            + " p.nombre AS producto_nombre,"
            + " p.descripcion,"
            + " p.precio,"
            + " p.descuento,"
            + " p.es_nuevo,"
            + " p.categoria_id,"
            + " array_agg(i.url) AS imagenes_urls"
            + " FROM "
            + "     public.productos p"
            + " LEFT JOIN "
            + "     public.imagenes i ON p.id = i.producto_id"
            + " WHERE habilitado = true"
            + " GROUP BY "
            + " p.id, p.nombre, p.descripcion, p.precio, p.descuento, p.es_nuevo;";
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).send('No hay productos');
        }
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
});

app.put("/product/enabled/:id", async (req, res) => {
    const id = req.params.id;
    const { habilitado } = req.body;
    try {
        const query = 'UPDATE productos SET habilitado = $1 WHERE id=$2';
        pool.query(query, [habilitado, id], (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(`User modified with ID: ${id}`)
        });

    } catch (error) {
        console.error(err);
        res.status(500).send('failed');
    }
})

app.delete("/product/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const query = 'DELETE FROM productos WHERE id=$1';
        pool.query(query, [id], (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(`Se ha eliminado correctamente el producto: ${id}`)
        });

    } catch (error) {
        console.error(err);
        res.status(500).send('failed');
    }
})

app.get("/allproducts", async (req, res) => {

    try {
        const query = "SELECT"
            + " p.id AS producto_id,"
            + " p.nombre AS producto_nombre,"
            + " p.descripcion,"
            + " p.precio,"
            + " p.descuento,"
            + " p.es_nuevo,"
            + " p.profundidad,"
            + " p.ancho,"
            + " p.alto,"
            + " p.link_wallapop,"
            + " p.habilitado,"
            + " COALESCE(array_agg(DISTINCT i.url) FILTER (WHERE i.url IS NOT NULL), ARRAY[]::text[]) AS imagenes_urls,"
            + " COALESCE(json_agg(DISTINCT jsonb_build_object('nombre', r.nombre, 'calificacion', r.calificacion, 'comentario', r.comentario, 'fecha', r.fecha)) FILTER (WHERE r.id IS NOT NULL), '[]') AS reseñas,"
            + " COALESCE(array_agg(DISTINCT c.codigo_hex) FILTER (WHERE c.id IS NOT NULL), ARRAY[]::text[]) AS colores"
            + " FROM "
            + "     public.productos p"
            + " LEFT JOIN "
            + "     public.imagenes i ON p.id = i.producto_id"
            + " LEFT JOIN "
            + "     public.reseñas r ON p.id = r.producto_id"
            + " LEFT JOIN"
            + "    public.productos_colores pc ON p.id = pc.producto_id"
            + " LEFT JOIN"
            + "    public.colores c ON pc.color_id = c.id"
            + " GROUP BY "
            + " p.id, p.nombre, p.descripcion, p.precio, p.descuento, p.es_nuevo;";
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).send('No hay productos');
        }
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
});


app.get("/product/:id_product", async (req, res) => {
    const id = req.params.id_product;

    try {
        const query = "SELECT"
            + " p.id AS producto_id,"
            + " p.nombre AS producto_nombre,"
            + " p.descripcion,"
            + " p.precio,"
            + " p.descuento,"
            + " p.es_nuevo,"
            + " p.profundidad,"
            + " p.ancho,"
            + " p.alto,"
            + " p.link_wallapop,"
            + " COALESCE(array_agg(DISTINCT i.url) FILTER (WHERE i.url IS NOT NULL), ARRAY[]::text[]) AS imagenes_urls,"
            + " COALESCE(json_agg(DISTINCT jsonb_build_object('nombre', r.nombre, 'calificacion', r.calificacion, 'comentario', r.comentario, 'fecha', r.fecha)) FILTER (WHERE r.id IS NOT NULL), '[]') AS reseñas,"
            + " COALESCE(array_agg(DISTINCT c.codigo_hex) FILTER (WHERE c.id IS NOT NULL), ARRAY[]::text[]) AS colores"
            + " FROM "
            + "     public.productos p"
            + " LEFT JOIN "
            + "     public.imagenes i ON p.id = i.producto_id"
            + " LEFT JOIN "
            + "     public.reseñas r ON p.id = r.producto_id"
            + " LEFT JOIN"
            + "    public.productos_colores pc ON p.id = pc.producto_id"
            + " LEFT JOIN"
            + "    public.colores c ON pc.color_id = c.id"
            + " WHERE p.id =" + id
            + " GROUP BY "
            + " p.id, p.nombre, p.descripcion, p.precio, p.descuento, p.es_nuevo;";
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).send('No hay productos');
        }
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
});


app.post("/product/save", async (req, res) => {
    const { nombre, descripcion, precio, categoria_id, descuento, es_nuevo, profundidad, ancho, alto, habilitado, link_wallapop, imageUrls, selectedColors } = req.body.values
    try {
        const query = 'INSERT INTO productos(nombre, descripcion, precio, categoria_id, descuento, es_nuevo, profundidad, ancho, alto, habilitado, link_wallapop) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id';
        const result = await pool.query(query, [nombre, descripcion, precio, categoria_id, descuento, es_nuevo, profundidad, ancho, alto, habilitado, link_wallapop]);
        var idNewProduct = result.rows[0].id;
        const queryImagenes = "INSERT INTO imagenes (producto_id, url) VALUES($1,$2)";
        const b = await imageUrls.map(async m => {
            const result2 = await pool.query(queryImagenes, [idNewProduct, m]);
        })
        const queryColores = "INSERT INTO productos_colores (producto_id, color_id) VALUES($1,$2)";
        const a = await selectedColors.map(async m => {
            const result3 = await pool.query(queryColores, [idNewProduct, m]);
        })
        if (result.rows.length > 0) {
            res.send({ code: 201, result });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('failed');
    }
})


app.delete("/products/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const queryColores = 'DELETE FROM productos_colores WHERE producto_id=$1';
        var result = await pool.query(queryColores, [id]);
        if (result.rowCount === 0) {
            console.log("Producto sin colores, procedemos a borrar el producto");
        }

        const queryImagenes = 'DELETE FROM imagenes WHERE producto_id=$1';
        var result = await pool.query(queryImagenes, [id]);

        if (result.rowCount === 0) {
            console.log("producto sin imagenes, procedemos a borrar el producto");
            //return res.status(404).json({ error: 'Producto no encontrado o producto sin imagen, procedemos a borrar el producto' });
        }


        const query = 'DELETE FROM productos WHERE id=$1';
        var result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.status(200).json(`Se ha eliminado correctamente el producto: ${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('failed');
    }
})


app.listen(PORT, () => {
    console.log(`Server corriendo en ${PORT}`);
});


/** CATEGORIAS */


app.get("/categories", async (req, res) => {
    try {
        const query = 'SELECT * FROM categorias';
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).send('No hay categorias');
        }
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
});


app.delete("/categories/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const query = 'DELETE FROM categorias WHERE id=$1';
        pool.query(query, [id], (error, results) => {
            if (error) {
                throw error
            }
            return res.status(200).json(`Se ha eliminado correctamente la categoria: ${id}`)
        });

    } catch (error) {
        console.error(err);
        res.status(500).send('failed');
    }
})


app.post('/categories', async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
        }

        const query = 'INSERT INTO categorias (nombre) VALUES ($1)';
        const result = await pool.query(query, [nombre]);
        return res.status(201).json({
            message: 'Categoría insertada exitosamente',
            category: {
                id: "",
                nombre
            }
        });
    } catch (error) {
        console.error('Error al insertar la categoría:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.put('/categories/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const { nombre } = req.body;

        const query = 'UPDATE categorias SET nombre = $1 WHERE id=$2';
        const result = await pool.query(query, [nombre, id]);
        res.status(201).json({
            message: 'Categoría actualizada exitosamente',
            category: {
                id: id,
                nombre
            }
        });
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


/** COLORES */


app.get("/colors", async (req, res) => {
    try {
        const query = 'SELECT * FROM colores';
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.status(404).send('No hay colores');
        }
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
});

app.delete("/colors/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const query = 'DELETE FROM colores WHERE id=$1';
        pool.query(query, [id], (error, results) => {
            if (error) {
                throw error
            }
            res.status(200).json(`Se ha eliminado correctamente el color: ${id}`)
        });

    } catch (error) {
        console.error(err);
        res.status(500).send('failed');
    }
})


app.post('/colors', async (req, res) => {
    console.log("entre");
    try {
        const { nombre, codigo_hex } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del color es requerido' });
        }

        const query = 'INSERT INTO colores (nombre, codigo_hex) VALUES ($1, $2)';
        const result = await pool.query(query, [nombre, codigo_hex]);
        res.status(201).json({
            message: 'Color insetado exitosamente',
            category: {
                id: "",
                nombre
            }
        });
    } catch (error) {
        console.error('Error al insertar el color:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.put('/colors/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const { nombre, codigo_hex } = req.body;

        const query = 'UPDATE colores SET nombre = $1, codigo_hex = $2 WHERE id=$3';
        const result = await pool.query(query, [nombre, codigo_hex, id]);
        res.status(201).json({
            message: 'Color insetado exitosamente',
            category: {
                id: id,
                nombre
            }
        });
    } catch (error) {
        console.error('Error al actualizar el color:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



module.exports = app;