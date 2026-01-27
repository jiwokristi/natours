import axios from 'axios';

import { showAlert } from './alert.js';

export const bookTour = async (tourId: string) => {
  try {
    // 1) Get checkout session from backend
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) Create checkout form + charge credit card
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.error(err);
    showAlert('error', err);
  }
};
