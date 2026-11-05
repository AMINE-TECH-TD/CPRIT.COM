import { supabase } from './supabase-config.js';

const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const learners = document.getElementById('learners');
const message = document.getElementById('message');

async function verifyAdmin() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (error || data.role !== 'admin' || data.status !== 'active') {
    await supabase.auth.signOut();
    return false;
  }

  return true;
}

async function showDashboard() {
  const valid = await verifyAdmin();

  if (!valid) {
    loginSection.hidden = false;
    dashboard.hidden = true;
    return;
  }

  loginSection.hidden = true;
  dashboard.hidden = false;

  await loadLearners();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  message.textContent = 'Connexion en cours...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    message.textContent = 'Erreur : ' + error.message;
    return;
  }

  await showDashboard();
});

async function loadLearners() {
  learners.innerHTML = '<p>Chargement...</p>';

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, status, created_at')
    .eq('role', 'learner')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    learners.textContent = 'Erreur de chargement : ' + error.message;
    return;
  }

  if (!data.length) {
    learners.innerHTML = '<p>Aucune demande en attente.</p>';
    return;
  }

  learners.innerHTML = '';

  data.forEach((learner) => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const name = document.createElement('h3');
    name.textContent = learner.full_name || 'Nom non renseigné';

    const phone = document.createElement('p');
    phone.textContent = 'Téléphone : ' + (learner.phone || 'Non renseigné');

    const date = document.createElement('p');
    date.textContent = 'Inscription : ' +
      new Date(learner.created_at).toLocaleString('fr-FR');

    const actions = document.createElement('div');
    actions.className = 'actions';

    const approve = document.createElement('button');
    approve.className = 'approve';
    approve.textContent = 'Approuver';
    approve.addEventListener('click', () =>
      updateLearner(learner.id, 'active')
    );

    const reject = document.createElement('button');
    reject.className = 'reject';
    reject.textContent = 'Refuser';
    reject.addEventListener('click', () =>
      updateLearner(learner.id, 'rejected')
    );

    actions.append(approve, reject);
    card.append(name, phone, date, actions);
    learners.appendChild(card);
  });
}

async function updateLearner(id, status) {
  const action = status === 'active' ? 'approuver' : 'refuser';

  if (!confirm('Voulez-vous vraiment ' + action + ' cette inscription ?')) {
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .eq('status', 'pending');

  if (error) {
    message.textContent = 'Erreur : ' + error.message;
    return;
  }

  message.textContent = 'Décision enregistrée.';
  await loadLearners();
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  loginForm.reset();
  message.textContent = '';
  await showDashboard();
});

showDashboard();
