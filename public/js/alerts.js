/* eslint-disable */
//type is either 'success' or 'error'

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}

export const showAlert = (type, msg) => {
    hideAlert();//hide any existing alerts before showing the new one
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);//hide the alter after 5 seconds have passed since displaying it
};