const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'jobs.json');
const API_KEY = process.env.API_KEY || 'pasalo-empleos-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initialize jobs file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Helper: read jobs
function readJobs() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write jobs
function writeJobs(jobs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));
}

// Simple API key auth middleware
function authenticate(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'API key inválida' });
  }
  next();
}

// ==========================================
// PUBLIC API (no auth needed)
// ==========================================

// GET /api/jobs - List all active jobs (public)
app.get('/api/jobs', (req, res) => {
  const jobs = readJobs();
  const limit = parseInt(req.query.limit) || 50;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  // Filter only active jobs (not expired - 30 days max)
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const activeJobs = jobs
    .filter(j => (now - new Date(j.createdAt).getTime()) < thirtyDays)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const paginated = activeJobs.slice(offset, offset + limit);

  res.json({
    total: activeJobs.length,
    page,
    limit,
    jobs: paginated
  });
});

// GET /api/jobs/:id - Get single job (public)
app.get('/api/jobs/:id', (req, res) => {
  const jobs = readJobs();
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Empleo no encontrado' });
  }
  res.json(job);
});

// ==========================================
// PROTECTED API (needs API key)
// ==========================================

// POST /api/jobs - Create a new job (from n8n)
app.post('/api/jobs', authenticate, (req, res) => {
  const { titulo, empresa, ubicacion, salario, descripcion, link, imagen } = req.body;

  if (!titulo || !link) {
    return res.status(400).json({ error: 'Se requiere al menos titulo y link' });
  }

  const jobs = readJobs();

  const newJob = {
    id: generateId(),
    titulo: titulo || 'Oferta de Empleo',
    empresa: empresa || 'Empresa',
    ubicacion: ubicacion || 'Argentina',
    salario: salario || 'A convenir',
    descripcion: descripcion || '',
    link: link,
    imagen: imagen || null,
    createdAt: new Date().toISOString()
  };

  jobs.unshift(newJob); // Add at the beginning

  // Keep only last 200 jobs
  if (jobs.length > 200) {
    jobs.length = 200;
  }

  writeJobs(jobs);

  res.status(201).json({
    success: true,
    job: newJob,
    url: `/empleo/${newJob.id}`
  });
});

// DELETE /api/jobs/:id - Delete a job
app.delete('/api/jobs/:id', authenticate, (req, res) => {
  let jobs = readJobs();
  const index = jobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Empleo no encontrado' });
  }
  jobs.splice(index, 1);
  writeJobs(jobs);
  res.json({ success: true });
});

// SPA fallback - serve index.html for all non-API routes
app.get('/empleo/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ID generator
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

app.listen(PORT, () => {
  console.log(`🚀 Pasalo Empleos corriendo en http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/jobs`);
  console.log(`🔑 API Key: ${API_KEY}`);
});
