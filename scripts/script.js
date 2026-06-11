const NOME_ADMIN = "teteu";

function iniciarSistema() {
    let usuarioAtual = localStorage.getItem('usuarioAtual');
    let paginaAtual = window.location.pathname.split("/").pop();

    if (!usuarioAtual && paginaAtual !== 'login.html' && paginaAtual !== 'index.html' && paginaAtual !== '') {
        window.location.href = 'login.html';
        return;
    }

    if (usuarioAtual && paginaAtual === 'login.html') {
        window.location.href = 'dashboard.html';
        return;
    }

    carregarPerfil();
    carregarComunidade();
    carregarDashboard();
    carregarLibrary();
    carregarImpacto();
    configurarSidebarRetratil();
}

function configurarSidebarRetratil() {
    const toggleBtn = document.getElementById('toggle-sidebar');
    const aside = document.querySelector('aside');
    
    if (!toggleBtn || !aside) return;

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        aside.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        toggleBtn.innerHTML = '&gt;';
    } else {
        toggleBtn.innerHTML = 'VidaUtil &lt;';
    }

    toggleBtn.onclick = function() {
        aside.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
        
        if (aside.classList.contains('collapsed')) {
            toggleBtn.innerHTML = '&gt;';
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            toggleBtn.innerHTML = 'VidaUtil &lt;';
            localStorage.setItem('sidebarCollapsed', 'false');
        }
    };
}

function fazerLogin(event) {
    event.preventDefault();
    let nome = document.getElementById('login-nome').value.trim();
    let senhaDigitada = document.getElementById('login-senha').value.trim();
    let bancoUsuarios = JSON.parse(localStorage.getItem('meusUsuarios')) || {};

    if (nome && senhaDigitada) {
        if (bancoUsuarios.hasOwnProperty(nome)) {
            if (senhaDigitada === bancoUsuarios[nome]) {
                localStorage.setItem('usuarioAtual', nome);
                window.location.href = 'dashboard.html';
            } else {
                alert("Senha incorreta.");
            }
        } else {
            bancoUsuarios[nome] = senhaDigitada;
            localStorage.setItem('meusUsuarios', JSON.stringify(bancoUsuarios));
            localStorage.setItem('usuarioAtual', nome);
            window.location.href = 'dashboard.html';
        }
    }
}

function carregarPerfil() {
    const profileDiv = document.getElementById('info-usuario');
    if (profileDiv) {
        let usuarioAtual = localStorage.getItem('usuarioAtual');
        let fotosUsuarios = JSON.parse(localStorage.getItem('fotosUsuarios')) || {};
        let avatarPadrao = `https://ui-avatars.com/api/?name=${usuarioAtual}&background=0b1326&color=4EDEA3`;
        let fotoSrc = fotosUsuarios[usuarioAtual] || avatarPadrao;

        if (usuarioAtual) {
            profileDiv.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <img id="img-perfil" src="${fotoSrc}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid rgb(78,222,163); margin-bottom: 15px; box-shadow: 0px 4px 10px rgba(0,0,0,0.5);">
                    <br>
                    <input type="file" id="input-foto" accept="image/*" style="display: none;" onchange="salvarFotoPerfil(event)">
                    <label for="input-foto" style="background-color: rgb(78,222,163); color: rgb(13, 23, 44); padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; font-weight: bold;">📸 Change photo</label>
                </div>
                <h2>Hello, <span style="color: rgb(78,222,163);">${usuarioAtual}</span>!</h2>
                <p>Status: ${usuarioAtual === NOME_ADMIN ? 'Admin' : 'Member'}</p>`;
        }
    }
    
    renderizarPostsUsuario();
}

function renderizarPostsUsuario() {
    const postsContainer = document.getElementById('posts-usuario');
    if (!postsContainer) return;

    let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
    let usuarioAtual = localStorage.getItem('usuarioAtual');
    
    let postsDoUsuario = postagens.filter(post => post.autor === usuarioAtual);
    
    postsContainer.innerHTML = '';

    if (postsDoUsuario.length === 0) {
        postsContainer.innerHTML = '<p style="color: white; font-family: sans-serif;">No posts</p>';
        return;
    }

    postsDoUsuario.sort((a, b) => b.id - a.id);
    
    postsDoUsuario.forEach(post => {
        let htmlImagem = post.imagem ? `<img src="${post.imagem}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.1);">` : '';
        
        postsContainer.innerHTML += `
            <div style="background-color: rgb(13, 23, 44); border: 1px solid rgb(78,222,163); padding: 15px; margin-bottom: 15px; border-radius: 5px; width: 80%; max-width: 600px; text-align: left; font-family: sans-serif;">
                <h3 style="color: rgb(78,222,163); margin: 0 0 5px 0;">${post.titulo}</h3>
                <p style="color: white; line-height: 1.4; margin: 0 0 10px 0;">${post.conteudo}</p>
                ${htmlImagem}
            </div>
        `;
    });
}

function salvarFotoPerfil(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let base64Image = e.target.result;
            let usuarioAtual = localStorage.getItem('usuarioAtual');
            let fotosUsuarios = JSON.parse(localStorage.getItem('fotosUsuarios')) || {};
            fotosUsuarios[usuarioAtual] = base64Image;
            localStorage.setItem('fotosUsuarios', JSON.stringify(fotosUsuarios));
            document.getElementById('img-perfil').src = base64Image;
            renderizarPostagens();
        };
        reader.readAsDataURL(file);
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioAtual');
    window.location.href = 'login.html';
}

function carregarComunidade() {
    const painelPostagem = document.getElementById('painel-postagem');
    let usuarioAtual = localStorage.getItem('usuarioAtual');
    if (usuarioAtual && painelPostagem) {
        painelPostagem.style.display = 'block';
    }
    renderizarPostagens();
}

function formatarTextoPostagem(texto) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return texto.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" style="color: rgb(78,222,163); text-decoration: underline; font-weight: bold;">${url}</a>`;
    });
}

