const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  database: 'joyas',
  port: 5432,
  allowExitOnIdle: true,
});

const prepararHateoas = (inventario) => {
    const results = inventario.map((m) => {
    return {
    name: m.nombre,
    href: `/inventario/${m.id}`,
    }
    }).slice(0, 4)
    const total = inventario.length
    const HATEOAS = {
    total,
    results
    }
    return HATEOAS
    }
    

const obtainJoyasFiltro = async ({ precio_max, precio_min, categoria, metal}) => {
    let filtros = [];
    const values = [];

    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor);
        const { length } = filtros;
        filtros.push(`${campo} ${comparador} $${length + 1}`);
    }   
    if (precio_max) agregarFiltro('precio', '>=', precio_max); 
    if (precio_min) agregarFiltro('precio', '<=', precio_min); 
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);

    let consulta = "SELECT * FROM inventario";
    if (filtros.length > 0) {
        filtros = filtros.join(" AND ");
        consulta += ` WHERE ${filtros}`;
    }

    const { rows: inventario } = await pool.query(consulta, values);
    return inventario;
}


const obtainJoyas = async ( {limits = 10, order_by="id_ASC", page=0} ) => { 

   const [columna, orden] = order_by.split ("_");
   const offset = page*limits;
   let consulta = format ("SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
   columna ,
   orden,
   limits,
   offset,
);
   console.log(consulta)
   console.log(order_by)
   console.log(columna)
   console.log(limits)

    const { rows: inventario} = await pool.query(consulta);
    return {total: 100, results: inventario};
};

module.exports = { obtainJoyas, obtainJoyasFiltro, prepararHateoas};

