
import { supabase } from './supabase-config.js';

// ==========================================
// ÉLÉMENTS DE L'INTERFACE
// ==========================================

const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Message visible pendant la connexion
const loginMessage = document.createElement('p');
loginMessage.id = 'loginMessage';
loginForm.insertAdjacentElement('afterend', loginMessage);

// ==========================================
// RÔLES ET RESPONSABILITÉS
// ==========================================

const roles = {
  admin: 'dg',
  dg: 'dg',
  dga: 'dga',
  daf: 'daf',
  secretariat: 'secretariat'
};

const roleNames = {
  dg: 'Directeur général',
  dga: 'Directeur général adjoint',
  daf: 'Directeur administratif et financier',
  secretariat: 'Secrétariat général'
};

// ==========================================
// VÉRIFICATION DES AUTORISATIONS
// ==========================================

async function verifyUser() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, role, status')
    .eq('id', user.id)
    .single();

  if (
    error ||
    !profile ||
    profile.status !== 'active' ||
    !roles[profile.role]
  ) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    user,
    profile,
    role: roles[profile.role]
  };
}

// ==========================================
// MASQUER LES ESPACES
// ==========================================

function hideAllSpaces() {
  document.getElementById('directorDashboard').hidden = true;
  document.getElementById('deputyDashboard').hidden = true;
  document.getElementById('financeDashboard').hidden = true;
  document.getElementById('secretariatDashboard').hidden = true;
}

// ==========================================
// AFFICHAGE DU TABLEAU DE BORD
// ==========================================

async function showDashboard() {
  const access = await verifyUser();

  if (!access) {
    loginSection.hidden = false;
    dashboard.hidden = true;
    loginMessage.textContent = '';
    return;
  }

  loginSection.hidden = true;
  dashboard.hidden = false;

  hideAllSpaces();

  document.getElementById('welcomeTitle').textContent =
    'Bienvenue dans votre espace';

  document.getElementById('userName').textContent =
    access.profile.full_name || access.user.email;

  document.getElementById('userRole').textContent =
    roleNames[access.role];

  message.textContent = '';

  // ESPACE DU DIRECTEUR GÉNÉRAL

  if (access.role === 'dg') {
    document.getElementById('directorDashboard').hidden = false;

    document.getElementById('directorContent').innerHTML = `
      <h4>Vue générale du CPRIT</h4>

      <div id="directorStats" class="director-stats">
        <p>Chargement des indicateurs...</p>
      </div>

      <h4>Demandes d'inscription</h4>
      <div id="learners"></div>
    `;

    await loadDirectorStats();
    await loadLearners();
  }

  // ESPACE DU DIRECTEUR GÉNÉRAL ADJOINT

  if (access.role === 'dga') {
    document.getElementById('deputyDashboard').hidden = false;

    document.getElementById('deputyContent').innerHTML = `
      <h4>Coordination générale</h4>
      <p>
        Suivi des services, des activités pédagogiques
        et de l'exécution des orientations de la Direction générale.
      </p>
    `;
  }

  // ESPACE DU DIRECTEUR ADMINISTRATIF ET FINANCIER

  if (access.role === 'daf') {
    document.getElementById('financeDashboard').hidden = false;

    document.getElementById('financeContent').innerHTML = `
      <h4>Gestion administrative et financière</h4>
      <p>
        Espace réservé au suivi des budgets, dépenses,
        recettes et dossiers administratifs.
      </p>
    `;
  }

  // ESPACE DU SECRÉTARIAT

  if (access.role === 'secretariat') {
    document.getElementById('secretariatDashboard').hidden = false;

    document.getElementById('secretariatContent').innerHTML = `
      <h4>Gestion du secrétariat</h4>
      <p>
        Suivi des dossiers et traitement des demandes
        d'inscription des apprenants.
      </p>

      <div id="learners"></div>
    `;

    await loadLearners();
  }
}

// ==========================================
// CONNEXION
// ==========================================

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  loginMessage.textContent = 'Connexion en cours...';
  loginBtn.disabled = true;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      loginMessage.textContent =
        'Identifiants incorrects ou accès refusé.';
      return;
    }

    await showDashboard();

    if (!dashboard.hidden) {
      loginMessage.textContent = '';
    }
  } catch (error) {
    loginMessage.textContent =
      'Erreur de connexion. Veuillez réessayer.';
    console.error(error);
  } finally {
    loginBtn.disabled = false;
  }
});

