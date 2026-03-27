// Azure Static Web Apps Authentication
async function getUser() {
  try {
    var response = await fetch('/.auth/me');
    if (!response.ok) return null;
    var data = await response.json();
    return (data && data.clientPrincipal) ? data.clientPrincipal : null;
  } catch (e) {
    return null;
  }
}

function renderAuth(user) {
  var authArea = document.getElementById('authArea');
  if (!authArea) return;

  if (user) {
    var displayName = user.userDetails || user.userId || 'משתמש';
    authArea.innerHTML =
      '<span class="auth-user-info">' +
        '<span class="user-name">שלום, ' + displayName + '</span>' +
      '</span>' +
      '<a href="/.auth/logout" class="btn-auth btn-logout">התנתק</a>';
  } else {
    authArea.innerHTML =
      '<span class="auth-user-info">לא מחובר</span>' +
      '<a href="/.auth/login/google" class="btn-auth btn-login">התחבר עם Google</a>';
  }
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
  // Load auth state
  getUser().then(renderAuth);

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
