const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'jobs.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const sampleJobs = [
  {
    id: 'demo001',
    titulo: 'Desarrollador Full Stack',
    empresa: 'TechCorp Argentina',
    ubicacion: 'Buenos Aires, CABA',
    salario: '800.000 - 1.200.000',
    descripcion: 'Buscamos desarrollador Full Stack con experiencia en React y Node.js. Modalidad híbrida, excelentes beneficios y plan de carrera.',
    link: 'https://www.computrabajo.com.ar/ofertas-de-trabajo/',
    imagen: null,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'demo002',
    titulo: 'Analista Contable Sr',
    empresa: 'Grupo Financiero Sur',
    ubicacion: 'Córdoba, Córdoba',
    salario: '650.000',
    descripcion: 'Importante empresa busca analista contable con 3+ años de experiencia. Conocimientos en SAP valorados.',
    link: 'https://www.computrabajo.com.ar/ofertas-de-trabajo/',
    imagen: null,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'demo003',
    titulo: 'Vendedor/a para Local Comercial',
    empresa: 'Moda Express',
    ubicacion: 'Rosario, Santa Fe',
    salario: '450.000 + comisiones',
    descripcion: 'Se busca vendedor/a con experiencia en atención al público. Turno completo de lunes a sábados.',
    link: 'https://www.computrabajo.com.ar/ofertas-de-trabajo/',
    imagen: null,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'demo004',
    titulo: 'Operario de Producción',
    empresa: 'Industria Mendocina SA',
    ubicacion: 'Mendoza, Mendoza',
    salario: '520.000',
    descripcion: 'Empresa industrial necesita operarios para línea de producción. Se ofrece capacitación, obra social y comedor en planta.',
    link: 'https://www.computrabajo.com.ar/ofertas-de-trabajo/',
    imagen: null,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'demo005',
    titulo: 'Community Manager',
    empresa: 'Agencia Digital 360',
    ubicacion: 'Buenos Aires, CABA',
    salario: '550.000 - 700.000',
    descripcion: 'Buscamos CM creativo/a para manejar redes sociales de clientes de primer nivel. Trabajo remoto, horario flexible.',
    link: 'https://www.computrabajo.com.ar/ofertas-de-trabajo/',
    imagen: null,
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
  },
  {
    id: 'demo006',
    titulo: 'Chofer de Reparto',
    empresa: 'Distribuidora del Centro',
    ubicacion: 'Córdoba, Córdoba',
    salario: '480.000',
    descripcion: 'Se requiere chofer con registro profesional para reparto en zona centro. Vehículo de la empresa.',
    link: 'https://www.computrabajo.com.ar/ofertas-de-trabajo/',
    imagen: null,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

fs.writeFileSync(DATA_FILE, JSON.stringify(sampleJobs, null, 2));
console.log(`✅ Seed completado: ${sampleJobs.length} empleos de ejemplo creados`);