// ==========================================
// INDICATEURS DU DIRECTEUR GÉNÉRAL
// ==========================================

async function loadDirectorStats() {
  const stats = document.getElementById('directorStats');

  if (!stats) return;

  stats.innerHTML = '<p>Chargement des indicateurs...</p>';

  const countProfiles = async (role, status = null) => {
    let query = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', role);

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  };

  try {
    const [
      totalLearners,
      activeLearners,
      pendingLearners,
      activeAdmin,
      activeDG,
      activeDGA,
      activeDAF,
      activeSecretariat
    ] = await Promise.all([
      countProfiles('learner'),
      countProfiles('learner', 'active'),
      countProfiles('learner', 'pending'),
      countProfiles('admin', 'active'),
      countProfiles('dg', 'active'),
      countProfiles('dga', 'active'),
      countProfiles('daf', 'active'),
      countProfiles('secretariat', 'active')
    ]);

    const totalDG = activeAdmin + activeDG;

    stats.innerHTML = `
      <div class="stat-card">
        <span>Total des apprenants</span>
        <strong>${totalLearners}</strong>
      </div>

      <div class="stat-card">
        <span>Apprenants actifs</span>
        <strong>${activeLearners}</strong>
      </div>

      <div class="stat-card">
        <span>Inscriptions en attente</span>
        <strong>${pendingLearners}</strong>
      </div>

      <div class="stat-card">
        <span>Direction générale</span>
        <strong>${totalDG}</strong>
      </div>

      <div class="stat-card">
        <span>Direction générale adjointe</span>
        <strong>${activeDGA}</strong>
      </div>

      <div class="stat-card">
        <span>Administration financière</span>
        <strong>${activeDAF}</strong>
      </div>

      <div class="stat-card">
        <span>Secrétariat</span>
        <strong>${activeSecretariat}</strong>
      </div>
    `;

  } catch (error) {
    stats.textContent =
      'Erreur de chargement des indicateurs : ' + error.message;

    console.error(error);
  }
}

// ==========================================
// CHARGEMENT DES DEMANDES D'INSCRIPTION
// ==========================================

async function loadLearners() {
  const learners = document.getElementById('learners');

  if (!learners) return;

  learners.innerHTML = '<p>Chargement des demandes...</p>';

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone, status, created_at')
    .eq('role', 'learner')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    learners.textContent =
      'Impossible de charger les demandes : ' + error.message;
    return;
  }

  if (!data || data.length === 0) {
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
    phone.textContent =
      'Téléphone : ' + (learner.phone || 'Non renseigné');

    const date = document.createElement('p');
    date.textContent =
      'Inscription : ' +
      new Date(learner.created_at).toLocaleDateString('fr-FR');

    const actions = document.createElement('div');
    actions.className = 'actions';

    const approve = document.createElement('button');
    approve.className = 'approve';
    approve.textContent = 'Approuver';

    approve.addEventListener('click', () => {
      updateLearner(learner.id, 'active');
    });

    const reject = document.createElement('button');
    reject.className = 'reject';
    reject.textContent = 'Refuser';

    reject.addEventListener('click', () => {
      updateLearner(learner.id, 'rejected');
    });

    actions.append(approve, reject);
    card.append(name, phone, date, actions);

    learners.appendChild(card);
  });
}

// ==========================================
// APPROBATION OU REFUS D'UNE INSCRIPTION
// ==========================================

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

  const stats = document.getElementById('directorStats');

  if (stats) {
    await loadDirectorStats();
  }
}

// ==========================================
// DÉCONNEXION
// ==========================================

logoutBtn.addEventListener('click', async () => {
  logoutBtn.disabled = true;

  try {
    await supabase.auth.signOut();

    loginForm.reset();
    message.textContent = '';
    loginMessage.textContent = '';

    await showDashboard();

  } finally {
    logoutBtn.disabled = false;
  }
});

// ==========================================
// INITIALISATION
// ==========================================

showDashboard();
