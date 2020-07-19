const urlParams = new URLSearchParams(window.location.search);
const errorBox = document.getElementById('error-box')
const successBox = document.getElementById('success-box')

document.getElementsByClassName('form1')[0].addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter') { window.login() }
})

window.login = () => {

    errorBox.innerHTML = ''
    let xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/auth/register', true)
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        passwordConfirmation: document.getElementById('passwordConfirmation').value,
        passwordTip: document.getElementById('passwordTip').value
    }));

    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return;

        let data = JSON.parse(this.responseText);
        console.log(data)

        if (this.status !== 201) {
            return (errorBox.innerHTML = `<div>${data.message}</div>`);
        }

        successBox.innerHTML = `<div>Logged in successfully</div>`
        if (urlParams.has('redirect_url')) {
            window.location.href = urlParams.get('redirect_url') || '/static/home'
        } else {
            window.location.href = '/'
        }
    };
}
console.log('loaded')