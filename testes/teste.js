// Simples login admin
let isAdmin = false;
const ADMIN_PASS = "admin123";

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const postModal = document.getElementById("postModal");
const closeModal = document.querySelector(".close");
const savePostBtn = document.getElementById("savePostBtn");
const postsContainer = document.getElementById("postsContainer");

// Eventos Login/Logout
loginBtn.addEventListener("click", () => {
    const pass = prompt("Digite a senha do admin:");
    if(pass === ADMIN_PASS){
        isAdmin = true;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        openModal();
        renderPosts();
    } else alert("Senha incorreta!");
});

logoutBtn.addEventListener("click", () => {
    isAdmin = false;
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    closeModalFunc();
    renderPosts();
});

// Modal
function openModal() { postModal.style.display = "flex"; }
function closeModalFunc() { postModal.style.display = "none"; }
closeModal.addEventListener("click", closeModalFunc);
window.addEventListener("click", e => { if(e.target === postModal) closeModalFunc(); });

// Carrega posts do localStorage
function loadPosts() {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    return posts;
}

// Salva posts no localStorage
function savePosts(posts) {
    localStorage.setItem("posts", JSON.stringify(posts));
}

// Cria novo post
savePostBtn.addEventListener("click", () => {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const files = document.getElementById("postImages").files;

    if(!title || !content) { alert("Preencha título e conteúdo"); return; }

    if(files.length > 10){ alert("Máximo de 10 imagens"); return; }

    const posts = loadPosts();
    const images = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e){
            images.push(e.target.result);
            if(images.length === files.length){
                const newPost = {id: Date.now(), title, content, images, date: new Date()};
                posts.unshift(newPost);
                savePosts(posts);
                renderPosts();
                closeModalFunc();
            }
        }
        reader.readAsDataURL(file);
    });

    if(files.length === 0){
        const newPost = {id: Date.now(), title, content, images, date: new Date()};
        posts.unshift(newPost);
        savePosts(posts);
        renderPosts();
        closeModalFunc();
    }
});

// Renderiza posts
function renderPosts(){
    const posts = loadPosts();
    postsContainer.innerHTML = "";

    posts.forEach(post => {
        const postEl = document.createElement("div");
        postEl.className = "post";

        let imagesHTML = "";
        if(post.images.length){
            imagesHTML = `<div class="carousel" id="carousel-${post.id}">
                ${post.images.map(img => `<img src="${img}">`).join("")}
            </div>`;
        }

        const deleteBtn = isAdmin ? `<button onclick="deletePost(${post.id})">Excluir</button>` : "";

        postEl.innerHTML = `
            <h2>${post.title}</h2>
            <p>${new Date(post.date).toLocaleString()}</p>
            ${imagesHTML}
            <p>${post.content}</p>
            ${deleteBtn}
        `;

        postsContainer.appendChild(postEl);

        if(post.images.length) initCarousel(`carousel-${post.id}`);
    });
}

// Excluir post
window.deletePost = function(id){
    if(!confirm("Deseja realmente excluir este post?")) return;
    let posts = loadPosts();
    posts = posts.filter(p => p.id !== id);
    savePosts(posts);
    renderPosts();
}

// Carrossel simples
function initCarousel(id){
    const carousel = document.getElementById(id);
    let index = 0;
    const imgs = carousel.querySelectorAll("img");
    imgs.forEach((img,i)=>img.style.display=i===0?"block":"none");

    setInterval(()=>{
        imgs.forEach((img,i)=>img.style.display=i===index?"block":"none");
        index = (index + 1) % imgs.length;
    }, 3000);
}
const newPostBtn = document.getElementById("newPostBtn");

// Mostrar botão nova notícia quando admin logar
loginBtn.addEventListener("click", () => {
    const pass = prompt("Digite a senha do admin:");
    if(pass === ADMIN_PASS){
        isAdmin = true;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        newPostBtn.style.display = "inline-block";
        renderPosts();
    } else alert("Senha incorreta!");
});

logoutBtn.addEventListener("click", () => {
    isAdmin = false;
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    newPostBtn.style.display = "none";
    closeModalFunc();
    renderPosts();
});

// Abrir modal pelo botão Nova Notícia
newPostBtn.addEventListener("click", openModal);

// Resetar formulário após salvar
savePostBtn.addEventListener("click", () => {
    const title = document.getElementById("postTitle").value;
    const content = document.getElementById("postContent").value;
    const files = document.getElementById("postImages").files;

    if(!title || !content) { alert("Preencha título e conteúdo"); return; }

    if(files.length > 10){ alert("Máximo de 10 imagens"); return; }

    const posts = loadPosts();
    const images = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e){
            images.push(e.target.result);
            if(images.length === files.length){
                const newPost = {id: Date.now(), title, content, images, date: new Date()};
                posts.unshift(newPost);
                savePosts(posts);
                renderPosts();
                closeModalFunc();
                resetForm();
            }
        }
        reader.readAsDataURL(file);
    });

    if(files.length === 0){
        const newPost = {id: Date.now(), title, content, images, date: new Date()};
        posts.unshift(newPost);
        savePosts(posts);
        renderPosts();
        closeModalFunc();
        resetForm();
    }
});

// Função para limpar formulário
function resetForm(){
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImages").value = "";
}

// Inicializa
renderPosts();
