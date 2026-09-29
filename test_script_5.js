
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

    document.addEventListener('DOMContentLoaded', async () => {
        const today = new Date();
        const dateString = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        // Update section meta for dynamic nav updates
        if (typeof sectionMeta !== 'undefined' && sectionMeta['dashboard']) {
            sectionMeta['dashboard'].sub = `Welcome back — here's what's happening today | ${dateString}`;
            // If we are currently on dashboard, update the subtitle directly
            if(document.getElementById('section-dashboard').classList.contains('active')) {
                 document.getElementById('page-subtitle').textContent = sectionMeta['dashboard'].sub;
            }
        }

        // Auto-fill assign date
        const assignDateInput = document.getElementById('assign-date');
        if (assignDateInput) {
            assignDateInput.value = today.toISOString().split('T')[0];
        }

        await loadDashboardData();
        await loadPaymentRules();
        await loadManageStaffData();
        await loadClaimsData();
    });

    async function loadPaymentRules() {
        try {
            const res = await fetch('http://localhost:3000/api/payment-rules');
            const data = await res.json();
            if (data.success && data.data) {
                const r = data.data;
                document.getElementById('master-ug-rate').value  = r.ug_rate  || 15;
                document.getElementById('master-pg-rate').value  = r.pg_rate  || 20;
                document.getElementById('master-ta-rate').value  = r.ta_rate  || 8;
                document.getElementById('master-da-rate').value  = r.da_rate  || 150;
                document.getElementById('master-lab-rate').value = r.lab_rate || 70;
                masterRates = {
                    ug: parseFloat(r.ug_rate)  || 15,
                    pg: parseFloat(r.pg_rate)  || 20,
                    ta: parseFloat(r.ta_rate)  || 8,
                    da: parseFloat(r.da_rate)  || 150,
                    lab: parseFloat(r.lab_rate) || 70
                };
            }
        } catch(e) {
            console.warn('Could not load payment rules:', e.message);
        }
    }

    async function savePaymentRules() {
        const rates = {
            ugRate:  parseFloat(document.getElementById('master-ug-rate').value)  || 15,
            pgRate:  parseFloat(document.getElementById('master-pg-rate').value)  || 20,
            taRate:  parseFloat(document.getElementById('master-ta-rate').value)  || 8,
            daRate:  parseFloat(document.getElementById('master-da-rate').value)  || 150,
            labRate: parseFloat(document.getElementById('master-lab-rate').value) || 70
        };
        try {
            const res = await fetch('http://localhost:3000/api/payment-rules', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rates)
            });
            const result = await res.json();
            if (result.success) {
                masterRates = { ug: rates.ugRate, pg: rates.pgRate, ta: rates.taRate, da: rates.daRate, lab: rates.labRate };
                alert('Payment rates saved successfully!');
            } else {
                alert('Error saving rates: ' + result.message);
            }
        } catch(e) {
            console.error('Error saving payment rules:', e);
            alert('Failed to connect to backend.');
        }
    }

    async function loadDashboardData() {
        const tbody = document.getElementById('dashboard-staff-table');
        if(!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:20px;">Loading staff data...</td></tr>';
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
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:20px;">No staff registered yet. Go to Master Form to add some!</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching staff data:', error);
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--red);padding:20px;">Error connecting to database. Is the backend running?</td></tr>';
        }

        // Populate Internal Staff table (Sandip University staff only)
        const intTbody = document.getElementById('internal-staff-table-body');
        if (intTbody) {
            const internalStaff = masterStaffDB.filter(s => s.college && s.college.toLowerCase() === 'sandip university');
            if (internalStaff.length > 0) {
                intTbody.innerHTML = '';
                internalStaff.forEach((s, i) => {
                    intTbody.innerHTML += `
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:12px;">${i + 1}</td>
                            <td style="padding:12px; font-weight:500;">${s.id || '-'}</td>
                            <td style="padding:12px;">${s.name || '-'}</td>
                            <td style="padding:12px;">${s.designation || '-'}</td>
                            <td style="padding:12px;">${s.college || '-'}</td>
                            <td style="padding:12px;">${s.bankName || '-'}</td>
                            <td style="padding:12px;">${s.accNo || '-'}</td>
                            <td style="padding:12px;">${s.ifsc || '-'}</td>
                            <td style="padding:12px;">${s.branch || '-'}</td>
                        </tr>`;
                });
            } else {
                intTbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-muted);">No internal (Sandip University) staff found.</td></tr>';
            }
        }
        // Populate External Staff table (non-Sandip University staff)
        const extTbody2 = document.getElementById('external-table-body');
        if (extTbody2) {
            const externalStaff = masterStaffDB.filter(s => s.college && s.college.toLowerCase() !== 'sandip university');
            if (externalStaff.length > 0) {
                extTbody2.innerHTML = '';
                externalStaff.forEach((s, i) => {
                    extTbody2.innerHTML += `
                        <tr style="border-bottom:1px solid var(--border);">
                            <td style="padding:12px;">${i + 1}</td>
                            <td style="padding:12px;">${s.name || '-'}</td>
                            <td style="padding:12px;">${s.bankName || '-'}</td>
                            <td style="padding:12px;">${s.ifsc || '-'}</td>
                            <td style="padding:12px;">${s.branch || '-'}</td>
                            <td style="padding:12px;">-</td>
                            <td style="padding:12px;">${s.accNo || '-'}</td>
                        </tr>`;
                });
            } else {
                extTbody2.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No external staff found.</td></tr>';
            }
        }
    }

    function exportIntStaff(type) {
        const internalStaff = masterStaffDB.filter(s => s.college && s.college.toLowerCase() === 'sandip university');
        if (internalStaff.length === 0) {
            alert('No internal staff data to export.');
            return;
        }

        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text('INTERNAL STAFF DETAILS', 14, 20);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text('(Sandip University Staff)', 14, 26);
            
            doc.autoTable({
                startY: 32,
                head: [['Sr No', 'Employee ID', 'Name', 'Designation', 'College', 'Bank Name', 'Account No.', 'IFSC Code', 'Branch']],
                body: internalStaff.map((s, i) => [
                    i + 1, s.id || '-', s.name || '-', s.designation || '-', s.college || '-',
                    s.bankName || '-', s.accNo || '-', s.ifsc || '-', s.branch || '-'
                ]),
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3, halign: 'center', valign: 'middle', lineColor: [0,0,0], lineWidth: 0.2 },
                headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
            });
            doc.save('Internal_Staff_Details.pdf');
        }

        if (type === 'excel') {
            const xlData = [
                ['INTERNAL STAFF DETAILS - Sandip University'],
                [],
                ['Sr No', 'Employee ID', 'Name', 'Designation', 'College', 'Bank Name', 'Account No.', 'IFSC Code', 'Branch']
            ];
            internalStaff.forEach((s, i) => {
                xlData.push([i + 1, s.id || '-', s.name || '-', s.designation || '-', s.college || '-',
                    s.bankName || '-', s.accNo || '-', s.ifsc || '-', s.branch || '-']);
            });
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(xlData);
            ws['!merges'] = [{s:{r:0,c:0}, e:{r:0,c:8}}];
            XLSX.utils.book_append_sheet(wb, ws, "Internal Staff");
            XLSX.writeFile(wb, 'Internal_Staff_Details.xlsx');
        }
    }

    async function loadManageStaffData() {
        const tbody = document.getElementById('manage-staff-body');
        if(!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Loading...</td></tr>';
            const response = await fetch('http://localhost:3000/api/staff');
            const data = await response.json();
            
            if(data.success && data.data.length > 0) {
                tbody.innerHTML = '';
                data.data.forEach(staff => {
                    let badgeClass = 'badge-blue';
                    if(staff.staff_type === 'External') badgeClass = 'badge-amber';
                    if(staff.staff_type === 'Internal') badgeClass = 'badge-green';

                    const staffJson = encodeURIComponent(JSON.stringify(staff));

                    tbody.innerHTML += `
                        <tr>
                            <td style="font-weight:500;">${staff.emp_id || '-'}</td>
                            <td>${staff.name}</td>
                            <td><span class="badge ${badgeClass}">${staff.staff_type || 'Unknown'}</span></td>
                            <td>${staff.college || '-'}</td>
                            <td>
                                <button onclick="editStaff('${staffJson}')" style="background:var(--accent);color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;margin-right:5px;font-size:12px;"><i class="fa-solid fa-pen"></i> Edit</button>
                                <button onclick="deleteStaff(${staff.id})" style="background:var(--danger);color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;font-size:12px;"><i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No staff found.</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching manage staff data:', error);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--red);padding:20px;">Error connecting to database.</td></tr>';
        }
    }

    function editStaff(encodedStaff) {
        const staff = JSON.parse(decodeURIComponent(encodedStaff));
        
        navigate('master-form');

        document.getElementById('master-staff-hidden-id').value = staff.id;
        document.getElementById('master-staff-id').value = staff.emp_id || '';
        document.getElementById('master-name').value = staff.name || '';
        document.getElementById('master-designation').value = staff.designation || '';
        
        const collegeSelect = document.getElementById('master-college-select');
        const otherWrapper = document.getElementById('master-college-other-wrapper');
        const otherInput = document.getElementById('master-college-other');
        const distanceInput = document.getElementById('master-distance');
        
        if (staff.college === 'Sandip University') {
            collegeSelect.value = 'Sandip University';
            otherWrapper.style.display = 'none';
        } else if (staff.college) {
            collegeSelect.value = 'Others';
            otherWrapper.style.display = 'block';
            otherInput.value = staff.college;
        } else {
            collegeSelect.value = '';
            otherWrapper.style.display = 'none';
            otherInput.value = '';
        }
        document.getElementById('master-college').value = staff.college || '';
        
        distanceInput.value = staff.distance !== null ? staff.distance : '';
        if (staff.college === 'Sandip University') {
            distanceInput.readOnly = true;
        } else {
            distanceInput.readOnly = false;
        }

        document.getElementById('master-bank-name').value = staff.bank_name || '';
        document.getElementById('master-acc-no').value = staff.acc_no || '';
        document.getElementById('master-ifsc').value = staff.ifsc || '';
        document.getElementById('master-branch').value = staff.branch || '';

        const saveBtn = document.querySelector('#section-master-form .section-header .btn-primary');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fa-solid fa-pen-to-square" style="margin-right:6px;"></i>Update Master';
        }
    }

    async function deleteStaff(id) {
        if (!confirm('Are you sure you want to delete this staff member?')) return;
        
        try {
            const response = await fetch('http://localhost:3000/api/staff/' + id, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                alert('Staff deleted successfully.');
                loadManageStaffData();
                loadDashboardData();
            } else {
                alert('Error deleting staff: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Failed to connect to backend.');
        }
    }

    async function saveMasterForm() {
        const staffName = document.getElementById('master-name').value.trim();
        if (!staffName) { alert('Please enter Staff Name to save master record.'); return; }
        
        const college = document.getElementById('master-college').value;
        const staffType = (college && college.toLowerCase().includes('sandip')) ? 'General' : 'External';

        const staff = {
            type: staffType,
            id: document.getElementById('master-staff-id').value,
            name: staffName,
            designation: document.getElementById('master-designation').value,
            college: college,
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
            const btn = document.querySelector('#section-master-form .section-header .btn-primary');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            
            const editId = document.getElementById('master-staff-hidden-id') ? document.getElementById('master-staff-hidden-id').value : null;
            const url = editId ? `http://localhost:3000/api/staff/${editId}` : 'http://localhost:3000/api/staff';
            const method = editId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staff)
            });

            const result = await response.json();
            btn.innerHTML = originalText;

            if (result.success) {
                alert(`Master details for ${staff.name} saved successfully!`);
                // Clear staff inputs only
                const staffFields = [
                    'master-name', 'master-designation', 'master-college-other', 
                    'master-college', 'master-distance', 'master-bank-name', 
                    'master-acc-no', 'master-ifsc', 'master-branch'
                ];
                staffFields.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });

                const collegeSelect = document.getElementById('master-college-select');
                if(collegeSelect) collegeSelect.value = '';
                
                const hiddenId = document.getElementById('master-staff-hidden-id');
                if(hiddenId) hiddenId.value = '';
                
                btn.innerHTML = '<i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save Master';
                
                // Reload dashboard data
                loadDashboardData();
                loadManageStaffData();
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
            extSelect.add(new Option(s.name, s.name));
            labSelect.add(new Option(s.name, s.name));
            if (s.college && s.college.toLowerCase().includes('sandip')) {
                intSelect.add(new Option(s.name, s.name));
            }
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

    function exportAssignData(type) {
        const monthText = document.getElementById('claim-exam-month').value;
        const yearText = document.getElementById('claim-exam-year').value;
        if (!monthText || !yearText) {
            alert('Please select both Exam Month and Year.');
            return;
        }

        const monthMap = { 'January':0, 'February':1, 'March':2, 'April':3, 'May':4, 'June':5, 'July':6, 'August':7, 'September':8, 'October':9, 'November':10, 'December':11 };
        const selectedMonth = monthMap[monthText];
        const selectedYear = parseInt(yearText, 10);

        if (!window.assignmentsDB || window.assignmentsDB.length === 0) {
            alert('No assignment data available.');
            return;
        }

        const filtered = window.assignmentsDB.filter(a => {
            if(!a.exam_date) return false;
            const d = new Date(a.exam_date);
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        });

        if (filtered.length === 0) {
            alert(`No claims found for ${monthText} ${yearText}`);
            return;
        }

        const school = filtered[0].school || '--------------';
        const course = filtered[0].course || '--------------';
        const subject = filtered[0].subject || '--------------';
        const divBatch = filtered[0].div_batch || '--------------';

        // Headers
        const head = [[
            'Date', 'Name & Designation', 'College & Name\n(Abbreviated)', 'No. of Cands\nRegistered', 'No. of Cands\nExamined', 
            'Distance in\nkm (to &\nFrom)', 'Remuneration for Examined\ncandidates only\nUG= Rs.15/ Cand\nPG= Rs. 20/ Cand\nMinimum of Rs.100', 
            'Lab Assistant\nRs. 70 / Practical', 'TA\nRs. 8 /\nkm', 'DA\nRs.150\n/day', 'Total\nAmount', 'Signature'
        ]];

        const pdfBody = [];
        const xlBody = [];
        const merges = [];
        
        // Excel static header merges
        merges.push({s:{r:0,c:0}, e:{r:0,c:11}});
        merges.push({s:{r:1,c:0}, e:{r:1,c:11}});
        merges.push({s:{r:2,c:0}, e:{r:2,c:11}});
        merges.push({s:{r:3,c:0}, e:{r:3,c:11}});
        merges.push({s:{r:4,c:0}, e:{r:4,c:11}});
        merges.push({s:{r:5,c:0}, e:{r:5,c:8}});
        merges.push({s:{r:5,c:9}, e:{r:5,c:11}});

        filtered.forEach((a, i) => {
            const dateStr = a.exam_date ? a.exam_date.split('T')[0] : '-';
            const isPG = a.course && a.course.toUpperCase().includes('PG');
            const ratePerStudent = isPG ? masterRates.pg : masterRates.ug;
            const rem = Math.max((a.present || 0) * ratePerStudent, 100); // Minimum of 100
            
            const getStaff = (name) => masterStaffDB.find(s => s.name === name) || {name};
            
            const ext = getStaff(a.ext_name);
            const int = getStaff(a.int_name);
            const lab = getStaff(a.lab_name);
            
            const calc = (staff, isLab) => {
                if (!staff.name || staff.name === '-') return { dist: '', rem: '', lab: '', ta: '', da: '', total: '' };
                const dist = staff.distance || 0;
                const ta = dist * 2 * masterRates.ta;
                const da = masterRates.da;
                const remuneration = isLab ? 0 : rem;
                const labAmt = isLab ? masterRates.lab : 0;
                const total = remuneration + labAmt + ta + da;
                return { dist, rem: isLab?'':remuneration, lab: isLab?labAmt:'', ta, da, total };
            };
            
            const extC = calc(ext, false);
            const intC = calc(int, false);
            const labC = calc(lab, true);
            
            // PDF Data
            pdfBody.push([
                { content: dateStr, rowSpan: 3, styles: { valign: 'middle', halign: 'center' } },
                (a.ext_name || '-') + '\n(External)',
                ext.college || '-',
                { content: a.registered || '-', rowSpan: 3, styles: { valign: 'middle', halign: 'center' } },
                { content: a.present || '-', rowSpan: 3, styles: { valign: 'middle', halign: 'center' } },
                extC.dist, extC.rem, extC.lab, extC.ta, extC.da, extC.total, ''
            ]);
            pdfBody.push([ (a.int_name || '-') + '\n(Internal)', int.college || '-', intC.dist, intC.rem, intC.lab, intC.ta, intC.da, intC.total, '' ]);
            pdfBody.push([ (a.lab_name || '-') + '\n(Lab Assistant)', lab.college || '-', labC.dist, labC.rem, labC.lab, labC.ta, labC.da, labC.total, '' ]);

            // Excel Data
            const startRow = 7 + (i * 3);
            xlBody.push([ dateStr, (a.ext_name || '-') + '\n(External)', ext.college || '-', a.registered || '-', a.present || '-', extC.dist, extC.rem, extC.lab, extC.ta, extC.da, extC.total, '' ]);
            xlBody.push([ "", (a.int_name || '-') + '\n(Internal)', int.college || '-', "", "", intC.dist, intC.rem, intC.lab, intC.ta, intC.da, intC.total, '' ]);
            xlBody.push([ "", (a.lab_name || '-') + '\n(Lab Assistant)', lab.college || '-', "", "", labC.dist, labC.rem, labC.lab, labC.ta, labC.da, labC.total, '' ]);
            
            // Merge Date, Reg, Present across the 3 rows
            merges.push({s:{r:startRow, c:0}, e:{r:startRow+2, c:0}}); // Date
            merges.push({s:{r:startRow, c:3}, e:{r:startRow+2, c:3}}); // Reg
            merges.push({s:{r:startRow, c:4}, e:{r:startRow+2, c:4}}); // Present
        });

        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a3' });
            const pageW = doc.internal.pageSize.getWidth();

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("SANDIP UNIVERSITY", pageW/2, 15, { align: "center" });
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Trimbak Road, A/p- Mahiravani, Tal.& Dist.Nashik, Maharashtra, India-422213", pageW/2, 21, { align: "center" });
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 0, 0);
            doc.text(`School of ${school} / Programme with Specialization`, pageW/2, 28, { align: "center" });
            
            doc.setTextColor(0, 0, 0);
            doc.text("Claim/Remuneration Form", pageW/2, 34, { align: "center" });
            doc.text(`PRACTICAL WISE STATEMENT - ${monthText.toUpperCase()} ${yearText}`, pageW/2, 40, { align: "center" });
            
            doc.setTextColor(255, 0, 0);
            doc.text(`Course Code/ Name : ${course} / ${subject}`, 14, 48);
            doc.text(`Year / Semester : ${divBatch}`, pageW - 14, 48, { align: "right" });
            doc.setTextColor(0, 0, 0);

            // Main data table
            doc.autoTable({ 
                startY: 52, 
                head: head, 
                body: pdfBody, 
                theme: 'grid', 
                styles: { fontSize: 9, cellPadding: 2, halign: 'center', valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.2 },
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
            });

            // ── BOTTOM SECTION ──
            const tableEndY = doc.lastAutoTable.finalY + 4;

            // Total row
            doc.autoTable({
                startY: tableEndY,
                body: [[ { content: 'Total (in Rs.)', colSpan: 12, styles: { halign: 'right', fontStyle: 'bold', fontSize: 10 } } ]],
                theme: 'grid',
                styles: { lineColor: [0, 0, 0], lineWidth: 0.2, cellPadding: 2 },
            });

            const bankY = doc.lastAutoTable.finalY + 6;

            // Get staff details for the first assignment (representative)
            const firstA = filtered[0];
            const getS = (name) => masterStaffDB.find(s => s.name === name) || {};
            const intStaff = getS(firstA.int_name);
            const extStaff = getS(firstA.ext_name);
            const labStaff = getS(firstA.lab_name);

            // Bank details table
            doc.autoTable({
                startY: bankY,
                body: [
                    [
                        { content: 'Internal', styles: { halign: 'center', fontStyle: 'bold' } },
                        { content: '', styles: { halign: 'center' } },
                        { content: 'External', styles: { halign: 'center', fontStyle: 'bold' } },
                        { content: '', styles: { halign: 'center' } },
                        { content: 'Lab Assistant', styles: { halign: 'center', fontStyle: 'bold' } },
                        { content: '', styles: { halign: 'center' } },
                    ],
                    [
                        { content: `Bank Account No.\nBank Name\nIFSC / Branch Name`, styles: { halign: 'left', fontSize: 8 } },
                        { content: `STAFF ID: ${intStaff.id || '-'}\nAcc: ${intStaff.accNo || '-'}\nBank: ${intStaff.bankName || '-'}\nIFSC: ${intStaff.ifsc || '-'}`, styles: { halign: 'center', fontSize: 8 } },
                        { content: `Bank Account No.\nBank Name\nIFSC / Branch Name`, styles: { halign: 'left', fontSize: 8 } },
                        { content: `STAFF ID: ${extStaff.id || '-'}\nAcc: ${extStaff.accNo || '-'}\nBank: ${extStaff.bankName || '-'}\nIFSC: ${extStaff.ifsc || '-'}`, styles: { halign: 'center', fontSize: 8 } },
                        { content: `Bank Account No.\nBank Name\nIFSC / Branch Name`, styles: { halign: 'left', fontSize: 8 } },
                        { content: `STAFF ID: ${labStaff.id || '-'}\nAcc: ${labStaff.accNo || '-'}\nBank: ${labStaff.bankName || '-'}\nIFSC: ${labStaff.ifsc || '-'}`, styles: { halign: 'center', fontSize: 8 } },
                    ]
                ],
                theme: 'grid',
                columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 60 }, 2: { cellWidth: 40 }, 3: { cellWidth: 60 }, 4: { cellWidth: 40 }, 5: { cellWidth: 60 } },
                styles: { lineColor: [0, 0, 0], lineWidth: 0.2, cellPadding: 3, valign: 'middle' },
            });

            // Signature line
            const sigY = doc.lastAutoTable.finalY + 14;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Practical Coordinator", 14, sigY);
            doc.text("Chief Superintendent", pageW/2, sigY, { align: "center" });
            doc.text("CONTROLLER OF EXAMINATIONS", pageW - 14, sigY, { align: "right" });

            // Note
            const noteY = sigY + 10;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(255, 0, 0);
            doc.text("Note:", 14, noteY);
            doc.text("1. TA/DA only for Examiners from outside the campus", 28, noteY);
            doc.text("2. Incomplete / Overwriting / corrections in claim form is rejected without any Notice to the Examiner.", 28, noteY + 5);
            doc.setTextColor(0, 0, 0);

            doc.save(`Assignments_${monthText}_${yearText}.pdf`);

        } else if (type === 'xl') {
            // Get staff details for first record
            const firstA = filtered[0];
            const getS = (name) => masterStaffDB.find(s => s.name === name) || {};
            const intStaff = getS(firstA.int_name);
            const extStaff = getS(firstA.ext_name);
            const labStaff = getS(firstA.lab_name);

            const totalDataRows = filtered.length * 3;
            const dataStartRow = 7; // header rows before data
            const lastDataRow = dataStartRow + totalDataRows;

            // Bottom section rows for Excel
            const bottomRows = [
                ["", "", "", "", "Total (in Rs.)", "", "", "", "", "", "", ""],
                [], // blank
                ["", "Internal", "", "", "External", "", "", "", "Lab Assistant", "", "", ""],
                ["STAFF ID", intStaff.id || '-', "", "STAFF ID", extStaff.id || '-', "", "", "STAFF ID", labStaff.id || '-', "", "", ""],
                ["Bank Account No.", intStaff.accNo || '-', "", "Bank Account No.", extStaff.accNo || '-', "", "", "Bank Account No.", labStaff.accNo || '-', "", "", ""],
                ["Bank Name", intStaff.bankName || '-', "", "Bank Name", extStaff.bankName || '-', "", "", "Bank Name", labStaff.bankName || '-', "", "", ""],
                ["IFSC / Branch Name", intStaff.ifsc || '-', "", "IFSC / Branch Name", extStaff.ifsc || '-', "", "", "IFSC / Branch Name", labStaff.ifsc || '-', "", "", ""],
                [], // blank
                ["Practical Coordinator", "", "", "", "Chief Superintendent", "", "", "", "CONTROLLER OF EXAMINATIONS", "", "", ""],
                [], // blank
                ["Note:", "1. TA/DA only for Examiners from outside the campus", "", "", "", "", "", "", "", "", "", ""],
                ["", "2. Incomplete / Overwriting / corrections in claim form is rejected without any Notice to the Examiner.", "", "", "", "", "", "", "", "", "", ""],
            ];

            const xlData = [
                ["SANDIP UNIVERSITY"],
                ["Trimbak Road, A/p- Mahiravani, Tal.& Dist.Nashik, Maharashtra, India-422213"],
                [`School of ${school} / Programme with Specialization`],
                ["Claim/Remuneration Form"],
                [`PRACTICAL WISE STATEMENT - ${monthText.toUpperCase()} ${yearText}`],
                [`Course Code/ Name : ${course} / ${subject}`, "", "", "", "", "", "", "", "", `Year / Semester : ${divBatch}`],
                head[0]
            ].concat(xlBody).concat(bottomRows);

            // Bottom section merges
            merges.push({s:{r:lastDataRow,c:0}, e:{r:lastDataRow,c:3}});   // "Total (in Rs.)" label
            merges.push({s:{r:lastDataRow+2,c:1}, e:{r:lastDataRow+2,c:3}});  // Internal header
            merges.push({s:{r:lastDataRow+2,c:4}, e:{r:lastDataRow+2,c:7}});  // External header
            merges.push({s:{r:lastDataRow+2,c:8}, e:{r:lastDataRow+2,c:11}}); // Lab Assistant header
            merges.push({s:{r:lastDataRow+7,c:0}, e:{r:lastDataRow+7,c:2}});  // Practical Coordinator
            merges.push({s:{r:lastDataRow+7,c:3}, e:{r:lastDataRow+7,c:5}});  // Chief Superintendent
            merges.push({s:{r:lastDataRow+7,c:8}, e:{r:lastDataRow+7,c:11}}); // Controller
            merges.push({s:{r:lastDataRow+9,c:1}, e:{r:lastDataRow+9,c:11}});  // Note 1
            merges.push({s:{r:lastDataRow+10,c:1}, e:{r:lastDataRow+10,c:11}}); // Note 2

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(xlData);
            ws['!merges'] = merges;
            
            XLSX.utils.book_append_sheet(wb, ws, "Assignments");
            XLSX.writeFile(wb, `Assignments_${monthText}_${yearText}.xlsx`);
        }
    }

    async function loadClaimsData() {
        try {
            const response = await fetch('http://localhost:3000/api/assignments');
            const data = await response.json();
            
            window.assignmentsDB = data.data || [];

            const remTbody = document.getElementById('remuneration-table-body');
            const consTbody = document.getElementById('consolidated-table-body');
            const travTbody = document.getElementById('travel-table-body');

            if (data.success && data.data.length > 0) {
                remTbody.innerHTML = '';
                consTbody.innerHTML = '';
                travTbody.innerHTML = '';

                data.data.forEach((claim, idx) => {
                    const courseStr = (claim.course || '').toUpperCase();
                    const isPG = courseStr.includes('PG');
                    const ratePerStudent = isPG ? masterRates.pg : masterRates.ug;
                    const remAmount = Math.max((claim.present || 0) * ratePerStudent, 100);

                    // Calculate per-role values
                    const intStaff = claim.int_name ? (masterStaffDB.find(s => s.name === claim.int_name) || {}) : {};
                    const extStaff = claim.ext_name ? (masterStaffDB.find(s => s.name === claim.ext_name) || {}) : {};
                    const labStaff = claim.lab_name ? (masterStaffDB.find(s => s.name === claim.lab_name) || {}) : {};

                    // External: Rem + TA + DA (0 TA/DA if from Sandip University)
                    const extIsSandip = extStaff.college && extStaff.college.toLowerCase() === 'sandip university';
                    const extDist = extStaff.distance || 0;
                    const extTA = extIsSandip ? 0 : (extDist * 2 * masterRates.ta);
                    const extDA = extIsSandip ? 0 : masterRates.da;
                    const extSubtotal = remAmount + extTA + extDA;

                    // Internal: Only Rem (no TA/DA for campus staff)
                    const intSubtotal = claim.int_name ? remAmount : 0;

                    // Lab Assistant: Flat rate
                    const labAmount = claim.lab_name ? masterRates.lab : 0;

                    // TOTAL = sum of all 3 roles
                    const grandTotal = (claim.ext_name ? extSubtotal : 0) + intSubtotal + labAmount;

                    // Remuneration (Internal Staff)
                    if (claim.int_name) {
                        remTbody.innerHTML += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${claim.claim_no || '-'}</td>
                                <td>${claim.int_name || '-'}</td>
                                <td>${intStaff.college || '-'}</td>
                                <td>${claim.school || '-'} - ${claim.course || '-'}</td>
                                <td>${claim.subject || '-'}</td>
                                <td>${claim.sub_type || '-'}</td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                                <td>${claim.time_slot || '-'}</td>
                                <td>${claim.div_batch || '-'}</td>
                                <td>${claim.present || '-'}</td>
                                <td>-</td>
                                <td>INTERNAL</td>
                                <td>${intStaff.id || '-'}</td>
                                <td>${claim.registered || '-'}</td>
                                <td>${ratePerStudent}</td>
                                <td>${remAmount}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>${intSubtotal}</td>
                                <td>${grandTotal}</td>
                                <td>${intStaff.accNo || '-'}</td>
                                <td>${intStaff.bankName || '-'}</td>
                                <td>${intStaff.ifsc || '-'}</td>
                                <td>${intStaff.branch || '-'}</td>
                            </tr>`;
                    }

                    // Consolidated - Internal Staff
                    if (claim.int_name) {
                        consTbody.innerHTML += `
                            <tr>
                                <td>-</td>
                                <td>${claim.int_name} (Internal)</td>
                                <td>${intStaff.id || '-'}</td>
                                <td>${intSubtotal}</td>
                                <td>${grandTotal}</td>
                            </tr>`;
                    }

                    // External / Travel / Consolidated
                    if (claim.ext_name) {
                        const extStaff = masterStaffDB.find(s => s.name === claim.ext_name) || {};
                        
                        // Consolidated - External Staff
                        consTbody.innerHTML += `
                            <tr>
                                <td>-</td>
                                <td>${claim.ext_name} (External)</td>
                                <td>${extStaff.id || '-'}</td>
                                <td>${extSubtotal}</td>
                                <td>${grandTotal}</td>
                            </tr>`;


                        // Travel
                        const dist = extStaff.distance || 0;
                        const twoWay = dist * 2;
                        const travelAllowance = twoWay * 8;
                        travTbody.innerHTML += `
                            <tr>
                                <td>-</td>
                                <td>${claim.ext_name}</td>
                                <td>${extStaff.college || '-'}</td>
                                <td>${claim.school || '-'}</td>
                                <td>${dist}</td>
                                <td>${twoWay}</td>
                                <td>${twoWay} * 8</td>
                                <td>${travelAllowance}</td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                            </tr>`;
                        
                        // External also gets remuneration entry
                        remTbody.innerHTML += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${claim.claim_no || '-'}</td>
                                <td>${claim.ext_name || '-'}</td>
                                <td>${extStaff.college || '-'}</td>
                                <td>${claim.school || '-'} - ${claim.course || '-'}</td>
                                <td>${claim.subject || '-'}</td>
                                <td>${claim.sub_type || '-'}</td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                                <td>${claim.time_slot || '-'}</td>
                                <td>${claim.div_batch || '-'}</td>
                                <td>${claim.present || '-'}</td>
                                <td>-</td>
                                <td>EXT</td>
                                <td>${extStaff.id || '-'}</td>
                                <td>${claim.registered || '-'}</td>
                                <td>${ratePerStudent}</td>
                                <td>${remAmount}</td>
                                <td>${extTA}</td>
                                <td>${extDA}</td>
                                <td>${extSubtotal}</td>
                                <td>${grandTotal}</td>
                                <td>${extStaff.accNo || '-'}</td>
                                <td>${extStaff.bankName || '-'}</td>
                                <td>${extStaff.ifsc || '-'}</td>
                                <td>${extStaff.branch || '-'}</td>
                            </tr>`;

                        // Lab Assistant remuneration entry
                        if (claim.lab_name) {
                            remTbody.innerHTML += `
                            <tr>
                                <td>${idx + 1}</td>
                                <td>${claim.claim_no || '-'}</td>
                                <td>${claim.lab_name || '-'}</td>
                                <td>${labStaff.college || '-'}</td>
                                <td>${claim.school || '-'} - ${claim.course || '-'}</td>
                                <td>${claim.subject || '-'}</td>
                                <td>${claim.sub_type || '-'}</td>
                                <td>${claim.exam_date ? claim.exam_date.split('T')[0] : '-'}</td>
                                <td>${claim.time_slot || '-'}</td>
                                <td>${claim.div_batch || '-'}</td>
                                <td>${claim.present || '-'}</td>
                                <td>LAB</td>
                                <td>LAB ASSISTANCE</td>
                                <td>${labStaff.id || '-'}</td>
                                <td>${claim.registered || '-'}</td>
                                <td>${masterRates.lab}</td>
                                <td>${labAmount}</td>
                                <td>-</td>
                                <td>-</td>
                                <td>${labAmount}</td>
                                <td></td>
                                <td>${labStaff.accNo || '-'}</td>
                                <td>${labStaff.bankName || '-'}</td>
                                <td>${labStaff.ifsc || '-'}</td>
                                <td>${labStaff.branch || '-'}</td>
                            </tr>`;

                            // Consolidated - Lab Assistant
                            consTbody.innerHTML += `
                            <tr>
                                <td>-</td>
                                <td>${claim.lab_name} (Lab Asst)</td>
                                <td>${labStaff.id || '-'}</td>
                                <td>${labAmount}</td>
                                <td>${grandTotal}</td>
                            </tr>`;
                        }
                    }
                });

                // Fallbacks if empty
                if(remTbody.innerHTML === '') remTbody.innerHTML = '<tr><td colspan="25" style="text-align:center; padding:20px; color:var(--text-muted);">No remunerations generated yet.</td></tr>';
                if(consTbody.innerHTML === '') consTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No consolidated reports generated yet.</td></tr>';
                if(travTbody.innerHTML === '') travTbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-muted);">No travel claims generated yet.</td></tr>';

            }
        } catch(error) {
            console.error('Error loading claims data:', error);
        }
    }