function gerarHtmlArquivo(post) {
    if (post.imagem && !post.arquivo) {
        return `<img src="${post.imagem}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 4px; margin-top: 15px; border: 1px solid rgba(255,255,255,0.1);">`;
    }

    if (!post.arquivo) return '';

    let tipo = post.arquivo.tipo || '';
    let dados = post.arquivo.dados;
    let nome = post.arquivo.nome;

    if (tipo.startsWith('image/')) {
        return `<img src="${dados}" alt="${nome}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 4px; margin-top: 15px; border: 1px solid rgba(255,255,255,0.1);">`;
    } else if (tipo.startsWith('video/')) {
        return `<video controls style="width: 100%; max-height: 400px; border-radius: 4px; margin-top: 15px; border: 1px solid rgba(255,255,255,0.1);"><source src="${dados}" type="${tipo}">Seu navegador não suporta este vídeo.</video>`;
    } else if (tipo.startsWith('audio/')) {
        return `<audio controls style="width: 100%; margin-top: 15px;"><source src="${dados}" type="${tipo}">Seu navegador não suporta áudio.</audio>`;
    } else {
        return `<div style="margin-top: 15px; padding: 10px; background-color: rgba(78,222,163,0.1); border: 1px solid rgb(78,222,163); border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">📄</span>
                    <a href="${dados}" download="${nome}" style="color: rgb(78,222,163); text-decoration: none; font-weight: bold; word-break: break-all;">Download: ${nome}</a>
                </div>`;
    }
}

function postarMensagem() {
    let titulo = document.getElementById('titulo-post').value;
    let conteudo = document.getElementById('conteudo-post').value;
    let inputArquivo = document.getElementById('imagem-post');
    let usuarioAtual = localStorage.getItem('usuarioAtual');

    if (titulo.trim() === "" || conteudo.trim() === "") {
        alert("Preencha o título e o conteúdo!");
        return;
    }

    if (inputArquivo && inputArquivo.files && inputArquivo.files[0]) {
        let file = inputArquivo.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            let objArquivo = {
                nome: file.name,
                tipo: file.type,
                dados: e.target.result
            };
            salvarPost(titulo, conteudo, objArquivo, usuarioAtual);
            inputArquivo.value = "";
        };
        reader.readAsDataURL(file);
    } else {
        salvarPost(titulo, conteudo, null, usuarioAtual);
    }
}

function salvarPost(titulo, conteudo, arquivo, usuarioAtual) {
    let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
    postagens.push({ 
        id: Date.now(), 
        autor: usuarioAtual,
        titulo: titulo, 
        conteudo: conteudo,
        arquivo: arquivo,
        imagem: null,
        fixado: false
    });
    localStorage.setItem('postagensComunidade', JSON.stringify(postagens));
    document.getElementById('titulo-post').value = '';
    document.getElementById('conteudo-post').value = '';
    renderizarPostagens();
}

function excluirPostagem(id) {
    if(confirm("Tem certeza que deseja excluir esta postagem?")) {
        let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
        postagens = postagens.filter(post => post.id !== id);
        localStorage.setItem('postagensComunidade', JSON.stringify(postagens));
        renderizarPostagens();
        carregarDashboard();
    }
}

