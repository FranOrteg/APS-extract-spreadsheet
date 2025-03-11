/**
 * exportAllDataToXLSX.js
 *
 * Uso:
 *   1) Asegúrate de tener "hierarchy.json" y "properties.json" en la misma carpeta (o ajusta las rutas).
 *   2) Instala dependencias: `npm install xlsx`
 *   3) Ejecuta: `node exportAllDataToXLSX.js`
 */

const fs = require('fs');
const XLSX = require('xlsx');

// Rutas (ajusta si están en otra carpeta)
const HIERARCHY_FILE = './../json/hierarchy.json';
const PROPERTIES_FILE = './../json/properties.json';
const OUTPUT_EXCEL = 'Revit_Properties.xlsx';

// Verificar si los archivos existen
if (!fs.existsSync(HIERARCHY_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${HIERARCHY_FILE}`);
  process.exit(1);
}
if (!fs.existsSync(PROPERTIES_FILE)) {
  console.error(`❌ Error: No se encontró el archivo ${PROPERTIES_FILE}`);
  process.exit(1);
}

// Leer y parsear JSON
const hierarchy = JSON.parse(fs.readFileSync(HIERARCHY_FILE, 'utf8'));
const properties = JSON.parse(fs.readFileSync(PROPERTIES_FILE, 'utf8'));

// -------------------------------------------------------------------------------------
// Función recursiva para extraer TODOS los nodos de la jerarquía (todos los objectid).
// -------------------------------------------------------------------------------------
function collectAllObjects(nodeList, collector = []) {
  nodeList.forEach(node => {
    // Si tiene un objectid, lo agregamos
    if (typeof node.objectid !== 'undefined') {
      collector.push({
        objectid: node.objectid,
        name: node.name || '',
      });
    }
    // Si tiene sub-objetos, nos metemos recursivamente
    if (Array.isArray(node.objects)) {
      collectAllObjects(node.objects, collector);
    }
  });
  return collector;
}

// -------------------------------------------------------------------------------------
// 1) Recolectamos todos los objectid (y nombres) del hierarchy.json (recursivo).
// -------------------------------------------------------------------------------------
let allNodes = [];
if (hierarchy && hierarchy.data && hierarchy.data.objects) {
  allNodes = collectAllObjects(hierarchy.data.objects);
} else {
  console.error("❌ Estructura 'hierarchy.json' inesperada: no se encontró 'data.objects'.");
  process.exit(1);
}

// -------------------------------------------------------------------------------------
// 2) Mapear las propiedades: objectid -> { <grupoProp>: { ... } }
// -------------------------------------------------------------------------------------
const propsById = new Map();
if (properties && properties.data && properties.data.collection) {
  properties.data.collection.forEach(item => {
    propsById.set(item.objectid, item.properties);
  });
} else {
  console.error("❌ Estructura 'properties.json' inesperada: no se encontró 'data.collection'.");
  process.exit(1);
}

// -------------------------------------------------------------------------------------
// 3) Identificar todas las columnas posibles
//    - Siempre tendremos "Object ID" y "Name".
//    - Luego, por cada objeto en properties, sus grupos y sub-propiedades.
// -------------------------------------------------------------------------------------
const allColumns = new Set(["Object ID", "Name"]);

properties.data.collection.forEach(obj => {
  const objProps = obj.properties;
  for (const groupName in objProps) {
    // groupName = "Identity Data", "Constraints", etc.
    const groupProps = objProps[groupName];
    for (const propName in groupProps) {
      // Añadimos columna con formato "groupName:propName"
      allColumns.add(`${groupName}:${propName}`);
    }
  }
});

// Ordenar columnas para que siempre salgan en el mismo orden (opcional)
const sortedColumns = Array.from(allColumns);
// Si quieres dejar "Object ID" y "Name" siempre al inicio:
sortedColumns.sort((a, b) => {
  if (a === "Object ID") return -1;
  if (b === "Object ID") return 1;
  if (a === "Name") return -1;
  if (b === "Name") return 1;
  return a.localeCompare(b);
});

// -------------------------------------------------------------------------------------
// 4) Construir la matriz (AOA) para SheetJS:
//    - Fila 0 -> encabezados
//    - Resto de filas -> datos de cada objectid
// -------------------------------------------------------------------------------------
const rows = [];
rows.push(sortedColumns); // primera fila: cabecera

allNodes.forEach(node => {
  const row = [];
  const objProps = propsById.get(node.objectid) || {};

  sortedColumns.forEach(columnName => {
    if (columnName === "Object ID") {
      row.push(node.objectid);
      return;
    }
    if (columnName === "Name") {
      row.push(node.name);
      return;
    }

    // El resto de columnas tienen formato "group:property"
    const [groupName, propName] = columnName.split(':');
    const groupObj = objProps[groupName] || {};
    const value = groupObj[propName] != null ? groupObj[propName] : "";
    row.push(value);
  });

  rows.push(row);
});

// -------------------------------------------------------------------------------------
// 5) Generar la hoja XLS y guardarla
// -------------------------------------------------------------------------------------
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Revit Properties");
XLSX.writeFile(wb, OUTPUT_EXCEL);

console.log(`✅ Se ha generado correctamente el archivo "${OUTPUT_EXCEL}".`);
