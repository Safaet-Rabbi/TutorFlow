document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Set current month as default
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    document.getElementById('monthSelect').value = currentMonth;
    document.getElementById('filterMonth').value = currentMonth;
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('classDate').value = today;
    
    // Event listeners
    document.getElementById('addRecord').addEventListener('click', addAttendanceRecord);
    document.getElementById('filterMonth').addEventListener('change', updateSummaryAndTable);
    document.getElementById('filterStudent').addEventListener('change', updateSummaryAndTable);
});

function initApp() {
    // Load data from localStorage or initialize empty array
    if (!localStorage.getItem('attendanceRecords')) {
        localStorage.setItem('attendanceRecords', JSON.stringify([]));
    }
    
    // Initialize student dropdown
    updateStudentDropdown();
    
    // Display all records and summary
    updateSummaryAndTable();
}

function addAttendanceRecord() {
    const studentName = document.getElementById('studentName').value.trim();
    const month = document.getElementById('monthSelect').value;
    const classDate = document.getElementById('classDate').value;
    
    if (!studentName || !classDate) {
        alert('Please fill in all fields');
        return;
    }
    
    const formattedDate = formatDate(classDate);
    
    // Get existing records
    const records = JSON.parse(localStorage.getItem('attendanceRecords'));
    
    // Add new record
    records.push({
        studentName,
        month,
        date: formattedDate,
        timestamp: new Date(classDate).getTime()
    });
    
    // Save back to localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    
    // Clear the student name field (keep others for quick entry)
    document.getElementById('studentName').value = '';
    
    // Update UI
    updateStudentDropdown();
    updateSummaryAndTable();
    
    // Notify user
    alert('Attendance record added successfully!');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
    });
}

function updateStudentDropdown() {
    const records = JSON.parse(localStorage.getItem('attendanceRecords'));
    const studentDropdown = document.getElementById('filterStudent');
    
    // Get unique student names
    const students = [...new Set(records.map(record => record.studentName))];
    
    // Clear existing options except "All Students"
    while (studentDropdown.options.length > 1) {
        studentDropdown.remove(1);
    }
    
    // Add student options
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student;
        option.textContent = student;
        studentDropdown.appendChild(option);
    });
}

function updateSummaryAndTable() {
    updateSummary();
    updateAttendanceTable();
}

function updateSummary() {
    const records = JSON.parse(localStorage.getItem('attendanceRecords'));
    const selectedMonth = document.getElementById('filterMonth').value;
    const selectedStudent = document.getElementById('filterStudent').value;
    
    // Filter records based on selections
    let filteredRecords = [...records];
    
    if (selectedMonth !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.month === selectedMonth);
    }
    
    if (selectedStudent !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.studentName === selectedStudent);
    }
    
    // Calculate summary statistics
    const summary = {};
    
    filteredRecords.forEach(record => {
        if (!summary[record.studentName]) {
            summary[record.studentName] = {};
        }
        
        if (!summary[record.studentName][record.month]) {
            summary[record.studentName][record.month] = 0;
        }
        
        summary[record.studentName][record.month]++;
    });
    
    // Display summary
    const summaryResults = document.getElementById('summaryResults');
    summaryResults.innerHTML = '';
    
    if (Object.keys(summary).length === 0) {
        summaryResults.innerHTML = '<p>No records found for the selected filters.</p>';
        return;
    }
    
    for (const student in summary) {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student-summary';
        studentDiv.innerHTML = `<h3>${student}</h3>`;
        summaryResults.appendChild(studentDiv);
        
        for (const month in summary[student]) {
            const count = summary[student][month];
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <span>${month}:</span>
                <span>${count} class${count !== 1 ? 'es' : ''}</span>
            `;
            studentDiv.appendChild(summaryItem);
        }
    }
}

function updateAttendanceTable() {
    const records = JSON.parse(localStorage.getItem('attendanceRecords'));
    const selectedMonth = document.getElementById('filterMonth').value;
    const selectedStudent = document.getElementById('filterStudent').value;
    
    // Filter records based on selections
    let filteredRecords = [...records];
    
    if (selectedMonth !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.month === selectedMonth);
    }
    
    if (selectedStudent !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.studentName === selectedStudent);
    }
    
    // Sort by date (newest first)
    filteredRecords.sort((a, b) => b.timestamp - a.timestamp);
    
    // Display records in table
    const tableBody = document.getElementById('attendanceBody');
    tableBody.innerHTML = '';
    
    if (filteredRecords.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">No records found for the selected filters.</td>';
        tableBody.appendChild(row);
        return;
    }
    
    filteredRecords.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.studentName}</td>
            <td>${record.month}</td>
            <td>${record.date}</td>
            <td><button class="delete-btn" data-index="${getOriginalIndex(record)}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteRecord(index);
        });
    });
}

function getOriginalIndex(record) {
    const records = JSON.parse(localStorage.getItem('attendanceRecords'));
    return records.findIndex(r => 
        r.studentName === record.studentName && 
        r.month === record.month && 
        r.date === record.date
    );
}

function deleteRecord(index) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    const records = JSON.parse(localStorage.getItem('attendanceRecords'));
    records.splice(index, 1);
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    
    updateStudentDropdown();
    updateSummaryAndTable();
}