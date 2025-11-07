// --- VARIÁVEIS DE ESTADO E DOM ---
let isAdmin = false;
const ADMIN_PASS = "admin123";

// Variáveis de Paginação
const POSTS_PER_PAGE = 10;
let currentPage = 1;

// Containers
const postsContainer = document.getElementById("postsContainer"); // index.html
const detailContainer = document.getElementById("newsDetailContainer"); // noticia.html
const paginationControls = document.getElementById("paginationControls"); // index.html

// Controles de Admin/Modal (apenas na index.html)
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const newPostBtn = document.getElementById("newPostBtn");
const postModal = document.getElementById("postModal");
const closeModal = document.querySelector(".close");
const savePostBtn = document.getElementById("savePostBtn");
const postTitleInput = document.getElementById("postTitle");
const postContentTextarea = document.getElementById("postContent");
const postImagesInput = document.getElementById("postImages");


// --- FUNÇÕES DE ARMAZENAMENTO E UTILIDADE ---

function loadPosts() {
    // Carrega posts ordenados por data (mais novo primeiro)
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    // Garante que o array está sempre ordenado, caso o localStorage tenha sido alterado manualmente
    return posts.sort((a, b) => b.id - a.id);
}

function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

function resetForm(){
    if(postTitleInput) postTitleInput.value = "";
    if(postContentTextarea) postContentTextarea.value = "";
    if(postImagesInput) postImagesInput.value = "";
}

// --- CONTROLES DE ADMIN E MODAL ---

if (loginBtn) { // Só executa se estiver na index.html
    
    function openModal() { postModal.style.display = "flex"; }
    function closeModalFunc() { postModal.style.display = "none"; resetForm(); }

    closeModal.addEventListener("click", closeModalFunc);
    window.addEventListener("click", e => { if (e.target === postModal) closeModalFunc(); });
    newPostBtn.addEventListener("click", openModal);

    // Login
    loginBtn.addEventListener("click", () => {
        const pass = prompt("Digite a senha do admin:");
        if (pass === ADMIN_PASS) {
            isAdmin = true;
            loginBtn.style.display = "none";
            logoutBtn.style.display = "inline-block";
            newPostBtn.style.display = "inline-block";
            renderPosts();
            alert("Login de Admin bem-sucedido!");
        } else alert("Senha incorreta!");
    });

    // Logout
    logoutBtn.addEventListener("click", () => {
        isAdmin = false;
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        newPostBtn.style.display = "none";
        closeModalFunc();
        renderPosts();
        alert("Logout de Admin efetuado.");
    });

    // Salvar Novo Post
    savePostBtn.addEventListener("click", () => {
        const title = postTitleInput.value.trim();
        const content = postContentTextarea.value.trim();
        const files = postImagesInput.files;

        if (!title || !content) { alert("Preencha título e conteúdo"); return; }
        
        const posts = loadPosts();
        const images = [];
        const numFiles = files.length;
        
        const finishSave = () => {
            const newPost = { id: Date.now(), title, content, images, date: new Date() };
            posts.unshift(newPost); // Adiciona no início (mais novo)
            savePosts(posts);
            currentPage = 1; // Volta para a primeira página após novo post
            renderPosts();
            closeModalFunc();
        };

        if (numFiles === 0) {
            finishSave();
        } else {
            let loadedCount = 0;
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e){
                    images.push(e.target.result);
                    loadedCount++;
                    if(loadedCount === numFiles) {
                        finishSave();
                    }
                }
                reader.readAsDataURL(file);
            });
        }
    });

    // Excluir Post
    window.deletePost = function(id) {
        if (!isAdmin) { alert("Acesso negado."); return; }
        if (!confirm("Tem certeza que deseja excluir esta notícia?")) return;
        let posts = loadPosts();
        posts = posts.filter(p => p.id !== id);
        savePosts(posts);
        renderPosts();
    }
}


// --- LÓGICA DE ROTEAMENTO E PAGINAÇÃO ---

// Função global para redirecionar para a página de detalhe
window.viewPostDetail = function(id) {
    window.location.href = `noticia.html?id=${id}`;
}