function alternarFixarPostagem(id) {
    let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
    let index = postagens.findIndex(post => post.id === id);
    if (index !== -1) {
        postagens[index].fixado = !postagens[index].fixado;
        localStorage.setItem('postagensComunidade', JSON.stringify(postagens));
        renderizarPostagens();
        carregarDashboard();
    }
}

function editarPostagem(id) {
    let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
    let index = postagens.findIndex(post => post.id === id);
    if (index !== -1) {
        let novoTitulo = prompt("Editar Título:", postagens[index].titulo);
        let novoConteudo = prompt("Editar Conteúdo:", postagens[index].conteudo);
        if (novoTitulo && novoConteudo) {
            postagens[index].titulo = novoTitulo;
            postagens[index].conteudo = novoConteudo;
            localStorage.setItem('postagensComunidade', JSON.stringify(postagens));
            renderizarPostagens();
            carregarDashboard();
        }
    }
}

function renderizarPostagens() {
    const postsContainer = document.getElementById('lista-postagens');
    if (!postsContainer) return;
    let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
    let fotosUsuarios = JSON.parse(localStorage.getItem('fotosUsuarios')) || {};
    let usuarioAtual = localStorage.getItem('usuarioAtual');
    postsContainer.innerHTML = '';
    if (postagens.length === 0) {
        postsContainer.innerHTML = '<p style="color: white; font-family: sans-serif;">None</p>';
        return;
    }
    postagens.sort((a, b) => {
        if (a.fixado === b.fixado) return b.id - a.id; 
        return a.fixado ? -1 : 1;
    });
    postagens.forEach(post => {
        let ehAdmin = (usuarioAtual === NOME_ADMIN);
        let ehAutor = (usuarioAtual === post.autor);
        let avatarPadrao = `https://ui-avatars.com/api/?name=${post.autor}&background=0b1326&color=4EDEA3`;
        let fotoAutor = fotosUsuarios[post.autor] || avatarPadrao;
        let indicativoFixado = post.fixado ? `<span style="background-color: rgb(78,222,163); color: rgb(13,23,44); padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; display: inline-block;">📌 Destaque</span>` : '';
        let btnExcluir = ehAdmin ? `<button onclick="excluirPostagem(${post.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 10px;">🗑️ Excluir</button>` : '';
        let btnFixar = ehAdmin ? `<button onclick="alternarFixarPostagem(${post.id})" style="background-color: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 10px;">${post.fixado ? 'Desfixar' : '📌 Destacar'}</button>` : '';
        let btnEditar = ehAutor ? `<button onclick="editarPostagem(${post.id})" style="background-color: rgb(78,222,163); color: rgb(13, 23, 44); border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">✏️ Editar</button>` : '';
        let bordaPost = post.fixado ? '2px solid rgb(78,222,163)' : '1px solid gray';

        let conteudoFormatado = formatarTextoPostagem(post.conteudo);
        let htmlArquivo = gerarHtmlArquivo(post);

        postsContainer.innerHTML += `
            <div style="background-color: rgb(13, 23, 44); border: ${bordaPost}; padding: 15px; margin-bottom: 15px; border-radius: 5px; width: 80%; max-width: 600px; text-align: left; font-family: sans-serif;">
                ${indicativoFixado}
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <img src="${fotoAutor}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px; border: 2px solid rgb(78,222,163);">
                    <div>
                        <h3 style="color: rgb(78,222,163); margin: 0; padding: 0; margin-bottom: 3px;">${post.titulo}</h3>
                        <small style="color: rgb(136, 136, 136);">Made by: <strong style="color: white;">${post.autor}</strong></small>
                    </div>
                </div>
                <p style="color: white; line-height: 1.5; margin-top: 5px; white-space: pre-wrap;">${conteudoFormatado}</p>
                ${htmlArquivo}
                <div style="margin-top: 15px;">
                    ${btnExcluir}
                    ${btnFixar}
                    ${btnEditar}
                </div>
            </div>
        `;
    });
}

