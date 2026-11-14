
import { supabase } from './supabase-config.js';

const learnerName = document.getElementById('learnerName');
const learnerEmail = document.getElementById('learnerEmail');
const welcomeMessage = document.getElementById('welcomeMessage');
const logoutButton = document.getElementById('logoutButton');

async function loadLearnerSpace() {
  try {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      window.location.replace('connexion.html');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile ||
        profile.role !== 'learner' ||
        profile.status !== 'active') {
      await supabase.auth.signOut();
      window.location.replace('connexion.html');
      return;
    }

    const name = profile.full_name || 'Apprenant';

    learnerName.textContent = name;
    learnerEmail.textContent = user.email || '';
    welcomeMessage.textContent = 'Heureux de vous accueillir, ' + name + '. Votre espace de formation est prêt.';

  } catch (error) {
    welcomeMessage.textContent = 'Impossible de charger votre espace. Veuillez vous reconnecter.';
    console.error(error);
  }
}

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = 'Déconnexion...';

  await supabase.auth.signOut();
  window.location.replace('connexion.html');
});

loadLearnerSpace();
