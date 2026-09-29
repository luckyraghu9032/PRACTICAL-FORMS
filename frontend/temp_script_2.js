
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

    // ── Collect form data ──
    function getRemunerationData() {
        return {
            claimNo: document.getElementById('rem-claim-no').value || '—',
            faculty: document.getElementById('rem-faculty-id-name').value || '—',
            institute: document.getElementById('rem-institute').value || '—',
            course: document.getElementById('rem-school-course').value || '—',
            subject: document.getElementById('rem-subject').value || '—',
            subType: document.getElementById('rem-sub-type').value || '—',
            date: document.getElementById('rem-date').value || '—',
            timeSlot: document.getElementById('rem-time-slot').value || '—',
            divBatch: document.getElementById('rem-div-batch').value || '—',
            presentCount: document.getElementById('rem-present-count').value || '—',
            lab: document.getElementById('rem-lab').value || '—',
            extInt: document.getElementById('rem-ext-int').value || '—',
            staffId: document.getElementById('rem-staff-id').value || '—',
            appeared: document.getElementById('rem-appeared-students').value || '0',
            rate: document.getElementById('rem-rate-rs').value || '0',
            remuneration: document.getElementById('rem-calc-remuneration').value || '0',
            ta: document.getElementById('rem-ta').value || '0',
            da: document.getElementById('rem-da').value || '0',
            total: document.getElementById('rem-total').value || '₹ 0.00',
            bankName: document.getElementById('rem-bank-name').value || '—',
            accountNo: document.getElementById('rem-account-no').value || '—',
            ifsc: document.getElementById('rem-ifsc-code').value || '—',
            branch: document.getElementById('rem-branch').value || '—',
            printDate: new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'long',year:'numeric'})
        };
    }

    // ── Export ──
    function exportRemuneration(type) {
        const d = getRemunerationData();

        if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const margin = 20;
            let y = margin;

            // Header bar
            doc.setFillColor(14, 165, 233);
            doc.rect(0, 0, 210, 28, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('Sandip University — Claim Statement', margin, 17);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text('Generated: ' + d.printDate, 210 - margin, 17, { align: 'right' });

            y = 35;
            doc.setTextColor(30, 30, 30);

            const row = (label, value, label2, value2) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                doc.text(label, margin, y);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(20, 20, 20);
                doc.text(String(value).substring(0, 35), margin + 40, y);
                
                if(label2) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(80, 80, 80);
                    doc.text(label2, margin + 90, y);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(20, 20, 20);
                    doc.text(String(value2).substring(0, 35), margin + 120, y);
                }
                y += 8;
            };

            const sectionHeader = (title) => {
                y += 2;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(14, 165, 233);
                doc.text(title, margin, y); y += 4;
                doc.setDrawColor(14, 165, 233);
                doc.line(margin, y, 190, y); y += 6;
            };

            sectionHeader('GENERAL INFORMATION');
            row('Claim Form No', d.claimNo, 'Faculty ID/Name', d.faculty);
            row('Institute', d.institute, 'School/Course', d.course);
            row('Subject Name', d.subject, 'Sub Type', d.subType);
            row('Date', d.date, 'Time Slot', d.timeSlot);
            row('Div - Batch', d.divBatch, 'Present Count', d.presentCount);
            row('Lab', d.lab);

            sectionHeader('EXAM & REMUNERATION DETAILS');
            row('EXT / INT', d.extInt, 'Staff ID', d.staffId);
            row('Appeared Students', d.appeared, 'Rate Rs.', d.rate);
            
            y+=2;
            row('Remuneration', '₹ ' + d.remuneration);
            row('TA', '₹ ' + d.ta, 'DA', '₹ ' + d.da);

            // Net pay highlight
            doc.setFillColor(230, 255, 240);
            doc.roundedRect(margin, y, 170, 12, 3, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(22, 163, 74);
            doc.text('TOTAL AMOUNT', margin + 4, y + 8);
            doc.text(d.total, margin + 40, y + 8);
            y += 20;

            sectionHeader('BANK DETAILS');
            row('Bank Name', d.bankName, 'Account No', d.accountNo);
            row('IFSC Code', d.ifsc, 'Branch', d.branch);

            doc.save('Claim_' + (d.faculty || 'Staff').replace(/\s+/g, '_') + '.pdf');
        }

        if (type === 'doc') {
            const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Claim Statement</title>
<style>
  body{font-family:Calibri,sans-serif;font-size:11pt;color:#111;margin:40px;}
  h1{color:#0ea5e9;font-size:16pt;margin-bottom:4px;}
  h2{color:#0ea5e9;font-size:11pt;border-bottom:2px solid #0ea5e9;padding-bottom:4px;margin-top:15px;}
  table{width:100%;border-collapse:collapse;margin-bottom:10px;}
  td{padding:6px 10px;border:1px solid #dde;font-size:10pt;}
  td:nth-child(odd){font-weight:bold;color:#555;width:25%;background:#f7f9fb;}
  .net-row td{background:#e6fff0;color:#16a34a;font-weight:bold;font-size:12pt;}
  .footer{color:#888;font-size:9pt;margin-top:30px;border-top:1px solid #dde;padding-top:8px;}
</style></head>
<body>
<h1>Sandip University — Claim Statement</h1>
<p style="color:#777;font-size:10pt;">Generated: ${d.printDate}</p>

<h2>General Information</h2>
<table>
  <tr><td>Claim Form No</td><td>${d.claimNo}</td><td>Faculty ID / Name</td><td>${d.faculty}</td></tr>
  <tr><td>Institute</td><td>${d.institute}</td><td>School/Course/Sem</td><td>${d.course}</td></tr>
  <tr><td>Subject Name</td><td>${d.subject}</td><td>Sub Type</td><td>${d.subType}</td></tr>
  <tr><td>Date</td><td>${d.date}</td><td>Time Slot</td><td>${d.timeSlot}</td></tr>
  <tr><td>Div - Batch</td><td>${d.divBatch}</td><td>Present Count</td><td>${d.presentCount}</td></tr>
  <tr><td>Lab</td><td colspan="3">${d.lab}</td></tr>
</table>

<h2>Exam & Remuneration Details</h2>
<table>
  <tr><td>EXT / INT</td><td>${d.extInt}</td><td>Staff ID</td><td>${d.staffId}</td></tr>
  <tr><td>Appeared Students</td><td>${d.appeared}</td><td>Rate Rs.</td><td>${d.rate}</td></tr>
  <tr><td>Remuneration</td><td>₹ ${d.remuneration}</td><td>TA</td><td>₹ ${d.ta}</td></tr>
  <tr><td>DA</td><td colspan="3">₹ ${d.da}</td></tr>
  <tr class="net-row"><td>TOTAL AMOUNT</td><td colspan="3">${d.total}</td></tr>
</table>

<h2>Bank Details</h2>
<table>
  <tr><td>Bank Name</td><td>${d.bankName}</td><td>Account No</td><td>${d.accountNo}</td></tr>
  <tr><td>IFSC Code</td><td>${d.ifsc}</td><td>Branch</td><td>${d.branch}</td></tr>
</table>
<div class="footer">Sandip University FAS &mdash; Confidential Document</div>
</body></html>`;

            const blob = new Blob([html], { type: 'application/msword' });
            const url  = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Claim_' + (d.faculty || 'Staff').replace(/\s+/g, '_') + '.doc';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