function carregarDashboard() {
    const dashContainer = document.getElementById('melhores-postagens');
    if (!dashContainer) return;
    let postagens = JSON.parse(localStorage.getItem('postagensComunidade')) || [];
    let fotosUsuarios = JSON.parse(localStorage.getItem('fotosUsuarios')) || {};
    dashContainer.innerHTML = '';
    let destaques = postagens.filter(post => post.fixado === true);
    if (destaques.length === 0) {
        dashContainer.innerHTML = '<p style="color: white; font-family: sans-serif;">None</p>';
        return;
    }
    destaques.forEach(post => {
        let avatarPadrao = `https://ui-avatars.com/api/?name=${post.autor}&background=0b1326&color=4EDEA3`;
        let fotoAutor = fotosUsuarios[post.autor] || avatarPadrao;
        
        let conteudoFormatado = formatarTextoPostagem(post.conteudo);
        let htmlArquivo = gerarHtmlArquivo(post);

        dashContainer.innerHTML += `
            <div style="background-color: rgb(13, 23, 44); border: 2px solid rgb(78,222,163); padding: 15px; margin-bottom: 15px; border-radius: 5px; width: 80%; max-width: 600px; text-align: left; font-family: sans-serif;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <img src="${fotoAutor}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px; border: 2px solid rgb(78,222,163);">
                    <div>
                        <h3 style="color: rgb(78,222,163); margin: 0; padding: 0; margin-bottom: 3px;">${post.titulo}</h3>
                        <small style="color: rgb(136, 136, 136);">Made by: <strong style="color: white;">${post.autor}</strong></small>
                    </div>
                </div>
                <p style="color: white; line-height: 1.5; margin-top: 5px; white-space: pre-wrap;">${conteudoFormatado}</p>
                ${htmlArquivo}
            </div>
        `;
    });
}

function carregarLibrary() {
    let paginaAtual = window.location.pathname.split("/").pop();
    if (paginaAtual !== 'library.html') return;

    let usuarioAtual = localStorage.getItem('usuarioAtual');
    const painelAdmin = document.getElementById('painel-admin-library');
    
    if (usuarioAtual === NOME_ADMIN && painelAdmin) {
        painelAdmin.style.display = 'block';
    }

    renderizarVideos();
}

function extrairIdYoutube(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function adicionarVideo() {
    let titulo = document.getElementById('titulo-video').value;
    let categoria = document.getElementById('categoria-video').value;
    let url = document.getElementById('url-video').value;

    if (titulo.trim() === "" || categoria.trim() === "" || url.trim() === "") {
        alert("Preencha todos os campos, incluindo a categoria!");
        return;
    }

    let videoId = extrairIdYoutube(url);
    if (!videoId) {
        alert("Por favor, insira um link válido do YouTube.");
        return;
    }

    let thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    let videos = JSON.parse(localStorage.getItem('videosLibrary')) || [];
    videos.push({
        id: Date.now(),
        titulo: titulo,
        categoria: categoria.trim(),
        url: url,
        thumbnail: thumbnail
    });

    localStorage.setItem('videosLibrary', JSON.stringify(videos));
    
    document.getElementById('titulo-video').value = '';
    document.getElementById('categoria-video').value = '';
    document.getElementById('url-video').value = '';
    
    renderizarVideos();
}

function excluirVideo(id, event) {
    event.preventDefault(); 
    if(confirm("Tem certeza que deseja excluir este vídeo da Library?")) {
        let videos = JSON.parse(localStorage.getItem('videosLibrary')) || [];
        videos = videos.filter(video => video.id !== id);
        localStorage.setItem('videosLibrary', JSON.stringify(videos));
        renderizarVideos();
    }
}

function renderizarVideos() {
    const gridVideos = document.getElementById('grid-videos');
    if (!gridVideos) return;

    let termoBusca = document.getElementById('buscar-categoria') ? document.getElementById('buscar-categoria').value.trim().toLowerCase() : '';

    let videos = JSON.parse(localStorage.getItem('videosLibrary')) || [];
    let usuarioAtual = localStorage.getItem('usuarioAtual');
    let ehAdmin = (usuarioAtual === NOME_ADMIN);

    gridVideos.innerHTML = '';

    if (termoBusca !== '') {
        videos = videos.filter(video => video.categoria && video.categoria.toLowerCase().includes(termoBusca));
    }

    if (videos.length === 0) {
        gridVideos.innerHTML = '<p style="color: rgb(136, 136, 136); font-family: sans-serif; grid-column: 1 / -1; text-align: center;">Null</p>';
        return;
    }

    videos.slice().reverse().forEach(video => {
        let btnExcluir = ehAdmin ? `<button onclick="excluirVideo(${video.id}, event)" style="position: absolute; top: 10px; right: 10px; background-color: #ff4d4d; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; z-index: 10;">🗑️</button>` : '';
        let tagCategoria = video.categoria ? `<span style="background-color: rgba(78,222,163,0.15); color: rgb(78,222,163); padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; margin-top: 12px; display: inline-block; align-self: flex-start; border: 1px solid rgba(78,222,163,0.3); font-weight: bold;">${video.categoria}</span>` : '';

        gridVideos.innerHTML += `
            <a href="${video.url}" target="_blank" class="video-card" style="text-decoration: none; position: relative; display: flex; flex-direction: column; background-color: rgb(13, 23, 44); border: 1px solid rgb(78,222,163); border-radius: 8px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;">
                ${btnExcluir}
                <img src="${video.thumbnail}" alt="Thumbnail" style="width: 100%; height: 160px; object-fit: cover; display: block; border-bottom: 1px solid rgb(78,222,163);">
                <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                    <h3 style="color: white; margin: 0; font-family: sans-serif; font-size: 1.05rem; text-align: left; line-height: 1.4;">${video.titulo}</h3>
                    ${tagCategoria}
                </div>
            </a>
        `;
    });
}

function enviarMensagemChat() {
    const inputTexto = document.getElementById('chat-text-input');
    const texto = inputTexto.value.trim();

    if (texto === "") return;

    adicionarBalaoChat("You", texto, "flex-end", "gray", "white");
    inputTexto.value = "";

    setTimeout(() => {
        adicionarBalaoChat("VidaUtil.AI", "Your message:" + texto + ".", "flex-start", "rgb(78,222,163)", "rgb(78,222,163)");
    }, 1500);
}

function anexarArquivoChat(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const dadosBase64 = e.target.result;
        let conteudoHtml = "";

        if (file.type.startsWith('image/')) {
            conteudoHtml = `<br><img src="${dadosBase64}" style="max-width: 100%; max-height: 250px; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.2); object-fit: cover;">`;
        } else {
            conteudoHtml = `<br><span style="color: rgb(78,222,163); display: block; margin-top: 5px;">📄 Arquivo anexado: ${file.name}</span>`;
        }

        adicionarBalaoChat("You", "attachment:" + conteudoHtml, "flex-end", "gray", "white");
        
        setTimeout(() => {
            adicionarBalaoChat("VidaUtil.AI", ".", "flex-start", "rgb(78,222,163)", "rgb(78,222,163)");
        }, 1500);
    };
    
    reader.readAsDataURL(file);
    event.target.value = "";
}

