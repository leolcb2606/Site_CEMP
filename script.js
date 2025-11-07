
        // JavaScript para o carrossel principal
        document.addEventListener('DOMContentLoaded', function() {
            // Carrossel principal
            const mainSlides = document.querySelector('.main-carousel-slides');
            const mainDots = document.querySelectorAll('.main-carousel-dot');
            let currentMainSlide = 0;
            const mainSlideCount = document.querySelectorAll('.main-carousel-slide').length;
            
            function goToMainSlide(n) {
                currentMainSlide = (n + mainSlideCount) % mainSlideCount;
                mainSlides.style.transform = `translateX(-${currentMainSlide * 33.33}%)`;
                
                mainDots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentMainSlide);
                });
            }
            
            mainDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    goToMainSlide(index);
                });
            });
            
            let mainSlideInterval = setInterval(() => {
                goToMainSlide(currentMainSlide + 1);
            }, 5000);
            
            const mainCarousel = document.querySelector('.main-carousel');
            mainCarousel.addEventListener('mouseenter', () => {
                clearInterval(mainSlideInterval);
            });
            
            mainCarousel.addEventListener('mouseleave', () => {
                mainSlideInterval = setInterval(() => {
                    goToMainSlide(currentMainSlide + 1);
                }, 5000);
            });
            
            // Carrossel de cursos
            const track = document.querySelector('.courses-track');
            const courseCards = document.querySelectorAll('.course-card');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            let currentIndex = 0;
            
            // Calcular a largura total de um card (incluindo margens)
            const cardStyle = getComputedStyle(courseCards[0]);
            const cardWidth = courseCards[0].offsetWidth + 
                             parseInt(cardStyle.marginLeft) + 
                             parseInt(cardStyle.marginRight);
            
            function moveCarousel() {
                track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            }
            
            nextBtn.addEventListener('click', () => {
                if (currentIndex < courseCards.length - 1) {
                    currentIndex++;
                    moveCarousel();
                }
            });
            
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    moveCarousel();
                }
            });
            
            // Menu mobile
            const btnMenu = document.querySelector('.btn-menu');
            const nav = document.querySelector('nav');
            
            btnMenu.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        });
    
        // pop up 

        // Exibir popup após 2 segundos
window.addEventListener("load", () => {
    setTimeout(() => {
        const popup = document.getElementById("promoPopup");
        popup.style.display = "flex";
        popup.classList.add("show");
    }, 2000);
});

// Fechar popup
document.querySelector(".popup-close").addEventListener("click", () => {
    document.getElementById("promoPopup").style.display = "none";
});

// Abrir WhatsApp
function openWhatsApp(){
    const phone = "5511999999999"; // substitua pelo número desejado
    const message = "Olá! Tenho interesse na promoção.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

// teste carrossel 

const images = document.querySelectorAll('.carousel-img');
let current = 0;

function nextImage() {
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
}

// Troca a imagem a cada 3 segundos
setInterval(nextImage, 3000);
