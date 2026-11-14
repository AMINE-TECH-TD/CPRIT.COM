
import { supabase } from './supabase-config.js';

const form = document.getElementById('personnelForm');
const message = document.getElementById('message');
const button = document.getElementById('loginButton');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  button.disabled = true;
  message.textContent = 'Vérification de vos accès...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (loginError) {
      message.textContent = 'Identifiants incorrects ou connexion impossible.';
      return;
    }

    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Impossible de vérifier votre compte.');
    }

    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single();

    if (
      profileError ||
      !profile ||
      profile.role !== 'admin' ||
      profile.status !== 'active'
    ) {
      await supabase.auth.signOut();
      message.textContent =
        'Accès refusé. Votre compte ne possède pas les autorisations nécessaires.';
      return;
    }

    window.location.href = 'Admin.html';

  } catch (error) {
    message.textContent =
      'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    button.disabled = false;
  }
});
