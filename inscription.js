
import { supabase } from './supabase-config.js';

const form = document.getElementById('registerForm');
const message = document.getElementById('message');
const button = document.getElementById('submitButton');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  message.textContent = '';
  message.className = '';

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    message.textContent = 'Les deux mots de passe ne correspondent pas.';
    message.className = 'error';
    return;
  }

  if (password.length < 8) {
    message.textContent = 'Le mot de passe doit contenir au moins 8 caractères.';
    message.className = 'error';
    return;
  }

  button.disabled = true;
  button.textContent = 'Envoi en cours...';

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) throw error;

    message.className = 'success';

    if (data.session) {
      message.textContent =
        'Votre demande a été envoyée. Votre compte est en attente de validation par le CPRIT.';
    } else {
      message.textContent =
        'Votre inscription a été enregistrée. Consultez votre boîte e-mail pour confirmer votre adresse. Votre compte restera en attente de validation par le CPRIT.';
    }

    form.reset();

  } catch (error) {
    message.className = 'error';
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = 'Envoyer ma demande';
  }
});
