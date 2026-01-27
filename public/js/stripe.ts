import axios from 'axios';

import { showAlert } from './alert';

export const bookTour = async (tourId: string) => {
  try {
    // 1) Get checkout session from backend
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) Create checkout form + charge credit card
    window.location.replace(session.data.session.url);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      showAlert('error', err.response?.data?.message ?? 'Something went wrong');
    } else {
      showAlert('error', 'Unexpected error');
    }
  }
};
