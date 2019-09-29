/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//type is either password or data - data is the users name and email
export const updateSettings = async (data, type) => {
    // console.log(email, password);
    try {
          const url = type === 'password'
          ? 'http://localhost:3000/api/v1/users/updateMyPassword'
          : 'http://localhost:3000/api/v1/users/updateMe';
  
          const res = await axios({
            method: 'PATCH',
            url,
            data
          });

        if (res.data.status === 'success'){
            showAlert('success', `${type.toUpperCase()} successfully changed.`);
        }

        // console.log(res);
    } catch (err){
        console.log(err);
        console.log(err.response.data);//this displays the JSON error we created in the API, if 
        //a incorrect data is entered.
        showAlert('error', err.response.data.message);
    }
};