function adicionarBalaoChat(remetente, conteudo, alinhamento, corBorda, corNome) {
    const history = document.getElementById('chat-history');
    if (!history) return;

    const div = document.createElement('div');
    div.style.alignSelf = alinhamento;
    div.style.backgroundColor = "rgb(11,19,38)";
    div.style.border = `1px solid ${corBorda}`;
    div.style.padding = "10px 15px";
    div.style.borderRadius = "8px";
    div.style.color = "white";
    div.style.maxWidth = "80%";
    div.style.lineHeight = "1.4";
    div.style.wordBreak = "break-word"; 

    div.innerHTML = `<strong style="color: ${corNome};">${remetente}:</strong><br>${conteudo}`;

    history.appendChild(div);
    
    history.scrollTop = history.scrollHeight;
}

function carregarImpacto() {
    let paginaAtual = window.location.pathname.split("/").pop();
    if (paginaAtual !== 'impact.html') return;

    let usuarioAtual = localStorage.getItem('usuarioAtual');
    
    let historicoReciclagem = JSON.parse(localStorage.getItem('historicoReciclagem')) || [];
    
    let totalPlacas = historicoReciclagem.filter(item => item.categoria === 'Boards').length;
    let totalFios = historicoReciclagem.filter(item => item.categoria === 'Wires').length;
    let totalBaterias = historicoReciclagem.filter(item => item.categoria === 'Batteries').length;

    const ctx = document.getElementById('graficoOndeReciclado').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar', 
        data: {
            labels: ['Boards', 'Wires/Cables', 'Batteries', 'Others'],
            datasets: [{
                label: 'Recycled Electronics (Units)',
                data: [totalPlacas, totalFios, totalBaterias, 0],
                backgroundColor: 'rgb(78,222,163)',
                borderColor: 'rgb(13, 23, 44)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            }
        }
    });
}

window.onload = iniciarSistema;

window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.salvarFotoPerfil = salvarFotoPerfil;
window.postarMensagem = postarMensagem;
window.excluirPostagem = excluirPostagem;
window.alternarFixarPostagem = alternarFixarPostagem;
window.editarPostagem = editarPostagem;
window.adicionarVideo = adicionarVideo;
window.excluirVideo = excluirVideo;
window.enviarMensagemChat = enviarMensagemChat;
window.anexarArquivoChat = anexarArquivoChat;