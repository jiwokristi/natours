import axios from 'axios';

import { showAlert } from './alert.js';

export const login = async (email: string, password: string) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      showAlert('error', err.response?.data?.message ?? 'Something went wrong');
    } else {
      showAlert('error', 'Unexpected error');
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.reload();
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
