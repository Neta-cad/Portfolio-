// ===== PROJECT ROW EXPAND =====
document.querySelectorAll('.project-row').forEach(row => {
  row.addEventListener('click', () => {
    const isOpen = row.classList.contains('open');
    document.querySelectorAll('.project-row').forEach(r => r.classList.remove('open'));
    if (!isOpen) row.classList.add('open');
  });
});

// ===== THEME TOGGLE =====
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? '◑' : '◐';
});

// ===== RECRUITER MODE =====
const recruiterBtn = document.getElementById('recruiterToggle');
recruiterBtn.addEventListener('click', () => {
  document.body.classList.toggle('recruiter');
  const isOn = document.body.classList.contains('recruiter');
  recruiterBtn.textContent = isOn ? 'Full Site' : 'Recruiter Mode';
  document.querySelectorAll('.project-row').forEach(r => r.classList.add('open'));
});

// ===== MOBILE NAV =====
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== SQL PLAYGROUND (sql.js — real SQL in the browser) =====
const pgStatus = document.getElementById('pgStatus');
const pgOutput = document.getElementById('pgOutput');
const sqlInput = document.getElementById('sqlInput');
const runBtn = document.getElementById('runQuery');
const samplesWrap = document.getElementById('pgSamples');
let db;

const sampleQueries = [
  { label: 'Active interns', sql: "SELECT name, role, status FROM interns WHERE status = 'active';" },
  { label: 'By department', sql: "SELECT department, COUNT(*) as total FROM interns GROUP BY department;" },
  { label: 'Top performers', sql: "SELECT name, score FROM interns ORDER BY score DESC LIMIT 3;" }
];

sampleQueries.forEach(q => {
  const btn = document.createElement('button');
  btn.textContent = q.label;
  btn.addEventListener('click', () => { sqlInput.value = q.sql; runQuery(); });
  samplesWrap.appendChild(btn);
});

initSQL();

async function initSQL() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });
    db = new SQL.Database();
    db.run(`
      CREATE TABLE interns (
        id INTEGER PRIMARY KEY,
        name TEXT,
        role TEXT,
        department TEXT,
        status TEXT,
        score INTEGER
      );
      INSERT INTO interns (name, role, department, status, score) VALUES
        ('Ayomide', 'Data & Operations', 'Data', 'active', 96),
        ('Chidi', 'Frontend Dev', 'Engineering', 'active', 88),
        ('Amara', 'Backend Dev', 'Engineering', 'inactive', 74),
        ('Tunde', 'QA Analyst', 'Data', 'active', 91),
        ('Zainab', 'Product', 'Ops', 'inactive', 82);
    `);
    pgStatus.textContent = 'Engine ready — sandboxed, read-only sample data. Try a query below.';
    runQuery();
  } catch (err) {
    pgStatus.textContent = 'Could not load SQL engine. Check your connection and refresh.';
  }
}

runBtn.addEventListener('click', runQuery);

function runQuery() {
  if (!db) { pgStatus.textContent = 'Engine still loading…'; return; }
  const sql = sqlInput.value.trim();

  if (!/^select/i.test(sql)) {
    pgOutput.innerHTML = '';
    pgStatus.textContent = 'Only SELECT statements are allowed in this sandbox.';
    return;
  }

  try {
    const res = db.exec(sql);
    if (!res.length) {
      pgOutput.innerHTML = '';
      pgStatus.textContent = 'Query ran fine — no rows returned.';
      return;
    }
    const { columns, values } = res[0];
    let html = '<table><thead><tr>' + columns.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
    values.forEach(row => {
      html += '<tr>' + row.map(v => `<td>${v}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table>';
    pgOutput.innerHTML = html;
    pgStatus.textContent = `(${values.length} rows)`;
  } catch (err) {
    pgOutput.innerHTML = '';
    pgStatus.textContent = `Error: ${err.message}`;
  }
}