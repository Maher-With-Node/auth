import axios from 'axios';
import { showAlert } from './alerts';

export const success = async (name,email,) => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/views/success',
      data: {
        name,
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account Authenticated and logged in successfully');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
