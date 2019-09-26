/* eslint-disable */
//*********IMPORTANT -  exporting modules from client side JS is different to node js */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {

    // console.log(email, password);

    try {
        //alert(JSON.stringify(obj));
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {
                // email: email,//can do it this way also
                // password: password
                email: email,
                password: password
            }

        });

        if (res.data.status === 'success'){
            window.setTimeout(() => {
                showAlert('success', 'Redirecting in 3 seconds.')
                location.assign('/');
            }, 3000);
        }

        console.log(res);
    } catch (err){
        console.log(err);
        console.log(err.response.data);//this displays the JSON error we created in the API, if 
        //a incorrect email or password is entered.
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:3000/api/v1/users/logout'
        });

        if (res.data.status === 'success'){
            location.reload(true);//to force a reload on the server and clear browser cache
        }

        console.log(res);        
    } catch(err){
        console.log(err);
        console.log(err.response.data);//this displays the JSON error we created in the API, if 
        //a incorrect email or password is entered.
        showAlert('error', 'Error while logging out please try again');
    }
}