/* script.js */
const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

function salvarUsuarios() {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Cadastro
const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) {
  cadastroForm.addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value;

    if (usuarios.find(u => u.nome === nome)) {
      alert('Já existe um cadastro com esse nome.');
    } else {
      usuarios.push({ nome, cpf, senha, status: 'aguardando' });
      salvarUsuarios();
      alert('Cadastro enviado para aprovação. Aguarde liberação do RH.');
      location.href = 'index.html';
    }
  });
}

// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const cpf = document.getElementById('cpf-login').value.trim();
    const senha = document.getElementById('senha-login').value;
    const user = usuarios.find(u => u.cpf === cpf && u.senha === senha);

    if (user) {
      if (user.status !== 'aprovado') {
        alert('Cadastro ainda não aprovado ou bloqueado pelo RH.');
        return;
      }
      localStorage.setItem('usuario-logado', JSON.stringify(user));
      location.href = 'painel.html';
    } else {
      alert('Usuário não encontrado ou senha incorreta.');
    }
  });
}

// Painel Funcionário
if (location.pathname.includes('painel.html')) {
  const user = JSON.parse(localStorage.getItem('usuario-logado'));
  if (user) {
    document.getElementById('nome-funcionario').textContent = user.nome;
    const nomeArquivo = user.nome.toLowerCase().replace(/\s+/g, '_') + '.pdf';
    document.getElementById('link-pdf').href = 'pdfs/' + nomeArquivo;
  } else {
    location.href = 'login.html';
  }
}

// Admin
function logarAdmin() {
  const user = document.getElementById('admin-user').value;
  const pass = document.getElementById('admin-pass').value;
  if (user === 'admin' && pass === 'RhItalog@') {
    document.getElementById('login-admin').style.display = 'none';
    document.getElementById('painel-rh').style.display = 'block';
    listarPendentes();
  } else {
    alert('Acesso negado.');
  }
}

function listarPendentes(filtro = '') {
  const lista = document.getElementById('lista-aprovacoes');
  lista.innerHTML = '';
  usuarios.forEach((u, i) => {
    if (u.nome.toUpperCase().includes(filtro.toUpperCase())) {
      const li = document.createElement('li');
      li.style.textAlign = 'left'; // alinha nome à esquerda

      let statusHTML = '';
      if (u.status === 'aprovado') statusHTML = '<span class="status status-verde"></span>';
      else if (u.status === 'bloqueado') statusHTML = '<span class="status status-bloqueado">✖</span>';
      else statusHTML = '<span class="status status-vermelho"></span>';

      li.innerHTML = `${statusHTML}${u.nome} - CPF: ${u.cpf}`;

      // Criar botões
      const aprovar = document.createElement('button');
      aprovar.textContent = 'Aprovar';
      aprovar.className = 'btn';
      aprovar.onclick = () => {
        usuarios[i].status = 'aprovado';
        salvarUsuarios();
        listarPendentes(filtro);
      };

      const reprovar = document.createElement('button');
      reprovar.textContent = 'Reprovar';
      reprovar.className = 'btn';
      reprovar.onclick = () => {
        usuarios[i].status = 'aguardando';
        salvarUsuarios();
        listarPendentes(filtro);
      };

      const bloquear = document.createElement('button');
      bloquear.textContent = 'Bloquear';
      bloquear.className = 'btn';
      bloquear.onclick = () => {
        usuarios[i].status = 'bloqueado';
        salvarUsuarios();
        listarPendentes(filtro);
      };

      const excluir = document.createElement('button');
      excluir.textContent = 'Excluir';
      excluir.className = 'btn';
      excluir.onclick = () => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
          usuarios.splice(i, 1);
          salvarUsuarios();
          listarPendentes(filtro);
        }
      };

      // Container para os botões
      const containerBotoes = document.createElement('div');
      containerBotoes.className = 'botoes-acoes';
      containerBotoes.appendChild(aprovar);
      containerBotoes.appendChild(reprovar);
      containerBotoes.appendChild(bloquear);
      containerBotoes.appendChild(excluir);

      li.appendChild(containerBotoes);
      lista.appendChild(li);
    }
  });
}


function filtrarUsuarios() {
  const filtro = document.getElementById('pesquisa-nome').value;
  listarPendentes(filtro);
}

function importarPDFs() {
  const input = document.getElementById('upload');
  const status = document.getElementById('status-importacao');
  status.textContent = 'Simulação de envio de arquivos: ' + input.files.length + ' PDF(s).';
}
