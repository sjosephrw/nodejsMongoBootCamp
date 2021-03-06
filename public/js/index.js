/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { format } from 'util';
import { bookTour } from './stripe';

// console.log('Hello from parcel!');

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logOutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');

//VALUES
//the values below can not be placed here there was a error
// const email = document.getElementById('email').value;
// const password = document.getElementById('password').value;

//DELEGATION
//without the if statement on pages that did not have the map id div errors were being displayed.
//we will be adding if statements for the other elements as well.
if (mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);//because the locations are in the data-locations attribute value
    displayMap(locations);
}

if (loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login( email, password );
    });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);


if (userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();

        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);//files is a array and since there is only 1 photo [0]
        // console.log(form);
        // const name = document.getElementById('name').value;
        // const email = document.getElementById('email').value;

        // updateSettings({ name, email }, 'data');
        updateSettings(form, 'data');

    });
}

if (userPasswordForm){
    userPasswordForm.addEventListener('submit', async e => {//NOTE ASYNC FUNCTION
        e.preventDefault();

        document.querySelector('.btn--save-password').textContent = 'Updating...';
        
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
        //await updateSettings and then clear the password text fields
        
        document.querySelector('.btn--save-password').textContent = 'Save password.';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn){
    bookBtn.addEventListener('click', e => {

        e.target.textContent = '...PROCESSING'
    //    const tourId =  e.target.dataset.tourId;
       const { tourId } =  e.target.dataset;
       bookTour(tourId);
    });
}