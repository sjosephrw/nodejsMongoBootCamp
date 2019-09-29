/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_LstEyN0gzeApEwMWQpyhAiYS00niBQu1Hn');

export const bookTour = async (tourId) => {

    try {

        //get checkout session from API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);

        //Create checkout form charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id//this is in the axios response
        });

        // console.log(session);

    } catch (err){
        console.log(err);
        showAlert('error', err);
    }


} 