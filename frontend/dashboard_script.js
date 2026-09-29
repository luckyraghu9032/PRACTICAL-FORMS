
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



    // ── Remuneration Calc ──
    function calcNetPay() {
        const appeared = parseFloat(document.getElementById('rem-appeared-students').value) || 0;
        const rate = parseFloat(document.getElementById('rem-rate-rs').value) || 0;
        const ta = parseFloat(document.getElementById('rem-ta').value) || 0;
        const da = parseFloat(document.getElementById('rem-da').value) || 0;
        
        const rem = appeared * rate;
        document.getElementById('rem-calc-remuneration').value = rem > 0 ? rem : '';
        
        const total = rem + ta + da;
        document.getElementById('rem-total').value = total > 0 ? '₹ ' + total.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '';
    }

    // ── Reset form ──
    function resetRemunerationForm() {
        const ids = [
            'rem-claim-no', 'rem-faculty-id-name', 'rem-institute', 'rem-school-course', 
            'rem-subject', 'rem-sub-type', 'rem-date', 'rem-time-slot', 'rem-div-batch', 
            'rem-present-count', 'rem-lab', 'rem-ext-int', 'rem-staff-id', 
            'rem-appeared-students', 'rem-rate-rs', 'rem-calc-remuneration', 
            'rem-ta', 'rem-da', 'rem-total', 'rem-bank-name', 'rem-account-no', 
            'rem-ifsc-code', 'rem-branch'
        ];
        ids.forEach(id => {
            document.getElementById(id).value = '';
        });
    }

    // ── Save (stub) ──
    function saveRemunerationEntry() {
        const name = document.getElementById('rem-faculty-id-name').value.trim();
        if (!name) { alert('Please enter Faculty ID / Name before saving.'); return; }
        alert('Entry for "' + name + '" saved successfully!');
    }


    // ── Export ──
    function exportRemuneration(type) {
        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a3' });
            doc.setFontSize(16);
            doc.text('REMMUNERATION STATEMENT', 14, 20);
            
            doc.autoTable({
                startY: 25,
                html: '#rem-table',
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, halign: 'center', valign: 'middle' },
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1 }
            });
            doc.save('REMMUNERATION_Statement.pdf');
        }

        if (type === 'excel') {
            const table = document.getElementById('rem-table');
            const wb = XLSX.utils.table_to_book(table, {sheet: "Remuneration"});
            XLSX.writeFile(wb, 'REMMUNERATION_Statement.xlsx');
        }
    }

    // ── External Staff Logic ──
    function exportExtStaff(type) {
        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
            doc.setFontSize(16);
            doc.text('EXTERNAL STAFF PAYMENT DETAILS', 14, 20);

            doc.autoTable({
                startY: 25,
                html: '#ext-table',
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3, halign: 'center', valign: 'middle' },
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1 }
            });
            doc.save('External_Staff.pdf');
        }

        if (type === 'excel') {
            const table = document.getElementById('ext-table');
            const wb = XLSX.utils.table_to_book(table, {sheet: "External Staff"});
            XLSX.writeFile(wb, 'External_Staff.xlsx');
        }
    }

    // ── Consolidated Form Logic ──
    function exportConsolidated(type) {
        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            doc.setFontSize(22);
            doc.setFont('times', 'bold');
            doc.text('Sandip University', 105, 20, { align: 'center' });
            doc.setFontSize(11);
            doc.setFont('times', 'normal');
            doc.text('Mahiravani, Trimbak Road, Tal & Dist. Nashik 422213, Maharashtra', 105, 27, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('times', 'bold');
            doc.text('End Semester Examinations Practical Remuneration MAY 2026', 105, 36, { align: 'center' });

            doc.autoTable({
                startY: 42,
                html: '#cons-table',
                theme: 'plain',
                styles: { fontSize: 12, cellPadding: 2, halign: 'center', valign: 'middle', font: 'times', lineWidth: 0.5, lineColor: 0 },
                headStyles: { fillColor: null, textColor: 0, fontStyle: 'bold' }
            });
            doc.save('Consolidated_Report.pdf');
        }

        if (type === 'excel') {
            const table = document.getElementById('cons-table');
            const wb = XLSX.utils.table_to_book(table, {sheet: "Consolidated Form"});
            XLSX.writeFile(wb, 'Consolidated_Report.xlsx');
        }
    }

    // ── Travel Claim Logic ──
    function exportTravelClaim(type) {
        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
            doc.setFontSize(16);
            doc.text('TRAVEL CLAIM STATEMENT', 14, 20);
            
            doc.autoTable({
                startY: 25,
                html: '#travel-table',
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3, halign: 'center', valign: 'middle' },
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 }
            });
            doc.save('Travel_Claim.pdf');
        }

        if (type === 'excel') {
            const table = document.getElementById('travel-table');
            const wb = XLSX.utils.table_to_book(table, {sheet: "Travel Claim"});
            XLSX.writeFile(wb, 'Travel_Claim.xlsx');
        }
    }

    // ── DATA INTEGRATION (AUTO-GENERATION) ──
    let masterStaffDB = [];
    let masterRates = { ug: 15, pg: 20, lab: 70, ta: 8, da: 150 };

    // Make auto-generated forms read-only display details
    document.addEventListener('DOMContentLoaded', () => {
        loadDashboardData();
        loadClaimsData();
    });

    async function loadDashboardData() {
        const tbody = document.getElementById('dashboard-staff-table');
        if(!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">Loading staff data...</td></tr>';
            const response = await fetch('http://localhost:3000/api/staff');
            const data = await response.json();
            
            if(data.success && data.data.length > 0) {
                // Update local array for Assign form dropdowns
                masterStaffDB = data.data.map(s => ({
                    type: s.staff_type,
                    id: s.emp_id,
                    name: s.name,
                    designation: s.designation,
                    college: s.college,
                    distance: s.distance,
                    bankName: s.bank_name,
                    accNo: s.acc_no,
                    ifsc: s.ifsc,
                    branch: s.branch
                }));
                updateAssignDropdowns();

                tbody.innerHTML = '';
                data.data.forEach(staff => {
                    let badgeClass = 'badge-blue';
                    if(staff.staff_type === 'External') badgeClass = 'badge-amber';
                    if(staff.staff_type === 'Internal') badgeClass = 'badge-green';

                    tbody.innerHTML += `
                        <tr>
                            <td style="font-weight:500;">${staff.emp_id || '-'}</td>
                            <td>${staff.name}</td>
                            <td>${staff.designation || '-'}</td>
                            <td><span class="badge ${badgeClass}">${staff.staff_type || 'Unknown'}</span></td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No staff registered yet. Go to Master Form to add some!</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching staff data:', error);
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--red);padding:20px;">Error connecting to database. Is the backend running?</td></tr>';
        }
    }

    async function saveMasterForm() {
        const staffName = document.getElementById('master-name').value.trim();
        if (!staffName) { alert('Please enter Staff Name to save master record.'); return; }
        
        const staff = {
            type: document.getElementById('master-staff-type').value,
            id: document.getElementById('master-staff-id').value,
            name: staffName,
            designation: document.getElementById('master-designation').value,
            college: document.getElementById('master-college').value,
            distance: parseFloat(document.getElementById('master-distance').value) || 0,
            bankName: document.getElementById('master-bank-name').value,
            accNo: document.getElementById('master-acc-no').value,
            ifsc: document.getElementById('master-ifsc').value,
            branch: document.getElementById('master-branch').value
        };

        // Update local rates
        masterRates = {
            ug: parseFloat(document.getElementById('master-ug-rate').value) || 15,
            pg: parseFloat(document.getElementById('master-pg-rate').value) || 20,
            lab: parseFloat(document.getElementById('master-lab-rate').value) || 70,
            ta: parseFloat(document.getElementById('master-ta-rate').value) || 8,
            da: parseFloat(document.getElementById('master-da-rate').value) || 150
        };

        try {
            const btn = event.currentTarget;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            
            const response = await fetch('http://localhost:3000/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staff)
            });

            const result = await response.json();
            btn.innerHTML = originalText;

            if (result.success) {
                alert(`Master details for ${staff.name} saved successfully to PostgreSQL!`);
                // Clear inputs
                document.querySelectorAll('#section-master-form .fl-input[type="text"]').forEach(el => el.value = '');
                // Reload dashboard data
                loadDashboardData();
            } else {
                alert('Error saving to database: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Failed to connect to the backend server. Make sure it is running on port 3000.');
        }
    }

    function updateAssignDropdowns() {
        const extSelect = document.getElementById('assign-ext');
        const intSelect = document.getElementById('assign-int');
        const labSelect = document.getElementById('assign-lab');
        
        extSelect.innerHTML = '<option value="">Select External Staff...</option>';
        intSelect.innerHTML = '<option value="">Select Internal Staff...</option>';
        labSelect.innerHTML = '<option value="">Select Lab Assistant...</option>';

        masterStaffDB.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.textContent = s.name;
            if(s.type === 'External') extSelect.appendChild(opt);
            else if(s.type === 'Internal') intSelect.appendChild(opt);
            else if(s.type === 'Lab Assistant') labSelect.appendChild(opt);
        });
    }

    async function submitAssignClaim() {
        const claimNo = document.getElementById('assign-claim-no').value.trim();
        const examDate = document.getElementById('assign-date').value;
        const timeSlot = document.getElementById('assign-time').value.trim();
        const divBatch = document.getElementById('assign-div').value.trim();
        
        const school = document.getElementById('assign-school').value.trim();
        const course = document.getElementById('assign-course').value.trim();
        const subject = document.getElementById('assign-subject').value.trim();
        const subType = document.getElementById('assign-sub-type').value;
        
        const registered = parseInt(document.getElementById('assign-registered').value) || 0;
        const present = parseInt(document.getElementById('assign-present').value) || 0;
        
        const extName = document.getElementById('assign-ext').value;
        const intName = document.getElementById('assign-int').value;
        const labName = document.getElementById('assign-lab').value;
        
        if (!claimNo) { alert('Claim Form No is required!'); return; }

        const payload = {
            claimNo, examDate, timeSlot, divBatch,
            school, course, subject, subType,
            registered, present, extName, intName, labName
        };

        try {
            const response = await fetch('http://localhost:3000/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.success) {
                alert('Assignment Submitted! The Remuneration, Travel, External, and Consolidated tables have been updated.');
                
                // Clear assignment inputs
                document.getElementById('assign-claim-no').value = '';
                document.getElementById('assign-present').value = '';
                document.getElementById('assign-registered').value = '';
                
                // Refresh claims data and navigate to Remuneration
                loadClaimsData();
                document.querySelector('[data-section="remuneration"]').click();
            } else {
                alert('Error saving assignment: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Failed to connect to the backend server.');
        }
    }

    async function loadClaimsData() {
        try {
            const response = await fetch('http://localhost:3000/api/assignments');
            const data = await response.json();
            
            const remTbody = document.getElementById('remuneration-table-body');
            const consTbody = document.getElementById('consolidated-table-body');
            const extTbody = document.getElementById('external-table-body');
            const travTbody = document.getElementById('travel-table-body');

            if (data.success && data.data.length > 0) {
                remTbody.innerHTML = '';
                consTbody.innerHTML = '';
                extTbody.innerHTML = '';
                travTbody.innerHTML = '';

                data.data.forEach(claim => {
                    const isPG = claim.course.toUpperCase().includes('PG');
                    const ratePerStudent = isPG ? masterRates.pg : masterRates.ug;
                    const remAmount = (claim.present || 0) * ratePerStudent;
                    const totalPay = remAmount + masterRates.da;

                    // Remuneration (Internal Staff check)
                    if (claim.int_name) {
                        const intStaff = masterStaffDB.find(s => s.name === claim.int_name) || {};
                        remTbody.innerHTML += `
                            <tr>
                                <td>${claim.claim_no}</td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                                <td>${claim.int_name}</td>
                                <td>${claim.subject}</td>
                                <td>${claim.present}</td>
                                <td>₹${ratePerStudent}</td>
                                <td>₹${remAmount} + ₹${masterRates.da}</td>
                                <td><strong>₹${totalPay}</strong></td>
                            </tr>
                        `;
                    }

                    // External / Travel / Consolidated
                    if (claim.ext_name) {
                        const extStaff = masterStaffDB.find(s => s.name === claim.ext_name) || {};
                        
                        // Consolidated
                        consTbody.innerHTML += `
                            <tr>
                                <td>${claim.ext_name}</td>
                                <td>${extStaff.id || '-'}</td>
                                <td><strong>₹${remAmount}</strong></td>
                            </tr>
                        `;

                        // External
                        extTbody.innerHTML += `
                            <tr>
                                <td>${claim.ext_name}</td>
                                <td><strong>₹${remAmount}</strong></td>
                                <td>${extStaff.bankName || '-'}</td>
                                <td>${extStaff.ifsc || '-'}</td>
                                <td>${extStaff.branch || '-'}</td>
                                <td>${extStaff.accNo || '-'}</td>
                            </tr>
                        `;

                        // Travel
                        const dist = extStaff.distance || 0;
                        const twoWay = dist * 2;
                        const travelAllowance = twoWay * 8; // 8 Rs per km
                        travTbody.innerHTML += `
                            <tr>
                                <td>${claim.ext_name}</td>
                                <td>${extStaff.college || '-'}</td>
                                <td>${claim.school}</td>
                                <td>${dist} km / ${twoWay} km</td>
                                <td><strong>₹${travelAllowance}</strong></td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                            </tr>
                        `;
                        
                        // External also gets remuneration entry
                        remTbody.innerHTML += `
                            <tr>
                                <td>${claim.claim_no}</td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                                <td>${claim.ext_name}</td>
                                <td>${claim.subject}</td>
                                <td>${claim.present}</td>
                                <td>₹${ratePerStudent}</td>
                                <td>₹${remAmount} + ₹${masterRates.da}</td>
                                <td><strong>₹${totalPay}</strong></td>
                            </tr>
                        `;
                    }
                });

                // Fallbacks if empty
                if(remTbody.innerHTML === '') remTbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No remunerations generated yet.</td></tr>';
                if(consTbody.innerHTML === '') consTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:var(--text-muted);">No consolidated reports generated yet.</td></tr>';
                if(extTbody.innerHTML === '') extTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">No external staff generated yet.</td></tr>';
                if(travTbody.innerHTML === '') travTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">No travel claims generated yet.</td></tr>';

            }
        } catch(error) {
            console.error('Error loading claims data:', error);
        }
    }
