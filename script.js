(function () {
  'use strict';

  /* ─────────────────────────────────────────
     DATA STORE
  ───────────────────────────────────────── */
  const DEFAULT_MATERIALS = [
    {
      id: 1, icon: '📄', title: 'All Branch 2nd Semester PYQ 2025',
      desc: 'Complete question paper set for all diploma branches — Sem II.',
      year: '2025', sem: '2', branch: 'all',
      badge: 'trend', dlCount: '224', downloads: 224,
      link: 'https://drive.google.com/uc?export=download&id=1blqZ71flbzri37axO_h0pXUtOkwJ5Sxe',
      color: 'linear-gradient(135deg,#0ea5e9,#6366f1)'
    },
    {
      id: 2, icon: '⚙️', title: 'Even Semester Exam Scheme May 2026',
      desc: 'Even Semester Exam Scheme May 2026 updated 28/04/2026. as BTEUP Portal',
      year: '2026', sem: 'even', branch: 'All',
      badge: 'verified', dlCount: '980', downloads: 980,
      link: 'https://drive.google.com/uc?export=download&id=14-349hXv_IwV0h6NpKJmel0Vptdp2mPk',
      color: 'linear-gradient(135deg,#f59e0b,#ef4444)'
    },
    {
      id: 4, icon: '💻', title: 'Even Semester B & OPB Exam Scheme May 2026',
      desc: 'Exam Scheme May B & OPB updated 28/04/2026 as BTEUP Portal.',
      year: '2026', sem: 'even', branch: 'all',
      badge: 'trend', dlCount: '3.1k', downloads: 3100,
      link: 'https://drive.google.com/uc?export=download&id=112YsazQiy8avWRTR9EleUa5K9Mvu4wSs',
      color: 'linear-gradient(135deg,#8b5cf6,#06b6d4)'
    },
    {
      id: 3, icon: '🔬', title: 'Physics I Important Questions by Sir',
      desc: 'Curated must-do questions from last 5 years of Physics papers.',
      year: '2023', sem: '1', branch: 'all',
      badge: 'downloads', dlCount: '1.2k', downloads: 1200,
      link: 'https://drive.google.com/uc?export=download&id=11N3iyS5jf2bGe6rg8B-uUar3AsIsfPVF',
      color: 'linear-gradient(135deg,#10b981,#0ea5e9)'
    },
    {
      id: 5, icon: '⚡', title: 'Electrical Engineering PYQ 2023',
      desc: 'EE branch Semester II — Circuit Theory and Machines questions.',
      year: '2023', sem: '2', branch: 'electrical',
      badge: 'verified', dlCount: '860', downloads: 860,
      link: 'https://drive.google.com/uc?export=download&id=11Y13ML_ZeXeSe6mQZrUc6nPNvWuluG2E',
      color: 'linear-gradient(135deg,#f59e0b,#8b5cf6)'
    },
    {
      id: 6, icon: '🔌', title: 'Electronics Engineering PYQ 2022',
      desc: 'ECE branch 4th semester — Analog Electronics and Digital Circuits.',
      year: '2022', sem: '4', branch: 'electronics',
      badge: 'none', dlCount: '540', downloads: 540,
      link: 'https://drive.google.com/uc?export=download&id=11Y13ML_ZeXeSe6mQZrUc6nPNvWuluG2E',
      color: 'linear-gradient(135deg,#ec4899,#6366f1)'
    },
    {
      id: 7, icon: '🏗️', title: 'Civil Engineering PYQ 2024',
      desc: 'Civil branch Semester IV — Structural Analysis and Surveying.',
      year: '2024', sem: '4', branch: 'civil',
      badge: 'verified', dlCount: '720', downloads: 720,
      link: 'https://drive.google.com/uc?export=download&id=11Y13ML_ZeXeSe6mQZrUc6nPNvWuluG2E',
      color: 'linear-gradient(135deg,#10b981,#6366f1)'
    },
    {
      id: 8, icon: '🧮', title: 'Applied Mathematics PYQ 2023',
      desc: 'All-branch Maths Semester II — Integration, Matrices and Laplace.',
      year: '2023', sem: '2', branch: 'all',
      badge: 'trend', dlCount: '4.5k', downloads: 4500,
      link: 'https://drive.google.com/uc?export=download&id=11Y13ML_ZeXeSe6mQZrUc6nPNvWuluG2E',
      color: 'linear-gradient(135deg,#0ea5e9,#10b981)'
    }
  ];

  /* ─────────────────────────────────────────
     STATE
  ───────────────────────────────────────── */
  let materials = JSON.parse(localStorage.getItem('ds-materials') || 'null') || DEFAULT_MATERIALS;
  let editId = null;
  let activePreviewLink = '';
  const CREDS = { user: 'admin', pass: 'admin123' };

  const save = () => localStorage.setItem('ds-materials', JSON.stringify(materials));

  /* ─────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const norm = s => (s || '').toLowerCase().trim();
  const escHtml = s => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const SEM_LABELS = { '1':'Ist','2':'IInd','3':'IIIrd','4':'IVth','5':'Vth','6':'VIth' };
  const BRANCH_LABELS = {
    all:'All Branches', electrical:'Electrical', electronics:'Electronics',
    cs:'Computer Science', mechanical:'Mechanical', civil:'Civil'
  };
  const semLabel   = s => SEM_LABELS[s]   || `Sem ${s}`;
  const branchLabel = b => BRANCH_LABELS[b] || b;

  /* ─────────────────────────────────────────
     BRANCH THUMBNAIL IMAGES (Unsplash CDN)
  ───────────────────────────────────────── */
  const BRANCH_IMAGES = {
    electrical:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75',
    electronics: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=75',
    cs:          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=75',
    mechanical:  'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=600&q=75',
    civil:       'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=75',
    all:         'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=75',
  };
  const getBranchImg = branch => BRANCH_IMAGES[branch] || BRANCH_IMAGES.all;

  /* ─────────────────────────────────────────
     CARD RENDERER — Dynamic .map()
  ───────────────────────────────────────── */
  const BADGE_MAP = {
    trend:     { cls:'badge-trend',     txt:'🔥 Trending'       },
    verified:  { cls:'badge-verified',  txt:'✅ Verified'        },
    downloads: { cls:'badge-downloads', txt:'⬇️ 1.2k Downloads' },
    none:      null
  };

  function buildCard(m, idx) {
    const badge  = BADGE_MAP[m.badge] || null;
    const bgImg  = getBranchImg(m.branch);
    const card   = document.createElement('article');
    card.className = 'card';
    card.style.animationDelay = `${idx * 0.06}s`;
    card.dataset.id = m.id;

    card.innerHTML = `
      <div class="card-thumb">
        <div class="card-thumb-bg" style="
          background-image: url('${bgImg}');
          background-size: cover;
          background-position: center;
        "></div>
        <div class="card-thumb-overlay" style="background:${escHtml(m.color)}; position:absolute; inset:0; opacity:0.78;"></div>
        <div class="card-thumb-icon" aria-hidden="true">${escHtml(m.icon)}</div>
        <div class="card-thumb-badges" aria-hidden="true">
          ${badge ? `<span class="social-badge ${badge.cls}">${badge.txt}</span>` : ''}
        </div>
        <span class="card-year-chip" aria-label="Year ${m.year}">${escHtml(m.year)}</span>
      </div>
      <div class="card-body">
        <div class="card-tags" aria-label="Tags">
          <span class="card-tag">Sem ${semLabel(m.sem)}</span>
          <span class="card-tag">${branchLabel(m.branch)}</span>
          ${m.dlCount ? `<span class="card-tag">↓ ${escHtml(m.dlCount)}</span>` : ''}
        </div>
        <h3 class="card-title">${escHtml(m.title)}</h3>
        <p class="card-desc">${escHtml(m.desc)}</p>
      </div>
      <div class="card-actions">
        <button class="btn-download" data-link="${escHtml(m.link)}" data-id="${m.id}" aria-label="Download ${escHtml(m.title)}">⬇ Download</button>
        <button class="btn-preview" data-id="${m.id}" aria-label="Quick preview ${escHtml(m.title)}">👁 Preview</button>
      </div>
    `;
    return card;
  }

  /* ─────────────────────────────────────────
     FILTER + SORT + RENDER
  ───────────────────────────────────────── */
  function getFilteredSorted() {
    const qv = norm($('q').value);
    const yr = $('fYear').value;
    const sm = $('fSem').value;
    const br = $('fBranch').value;
    const sort = $('fSort').value;

    let result = materials.filter(m => (
      (!qv || (norm(m.title) + norm(m.desc) + norm(m.branch) + norm(m.year)).includes(qv)) &&
      (!yr || m.year === yr) &&
      (!sm || m.sem === sm) &&
      (!br || m.branch === br)
    ));

    if (sort === 'newest')    result = [...result].sort((a, b) => Number(b.year) - Number(a.year));
    if (sort === 'downloads') result = [...result].sort((a, b) => (b.downloads||0) - (a.downloads||0));
    if (sort === 'az')        result = [...result].sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }

  function renderCards() {
    const grid = $('cardsGrid');
    const empty = $('emptyState');
    const meta  = $('resultsMeta');
    const list  = getFilteredSorted();

    grid.innerHTML = '';
    list.forEach((m, i) => grid.appendChild(buildCard(m, i)));

    empty.style.display = list.length === 0 ? 'block' : 'none';
    meta.innerHTML = list.length > 0
      ? `Showing <span>${list.length}</span> of ${materials.length} documents`
      : '';

    // Re-attach card events
    grid.querySelectorAll('.btn-download').forEach(btn => {
      btn.addEventListener('click', () => handleDownload(btn.dataset.link, btn));
    });
    grid.querySelectorAll('.btn-preview').forEach(btn => {
      btn.addEventListener('click', () => openQuickView(Number(btn.dataset.id)));
    });
  }

  /* ─────────────────────────────────────────
     LIVE SEARCH — INSTANT
  ───────────────────────────────────────── */
  let debounceTimer;
  $('q').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderCards, 120);
  });
  ['fYear','fSem','fBranch','fSort'].forEach(id =>
    $(id).addEventListener('change', renderCards)
  );
  $('resetBtn').addEventListener('click', () => {
    ['q','fYear','fSem','fBranch','fSort'].forEach(id => { const el=$(id); el.value=''; if(el.tagName==='SELECT')el.selectedIndex=0; });
    $('q').value = '';
    renderCards();
  });

  /* ─────────────────────────────────────────
     DOWNLOAD + CONFETTI FX
  ───────────────────────────────────────── */
  function handleDownload(link, btn) {
    // Open download
    window.open(link, '_blank', 'noopener');

    // Confetti burst
    const rect = btn.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top  + rect.height/ 2) / window.innerHeight;

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      colors: ['#00d4ff','#6366f1','#8b5cf6','#10b981','#f59e0b','#ffffff'],
      scalar: 0.9,
      ticks: 200,
      startVelocity: 28,
      gravity: 0.85
    });
  }

  /* ─────────────────────────────────────────
     QUICK VIEW MODAL
  ───────────────────────────────────────── */
  function openQuickView(id) {
    const m = materials.find(x => x.id === id);
    if (!m) return;
    activePreviewLink = m.link;

    $('qvTitle').textContent     = m.title;
    $('qvPdfTitle').textContent  = m.title;
    $('qvPdfSub').textContent    = `${m.year} · Sem ${semLabel(m.sem)} · ${branchLabel(m.branch)}`;

    // Generate mock PDF lines
    const lines = $('qvPdfLines');
    lines.innerHTML = '';
    const widths = [100,82,95,68,88,75,100,60,90,78,85,70,92,65,88,74,80];
    widths.forEach((w,i) => {
      const l = document.createElement('div');
      l.className = 'pdf-line';
      l.style.cssText = `width:${w}%;animation-delay:${i*0.06}s`;
      lines.appendChild(l);
    });

    // Info chips
    $('qvInfo').innerHTML = [
      `📅 ${m.year}`,
      `📚 Sem ${semLabel(m.sem)}`,
      `🏫 ${branchLabel(m.branch)}`,
      `⬇️ ${m.dlCount || '—'} downloads`
    ].map(t => `<span class="modal-info-chip">${t}</span>`).join('');

    $('qvOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  $('qvClose').addEventListener('click', closeModal('qvOverlay'));
  $('qvOverlay').addEventListener('click', e => { if (e.target === $('qvOverlay')) closeModal('qvOverlay')(); });
  $('qvDownloadBtn').addEventListener('click', () => {
    if (activePreviewLink) handleDownload(activePreviewLink, $('qvDownloadBtn'));
  });

  function closeModal(id) {
    return () => { $(id).classList.remove('open'); document.body.style.overflow = ''; };
  }

  /* ─────────────────────────────────────────
     DARK / LIGHT MODE
  ───────────────────────────────────────── */
  const html = document.documentElement;
  const setTheme = dark => {
    html.setAttribute('data-theme', dark ? 'dark' : 'light');
    $('darkBtn').textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('ds-theme', dark ? 'dark' : 'light');
  };
  const saved = localStorage.getItem('ds-theme');
  if (saved === 'light') setTheme(false);
  else if (!saved && !window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(false);
  $('darkBtn').addEventListener('click', () => setTheme(html.getAttribute('data-theme') !== 'dark'));

  /* ─────────────────────────────────────────
     STICKY NAV + SCROLL TOP
  ───────────────────────────────────────── */
  const nav = $('nav');
  const stb = $('stb');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
    stb.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  stb.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ─────────────────────────────────────────
     HAMBURGER
  ───────────────────────────────────────── */
  const ham = $('ham');
  const navLinks = $('navLinks');
  ham.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    ham.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) navLinks.classList.remove('open');
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );

  /* ─────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────── */
  $('openLoginBtn').addEventListener('click', () => {
    $('loginOverlay').classList.add('open');
    $('loginUser').focus();
    document.body.style.overflow = 'hidden';
  });
  $('loginClose').addEventListener('click', () => {
    $('loginOverlay').classList.remove('open');
    $('loginErr').style.display = 'none';
    document.body.style.overflow = '';
  });
  $('loginOverlay').addEventListener('click', e => {
    if (e.target === $('loginOverlay')) {
      $('loginOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  function doLogin() {
    const u = $('loginUser').value.trim();
    const p = $('loginPass').value;
    if (u === CREDS.user && p === CREDS.pass) {
      $('loginOverlay').classList.remove('open');
      $('loginErr').style.display = 'none';
      $('loginPass').value = '';
      openAdmin();
    } else {
      $('loginErr').style.display = 'block';
      $('loginPass').value = '';
      $('loginPass').focus();
    }
  }
  $('loginBtn').addEventListener('click', doLogin);
  $('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  /* ─────────────────────────────────────────
     ADMIN PANEL
  ───────────────────────────────────────── */
  function openAdmin() {
    $('adminOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNotesCount();
    showTab('add');
  }
  $('adminClose').addEventListener('click', () => {
    $('adminOverlay').classList.remove('open');
    document.body.style.overflow = '';
    resetForm();
  });
  $('adminOverlay').addEventListener('click', e => {
    if (e.target === $('adminOverlay')) {
      $('adminOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  window.showTab = function(tab) {
    ['add','list'].forEach(t => {
      $(`pane${t.charAt(0).toUpperCase()+t.slice(1)}`).classList.toggle('active', t === tab);
      $(`tabBtn${t.charAt(0).toUpperCase()+t.slice(1)}`).classList.toggle('active', t === tab);
      $(`tabBtn${t.charAt(0).toUpperCase()+t.slice(1)}`).setAttribute('aria-selected', t === tab);
    });
    if (tab === 'list') renderAdminList();
  };

  function updateNotesCount() {
    $('notesCount').textContent = materials.length;
  }

  /* SAVE / UPDATE */
  $('saveBtn').addEventListener('click', () => {
    const title  = $('fTitle').value.trim();
    const desc   = $('fDesc').value.trim();
    const year   = $('fYr').value;
    const sem    = $('fSemF').value;
    const branch = $('fBranchF').value;
    const icon   = $('fIcon').value;
    const badge  = $('fBadge').value;
    const dlCount= $('fDlCount').value.trim();
    const link   = $('fLink').value.trim();
    const fb     = $('formFeedback');

    if (!title || !year || !sem || !branch || !link) {
      fb.className = 'form-feedback err';
      fb.textContent = '⚠️ Please fill in all required (*) fields.';
      return;
    }

    const COLORS = {
      electrical:'linear-gradient(135deg,#f59e0b,#8b5cf6)',
      electronics:'linear-gradient(135deg,#ec4899,#6366f1)',
      cs:'linear-gradient(135deg,#8b5cf6,#06b6d4)',
      mechanical:'linear-gradient(135deg,#f59e0b,#ef4444)',
      civil:'linear-gradient(135deg,#10b981,#6366f1)',
      all:'linear-gradient(135deg,#0ea5e9,#6366f1)'
    };

    if (editId !== null) {
      const idx = materials.findIndex(m => m.id === editId);
      if (idx !== -1) {
        materials[idx] = { ...materials[idx], title, desc, year, sem, branch, icon, badge, dlCount, link };
      }
      editId = null;
      fb.className = 'form-feedback ok';
      fb.textContent = '✅ Note updated successfully!';
    } else {
      materials.push({
        id: Date.now(), title, desc, year, sem, branch, icon, badge,
        dlCount, downloads: 0, link,
        color: COLORS[branch] || COLORS.all
      });
      fb.className = 'form-feedback ok';
      fb.textContent = '✅ Note added successfully!';
    }

    save();
    renderCards();
    updateNotesCount();
    resetForm();
    setTimeout(() => { fb.className = 'form-feedback'; fb.textContent = ''; }, 2800);
  });

  /* ADMIN LIST */
  function renderAdminList() {
    const list = $('adminNotesList');
    if (!materials.length) {
      list.innerHTML = '<div class="admin-empty">No notes added yet. Use "Add Note" tab.</div>';
      return;
    }
    list.innerHTML = '';
    materials.forEach(m => {
      const item = document.createElement('div');
      item.className = 'admin-note-item';
      item.innerHTML = `
        <span class="ani-icon" aria-hidden="true">${escHtml(m.icon)}</span>
        <div class="ani-info">
          <div class="ani-title">${escHtml(m.title)}</div>
          <div class="ani-meta">${m.year} · Sem ${semLabel(m.sem)} · ${branchLabel(m.branch)} · ↓${m.dlCount||'0'}</div>
        </div>
        <div class="ani-actions">
          <button class="btn-ed" data-id="${m.id}" aria-label="Edit ${escHtml(m.title)}">✏️ Edit</button>
          <button class="btn-rm" data-id="${m.id}" aria-label="Delete ${escHtml(m.title)}">🗑 Del</button>
        </div>
      `;
      list.appendChild(item);
    });
    list.querySelectorAll('.btn-ed').forEach(b =>
      b.addEventListener('click', () => startEdit(Number(b.dataset.id)))
    );
    list.querySelectorAll('.btn-rm').forEach(b =>
      b.addEventListener('click', () => deleteNote(Number(b.dataset.id)))
    );
  }

  function startEdit(id) {
    const m = materials.find(x => x.id === id);
    if (!m) return;
    editId = id;
    $('fTitle').value   = m.title;
    $('fDesc').value    = m.desc;
    $('fYr').value      = m.year;
    $('fSemF').value    = m.sem;
    $('fBranchF').value = m.branch;
    $('fIcon').value    = m.icon;
    $('fBadge').value   = m.badge || 'none';
    $('fDlCount').value = m.dlCount || '';
    $('fLink').value    = m.link;
    $('saveBtn').textContent = '💾 Update Note';
    $('cancelEditBtn').style.display = '';
    showTab('add');
    $('fTitle').focus();
  }

  function deleteNote(id) {
    if (!confirm('Delete this note permanently?')) return;
    materials = materials.filter(m => m.id !== id);
    save();
    renderCards();
    renderAdminList();
    updateNotesCount();
  }

  window.resetForm = function() {
    editId = null;
    ['fTitle','fDesc','fLink','fDlCount'].forEach(id => $(id).value = '');
    ['fYr','fSemF','fBranchF'].forEach(id => $(id).selectedIndex = 0);
    $('fIcon').value = '📄';
    $('fBadge').value = 'none';
    $('saveBtn').textContent = '💾 Save Note';
    $('cancelEditBtn').style.display = 'none';
    const fb = $('formFeedback');
    fb.className = 'form-feedback'; fb.textContent = '';
  };

  /* ─────────────────────────────────────────
     CONTACT DRAWER
  ───────────────────────────────────────── */
  function openContactDrawer() {
    const backdrop = $('contactBackdrop');
    const drawer   = $('contactDrawer');
    backdrop.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    // slight delay so CSS transition fires
    requestAnimationFrame(() => backdrop.classList.add('visible'));
    $('cdName').focus();
  }
  function closeContactDrawer() {
    const backdrop = $('contactBackdrop');
    const drawer   = $('contactDrawer');
    backdrop.classList.remove('visible');
    drawer.classList.remove('open');
    setTimeout(() => backdrop.classList.remove('open'), 320);
    document.body.style.overflow = '';
  }

  // Triggers — footer button, nav contact link, backdrop click, close btn
  $('footerContactBtn').addEventListener('click', openContactDrawer);
  $('cdClose').addEventListener('click', closeContactDrawer);
  $('contactBackdrop').addEventListener('click', closeContactDrawer);

  // Nav "Contact" link → open drawer
  document.querySelectorAll('a[href="#contact"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); openContactDrawer(); });
  });

  // Send button
  $('cdSendBtn').addEventListener('click', () => {
    const name  = $('cdName').value.trim();
    const email = $('cdEmail').value.trim();
    const msg   = $('cdMsg').value.trim();
    const fb    = $('cdFeedback');
    if (!name || !email || !msg) {
      fb.className = 'cd-feedback err';
      fb.textContent = '⚠️ Please fill in all required fields.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fb.className = 'cd-feedback err';
      fb.textContent = '⚠️ Please enter a valid email address.';
      return;
    }
    $('cdSendBtn').innerHTML = '<span>⏳</span> Sending…';
    $('cdSendBtn').disabled = true;
    setTimeout(() => {
      fb.className = 'cd-feedback ok';
      fb.textContent = '✅ Message sent! We\'ll get back to you soon.';
      ['cdName','cdEmail','cdSubject','cdMsg'].forEach(id => $(id).value = '');
      $('cdSendBtn').innerHTML = '<span>✉️</span> Send Message';
      $('cdSendBtn').disabled = false;
      setTimeout(() => { fb.className = 'cd-feedback'; fb.textContent = ''; }, 5000);
    }, 1300);
  });

  /* ─────────────────────────────────────────
     KEYBOARD ACCESSIBILITY
  ───────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['qvOverlay','loginOverlay','adminOverlay'].forEach(id => {
        if ($(id).classList.contains('open')) {
          $(id).classList.remove('open');
          document.body.style.overflow = '';
        }
      });
      if ($('contactDrawer').classList.contains('open')) closeContactDrawer();
    }
  });

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('skelGrid').style.display = 'none';
      $('cardsGrid').style.visibility = '';
      renderCards();
    }, 650);
  });

})();
