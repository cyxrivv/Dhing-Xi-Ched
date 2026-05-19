const wrapper      = document.querySelector('.wrapper');
const registerLink = document.querySelector('.register-link');
const loginLink    = document.querySelector('.login-link');

registerLink.addEventListener('click', function (e) {
    e.preventDefault();
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', function (e) {
    e.preventDefault();
    wrapper.classList.remove('active');
});