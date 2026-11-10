
(function () {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        window.location.replace('/login/login.html');
    }
})();
