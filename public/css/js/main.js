// Mostrar modal
document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('registerModal').style.display = 'block';
  });
  document.getElementById('closeRegister').addEventListener('click', () => {
    document.getElementById('registerModal').style.display = 'none';
  });
  
  // Registro: enviar datos y solicitar código
  document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (+document.getElementById('age').value < 18) { alert("18+"); return; }
    const data = {
      username: document.getElementById('username').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
      age: document.getElementById('age').value
    };
    const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    const result = await res.json();
    if(result.success) {
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('verifyForm').style.display = 'block';
    } else alert("Error");
  });
  
  // Verificar código
  document.getElementById('verifyForm').addEventListener('submit', async e => {
    e.preventDefault();
    const code = document.getElementById('verificationCode').value;
    const res = await fetch('/api/auth/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code }) });
    const result = await res.json();
    if(result.verified) { alert("Verificado"); document.getElementById('registerModal').style.display = 'none'; }
    else alert("Código incorrecto");
  });
  
  // Login
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    };
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    const result = await res.json();
    if(result.success) alert("Login exitoso");
    else alert("Credenciales incorrectas");
  });
  