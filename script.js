// В файле script.js пишем:

// 1. Плавный скролл по клику на навигацию
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// 2. Эффект при наведении на шаги
const steps = document.querySelectorAll('.step');
steps.forEach(step => {
    step.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(61, 0, 0, 0.3)';
    });
    
    step.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '';
    });
});

// 3. Эффект для подписей на фото
const labels = document.querySelectorAll('.label');
labels.forEach(label => {
    label.addEventListener('click', function() {
        this.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 300);
    });
});

// 4. Простая анимация появления секций
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за всеми секциями
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(section);
});