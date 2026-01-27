import axios from 'axios';

import { UserData } from 'models/userModel';

import { showAlert } from './alert';

export const updateSettings = async (
  data:
    | FormData
    | (Pick<UserData, 'password' | 'passwordConfirm'> & {
        passwordCurrent: string;
      }),
  type: 'data' | 'password',
) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      window.setTimeout(() => {
        location.assign('/me');
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