// Configura os botões de paginação
function setupPagination(totalPosts) {
    if (!paginationControls) return;

    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    if (totalPages <= 1) {
        paginationControls.innerHTML = '';
        return;
    }

    paginationControls.innerHTML = `
        <button id="prevPageBtn" class="btn btn-secondary" ${currentPage === 1 ? 'disabled' : ''}>← Anterior</button>
        <span class="pagination-current">Página ${currentPage} de ${totalPages}</span>
        <button id="nextPageBtn" class="btn btn-secondary" ${currentPage === totalPages ? 'disabled' : ''}>Próxima →</button>
    `;

    document.getElementById("prevPageBtn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById("nextPageBtn").addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPosts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Renderiza prévias na página inicial (index.html)
function renderPosts() {
    if (!postsContainer) return;

    const allPosts = loadPosts();
    
    setupPagination(allPosts.length);

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    let postsToRender = allPosts.slice(startIndex, endIndex);

    if (postsToRender.length === 0 && allPosts.length > 0 && currentPage > 1) {
        // Ajusta a página se o usuário deletou o último post da página atual
        currentPage = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
        postsToRender = allPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
        setupPagination(allPosts.length); // Re-renderiza a paginação
    }

    postsContainer.innerHTML = "";

    if (postsToRender.length === 0) {
        postsContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--color-text-light);">Nenhuma notícia publicada ainda.</p>`;
        return;
    }

    postsToRender.forEach(post => {
        const date = new Date(post.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
        // Usa o primeiro parágrafo como prévia
        const previewText = post.content.split('\n')[0].substring(0, 150) + (post.content.length > 150 ? '...' : '');
        
        const deleteBtn = isAdmin ? 
            `<div class="delete-control"><button class="btn btn-delete" onclick="event.stopPropagation(); deletePost(${post.id});">Excluir</button></div>` : "";

        const imageHTML = post.images.length > 0 ? 
            `<div class="card-image"><img src="${post.images[0]}" alt="Imagem de Capa"></div>` : 
            `<div class="card-image" style="background-color: #eee; display: flex; align-items: center; justify-content: center; color: var(--color-text-light);">[Sem Imagem]</div>`;

        postsContainer.innerHTML += `
            <a href="javascript:void(0);" onclick="viewPostDetail(${post.id})" class="post-card">
                ${imageHTML}
                <div class="card-content">
                    <h3>${post.title}</h3>
                    <p class="card-metadata">Publicado em ${date}</p>
                    <p class="card-preview">${previewText}</p>
                </div>
                ${deleteBtn}
            </a>
        `;
    });
}

// Renderiza o detalhe da notícia na página noticia.html
function renderPostDetail() {
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    const posts = loadPosts();
    // Encontra o índice e o post, importante para a paginação de detalhe
    const postIndex = posts.findIndex(p => p.id == postId);
    const post = posts[postIndex];

    if (!post) {
        detailContainer.innerHTML = `<h1>Notícia Não Encontrada</h1><p>O ID da notícia é inválido ou a notícia foi removida.</p>`;
        document.getElementById('detailTitle').textContent = 'Erro';
        return;
    }

    // --- Lógica de Navegação de Detalhe (Anterior/Próxima por Data) ---
    const prevPost = posts[postIndex + 1]; // Próximo na lista é o Anterior no tempo
    const nextPost = posts[postIndex - 1]; // Anterior na lista é o Próximo no tempo

    const prevButton = prevPost ? 
        `<button class="btn btn-secondary" onclick="viewPostDetail(${prevPost.id})" title="${prevPost.title}">← ${prevPost.title.substring(0, 30)}...</button>` : 
        `<button class="btn btn-secondary" disabled>← Notícia Anterior</button>`;
    
    const nextButton = nextPost ? 
        `<button class="btn btn-secondary" onclick="viewPostDetail(${nextPost.id})" title="${nextPost.title}">${nextPost.title.substring(0, 30)}... →</button>` : 
        `<button class="btn btn-secondary" disabled>Próxima Notícia →</button>`;

    const detailPagination = `
        <div class="pagination-controls detail-navigation">
            ${prevButton}
            ${nextButton}
        </div>
    `;
    
    // Conteúdo Principal
    document.getElementById('detailTitle').textContent = post.title;

    const date = new Date(post.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let imagesHTML = "";
    if (post.images.length > 0) {
        imagesHTML = `
        <div class="carousel-container detail-carousel">
            <div class="carousel" id="carousel-${post.id}">
                ${post.images.map((img, idx) => `<img src="${img}" alt="${post.title}" class="${idx === 0 ? 'active' : ''}">`).join("")}
            </div>
        </div>`;
    }

    detailContainer.innerHTML = `
        ${detailPagination} 
        <h1>${post.title}</h1>
        <p class="detail-metadata">Publicado em ${date}</p>
        ${imagesHTML}
        <div class="detail-content">
            ${post.content.replace(/\n/g, '<br>')} 
        </div>
        ${detailPagination}
    `;

    if (post.images.length > 1) initCarousel(`carousel-${post.id}`);
}


// --- FUNÇÃO CARROSSEL ---

function initCarousel(id){
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const imgs = carousel.querySelectorAll("img");
    if (imgs.length <= 1) return; 

    let index = 0;

    function showImage(idx) {
        imgs.forEach((img, i) => {
            img.classList.remove('active');
            if (i === idx) {
                img.classList.add('active');
            }
        });
    }

    showImage(index);

    setInterval(()=>{
        index = (index + 1) % imgs.length;
        showImage(index);
    }, 4000); 
}


// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica e renderiza o conteúdo correto
    if (postsContainer) {
        renderPosts();
    } else if (detailContainer) {
        renderPostDetail();
    }
    
    // 2. Verifica o estado do admin no carregamento (na index.html)
    if (loginBtn) {
        // Garante a visibilidade correta ao iniciar
        if (isAdmin) {
            loginBtn.style.display = "none";
            logoutBtn.style.display = "inline-block";
            newPostBtn.style.display = "inline-block";
        } else {
            loginBtn.style.display = "inline-block";
            logoutBtn.style.display = "none";
            newPostBtn.style.display = "none";
        }
    }
});
