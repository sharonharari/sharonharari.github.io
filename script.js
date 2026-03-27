// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');

  menuToggle.addEventListener('click', function () {
    nav.classList.toggle('active');
  });

  // Close menu when clicking a nav link
  document.querySelectorAll('.nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('active');
    });
  });

  // Contact form handler
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.');
      form.reset();
    });
  }

  // Header shadow on scroll
  var header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.12)';
    } else {
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
    }
  });
});
