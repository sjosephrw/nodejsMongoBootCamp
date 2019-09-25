/* eslint-disable */

const login = async (email, password) => {

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
                alert('Redirecting in 3 seconds.')
                location.assign('/');
            }, 3000);
        }

        console.log(res);
    } catch (err){
        console.log(err);
        console.log(err.response.data);//this displays the JSON error we created in the API, if 
        //a incorrect email or password is entered.
    }
};

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login( email, password );
});