import { supabase } from './supabase-config.js';

const form = document.getElementById('loginForm');
const message = document.getElementById('message');
const button = document.getElementById('loginButton');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  message.textContent = '';
  message.className = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  button.disabled = true;
  button.textContent = 'Connexion en cours...';

  try {
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (loginError) throw loginError;

    const user = loginData.user;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('Profil introuvable. Contactez l’administration du CPRIT.');
    }

    if (profile.role !== 'learner') {
      await supabase.auth.signOut();
      throw new Error('Cet espace est réservé aux apprenants.');
    }

    if (profile.status === 'pending') {
      await supabase.auth.signOut();
      throw new Error('Votre inscription est en attente de validation par le CPRIT.');
    }

    if (profile.status !== 'active') {
      await supabase.auth.signOut();
      throw new Error('Votre compte n’est pas actif. Contactez le CPRIT.');
    }

    window.location.href = 'espace-personnel.html';

  } catch (error) {
    message.textContent = error.message;
    message.className = 'error';
  } finally {
    button.disabled = false;
    button.textContent = 'Se connecter';
  }
});
