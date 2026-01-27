import '@babel/polyfill';

import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';
import { displayMap } from './mapBox.js';
import { bookTour } from './stripe.js';

// DOM Elements
const mapBox = document.getElementById('map') as HTMLDivElement;
const loginForm = document.querySelector('.form--login') as HTMLFormElement;
const logoutBtn = document.querySelector(
  '.nav__el--logout',
) as HTMLButtonElement;
const userDataForm = document.querySelector(
  '.form-user-data',
) as HTMLFormElement;
const userPasswordForm = document.querySelector(
  '.form-user-settings',
) as HTMLFormElement;
const fileTag = document.querySelector('#photo') as HTMLInputElement;
const preview = document.querySelector('.form__user-photo') as HTMLImageElement;
const bookBtn = document.getElementById('book-tour') as HTMLButtonElement;

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations as string);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;

    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();
    form.append(
      'name',
      (document.getElementById('name') as HTMLInputElement).value,
    );
    form.append(
      'email',
      (document.getElementById('email') as HTMLInputElement).value,
    );
    const photoInput = document.getElementById(
      'photo',
    ) as HTMLInputElement | null;

    if (photoInput?.files?.[0]) {
      form.append('photo', photoInput.files[0]);
    }

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();

    const savePasswordButton = document.querySelector(
      '.btn--save-password',
    ) as HTMLButtonElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const passwordCurrent = document.getElementById(
      'password-current',
    ) as HTMLInputElement;
    const passwordConfirm = document.getElementById(
      'password-confirm',
    ) as HTMLInputElement;

    savePasswordButton.textContent = 'Updating...';

    await updateSettings(
      {
        password: password.value,
        passwordCurrent: passwordCurrent.value,
        passwordConfirm: passwordConfirm.value,
      },
      'password',
    );

    savePasswordButton.textContent = 'Save password';
    password.value = '';
    passwordCurrent.value = '';
    passwordConfirm.value = '';
  });
}

const readURL = (input: HTMLInputElement) => {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      preview.setAttribute('src', e.target?.result as string);
    };

    reader.readAsDataURL(input.files[0]);
  }
};

if (fileTag && preview) {
  fileTag.addEventListener('change', function () {
    readURL(this);
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    const btn = e.currentTarget as HTMLButtonElement;

    btn.textContent = 'Processing...';
    const { tourId } = btn.dataset;
    bookTour(tourId as string);
  });
}
