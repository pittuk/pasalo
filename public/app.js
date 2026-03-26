/* ===================================
   PASALO EMPLEOS - Frontend App
   =================================== */

const API_BASE = window.location.origin;
let allJobs = [];
let displayedJobs = [];
let currentFilter = 'all';
let currentSearch = '';
let jobsPerPage = 12;
let currentPage = 1;

// ==========================================
// Init
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  setupEventListeners();
  loadJobs();
  checkUrlForJob();
});

// ==========================================
// Background Particles
// ==========================================
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#06d6a0', '#0ea5e9'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 6 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 15}s;
      animation-duration: ${12 + Math.random() * 10}s;
    `;
    container.appendChild(particle);
  }
}

// ==========================================
// Event Listeners
// ==========================================
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const val = e.target.value.trim();
    searchClear.style.display = val ? 'flex' : 'none';

    searchTimeout = setTimeout(() => {
      currentSearch = val.toLowerCase();
      currentPage = 1;
      filterAndDisplay();
    }, 300);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    currentSearch = '';
    currentPage = 1;
    filterAndDisplay();
    searchInput.focus();
  });

  // Filter chips
  document.getElementById('filterChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    currentPage = 1;
    filterAndDisplay();
  });

  // Load more
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    currentPage++;
    filterAndDisplay(true);
  });

  // Modal
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state?.jobId) {
      const job = allJobs.find(j => j.id === e.state.jobId);
      if (job) openModal(job, false);
    } else {
      closeModal(false);
    }
  });
}

// ==========================================
// API
// ==========================================
async function loadJobs() {
  try {
    const res = await fetch(`${API_BASE}/api/jobs?limit=200`);
    const data = await res.json();
    allJobs = data.jobs || [];

    document.getElementById('totalJobs').textContent = allJobs.length;
    document.getElementById('loadingState').style.display = 'none';

    filterAndDisplay();
  } catch (err) {
    console.error('Error loading jobs:', err);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('emptyState').querySelector('h3').textContent = 'Error al cargar';
    document.getElementById('emptyState').querySelector('p').textContent = 'No pudimos conectar con el servidor. Intentá más tarde.';
  }
}

// ==========================================
// Filter & Display
// ==========================================
function filterAndDisplay(append = false) {
  let filtered = [...allJobs];

  // Apply location filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(j =>
      j.ubicacion?.toLowerCase().includes(currentFilter.toLowerCase())
    );
  }

  // Apply search
  if (currentSearch) {
    filtered = filtered.filter(j => {
      const searchable = `${j.titulo} ${j.empresa} ${j.ubicacion} ${j.salario} ${j.descripcion}`.toLowerCase();
      return searchable.includes(currentSearch);
    });
  }

  displayedJobs = filtered;

  const grid = document.getElementById('jobsGrid');
  const empty = document.getElementById('emptyState');
  const loadMore = document.getElementById('loadMoreContainer');

  if (filtered.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    loadMore.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'grid';

  const totalToShow = currentPage * jobsPerPage;
  const jobsToShow = filtered.slice(0, totalToShow);

  if (!append) {
    grid.innerHTML = '';
  }

  const startIndex = append ? (currentPage - 1) * jobsPerPage : 0;
  const newJobs = append ? filtered.slice(startIndex, totalToShow) : jobsToShow;

  newJobs.forEach((job, i) => {
    const card = createJobCard(job, startIndex + i);
    grid.appendChild(card);
  });

  // Show/hide load more
  if (totalToShow < filtered.length) {
    loadMore.style.display = 'block';
  } else {
    loadMore.style.display = 'none';
  }
}

// ==========================================
// Job Card
// ==========================================
function createJobCard(job, index) {
  const card = document.createElement('article');
  card.className = 'job-card';
  card.style.animationDelay = `${(index % 9) * 0.05}s`;

  const timeAgo = getTimeAgo(job.createdAt);
  const salaryDisplay = formatSalary(job.salario);

  card.innerHTML = `
    <div class="job-card-header">
      <h2 class="job-card-title">${escapeHtml(job.titulo)}</h2>
      <span class="job-card-time">${timeAgo}</span>
    </div>
    <div class="job-card-company">
      <span>🏢</span>
      <span>${escapeHtml(job.empresa)}</span>
    </div>
    <div class="job-card-meta">
      <div class="job-meta-item">
        <span class="job-meta-icon">📍</span>
        <span>${escapeHtml(job.ubicacion)}</span>
      </div>
    </div>
    ${job.descripcion ? `<p class="job-card-desc">${escapeHtml(job.descripcion)}</p>` : ''}
    <div class="job-card-footer">
      <span class="job-salary-badge">💰 ${salaryDisplay}</span>
      <span class="job-apply-hint">Ver más →</span>
    </div>
  `;

  card.addEventListener('click', () => openModal(job));

  return card;
}

// ==========================================
// Modal
// ==========================================
function openModal(job, pushState = true) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const timeAgo = getTimeAgo(job.createdAt);
  const salaryDisplay = formatSalary(job.salario);
  const dateFormatted = new Date(job.createdAt).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  content.innerHTML = `
    <span class="modal-badge">📌 Publicado ${timeAgo}</span>
    <h2 class="modal-title">${escapeHtml(job.titulo)}</h2>

    ${job.imagen ? `<img class="modal-image" src="${escapeHtml(job.imagen)}" alt="${escapeHtml(job.titulo)}" loading="lazy">` : ''}

    <div class="modal-details">
      <div class="modal-detail-row">
        <span class="modal-detail-icon">🏢</span>
        <span class="modal-detail-label">Empresa</span>
        <span class="modal-detail-value">${escapeHtml(job.empresa)}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-icon">📍</span>
        <span class="modal-detail-label">Ubicación</span>
        <span class="modal-detail-value">${escapeHtml(job.ubicacion)}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-icon">💰</span>
        <span class="modal-detail-label">Salario</span>
        <span class="modal-detail-value">${salaryDisplay}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-icon">📅</span>
        <span class="modal-detail-label">Fecha</span>
        <span class="modal-detail-value">${dateFormatted}</span>
      </div>
    </div>

    ${job.descripcion ? `
      <div class="modal-description">
        ${escapeHtml(job.descripcion)}
      </div>
    ` : ''}

    <a href="${escapeHtml(job.link)}" target="_blank" rel="noopener noreferrer" class="modal-cta" id="modal-apply-btn">
      🚀 Postularme ahora
    </a>
    <span class="modal-cta-sub">Se abrirá en una nueva pestaña</span>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (pushState) {
    history.pushState({ jobId: job.id }, '', `/empleo/${job.id}`);
  }
}

function closeModal(pushState = true) {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';

  if (pushState && window.location.pathname.startsWith('/empleo/')) {
    history.pushState(null, '', '/');
  }
}

// ==========================================
// URL Routing (for shared links)
// ==========================================
function checkUrlForJob() {
  const match = window.location.pathname.match(/^\/empleo\/(.+)$/);
  if (match) {
    const jobId = match[1];
    // Wait for jobs to load, then open modal
    const interval = setInterval(() => {
      if (allJobs.length > 0) {
        clearInterval(interval);
        const job = allJobs.find(j => j.id === jobId);
        if (job) {
          openModal(job, false);
        }
      }
    }, 200);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
  }
}

// ==========================================
// Utilities
// ==========================================
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `hace ${diffMins}min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}sem`;
  return `hace ${Math.floor(diffDays / 30)}mes`;
}

function formatSalary(salary) {
  if (!salary || salary === 'A convenir' || salary === 'No especificado') {
    return 'A convenir';
  }
  return `$${salary}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
