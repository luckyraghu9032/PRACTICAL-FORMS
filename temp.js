
    // ── Sidebar toggle ──
    const sidebar   = document.getElementById('sidebar');
    const main      = document.getElementById('main');
    const toggleBtn = document.getElementById('toggle-btn');
    const toggleIcon= document.getElementById('toggle-icon');
    const overlay   = document.getElementById('overlay');
    let collapsed = false;

    function isMobile() { return window.innerWidth <= 768; }

    toggleBtn.addEventListener('click', () => {
        if (isMobile()) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('show');
        } else {
            collapsed = !collapsed;
            sidebar.classList.toggle('collapsed', collapsed);
            document.body.classList.toggle('collapsed', collapsed);
            toggleIcon.style.transform = collapsed ? 'rotate(180deg)' : '';
        }
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
    });

    // ── Navigation ──
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section');
    const pageTitle    = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const sectionMeta = {
        'dashboard':       { title: 'Dashboard',         sub: 'Welcome back — here\'s what\'s happening today' },
        'master-form':     { title: 'Master Form',        sub: 'Fill in the core details for a new claim entry' },
        'assign-claim':    { title: 'Assign Claim',       sub: 'Assign claim entries to staff members' },
        'claim-data':      { title: 'Claim Data',         sub: 'View and manage all claim records' },
        'remuneration':    { title: 'Remuneration',       sub: 'Manage staff remuneration and payment details' },
        'consolidated':    { title: 'Consolidated Form',  sub: 'Generate consolidated reports across all claim types' },
        'external-staff':  { title: 'External Staff',     sub: 'Manage external and visiting staff records' },
        'travel-claim':    { title: 'Travel Claim',       sub: 'Submit and manage travel reimbursement claims' },
        'change-password': { title: 'Change Password',    sub: 'Update your account password securely' },
    };

    function navigate(sectionKey) {
        navItems.forEach(n => n.classList.toggle('active', n.dataset.section === sectionKey));
        sections.forEach(s => s.classList.toggle('active', s.id === 'section-' + sectionKey));
        const meta = sectionMeta[sectionKey] || {};
        pageTitle.textContent    = meta.title || sectionKey;
        pageSubtitle.textContent = meta.sub   || '';
        if (isMobile()) { sidebar.classList.remove('mobile-open'); overlay.classList.remove('show'); }
    }

    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigate(item.dataset.section);
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', e => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    });

    // ── Password Strength ──
    function updateStrength(val) {
        const fill  = document.getElementById('strength-fill');
        const label = document.getElementById('strength-label');
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        const levels = [
            { w: '0%',   color: '#ef4444', text: '' },
            { w: '25%',  color: '#ef4444', text: 'Weak' },
            { w: '50%',  color: '#f59e0b', text: 'Fair' },
            { w: '75%',  color: '#0ea5e9', text: 'Good' },
            { w: '100%', color: '#22c55e', text: 'Strong' },
        ];
        const lvl = levels[score];
        fill.style.width = lvl.w;
        fill.style.background = lvl.color;
        label.textContent = lvl.text;
        label.style.color = lvl.color;
    }
    function changePassword() {
        const np = document.getElementById('new-pass').value;
        const cp = document.getElementById('confirm-pass').value;
        if (!np || !cp) { alert('Please fill in all fields.'); return; }
        if (np !== cp)  { alert('Passwords do not match!');   return; }
        alert('Password updated successfully!');
    }
