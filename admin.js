
import { supabase } from './supabase-config.js';

// ==========================================
// ÉLÉMENTS
// ==========================================

const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const loginMessage = document.createElement('p');
loginMessage.id = 'loginMessage';
loginForm.insertAdjacentElement('afterend', loginMessage);

// ==========================================
// RÔLES
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
// VÉRIFICATION UTILISATEUR
// ==========================================

async function verifyUser() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

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
// TABLEAU DE BORD
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

  if (access.role === 'dg') {
    document.getElementById('directorDashboard').hidden = false;

    document.getElementById('directorContent').innerHTML = `
      <h4>Vue générale du CPRIT</h4>

      <div id="directorStats" class="director-stats">
        <p>Chargement des indicateurs...</p>
      </div>

      <hr>

      <h4>Gestion du personnel de direction</h4>

      <form id="staffForm">
        <input id="staffName" type="text"
          placeholder="Nom complet" required>

        <input id="staffEmail" type="email"
          placeholder="Adresse e-mail professionnelle" required>

        <input id="staffPhone" type="tel"
          placeholder="Téléphone">

        <input id="staffPassword" type="password"
          placeholder="Mot de passe provisoire (8 caractères minimum)"
          minlength="8" required>

        <select id="staffRole" required>
          <option value="">Choisir une fonction</option>
          <option value="dga">Directeur général adjoint</option>
          <option value="daf">Directeur administratif et financier</option>
          <option value="secretariat">Secrétariat général</option>
        </select>

        <button id="createStaffBtn" type="submit">
          Créer le compte
        </button>
      </form>

      <p id="staffMessage"></p>

      <h4>Personnel enregistré</h4>
      <div id="staffList">Chargement du personnel...</div>

      <hr>

      <h4>Demandes d'inscription</h4>
      <div id="learners"></div>
    `;

    document.getElementById('staffForm')
      .addEventListener('submit', createStaff);

    await loadDirectorStats();
    await loadStaff();
    await loadLearners();
  }

  if (access.role === 'dga') {
    document.getElementById('deputyDashboard').hidden = false;

    document.getElementById('deputyContent').innerHTML = `
      <h4>Coordination générale</h4>
      <p>Suivi des services et des activités pédagogiques.</p>
    `;
  }

  if (access.role === 'daf') {
    document.getElementById('financeDashboard').hidden = false;

    document.getElementById('financeContent').innerHTML = `
      <h4>Gestion administrative et financière</h4>
      <p>Suivi des budgets, dépenses, recettes et dossiers administratifs.</p>
    `;
  }

  if (access.role === 'secretariat') {
    document.getElementById('secretariatDashboard').hidden = false;

    document.getElementById('secretariatContent').innerHTML = `
      <h4>Gestion du secrétariat</h4>
      <p>Suivi des dossiers et des demandes d'inscription.</p>
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
    loginMessage.textContent = 'Erreur de connexion.';
    console.error(error);
  } finally {
    loginBtn.disabled = false;
  }
});

// ==========================================
// INDICATEURS DG
// ==========================================

async function loadDirectorStats() {
  const stats = document.getElementById('directorStats');
  if (!stats) return;

  const countProfiles = async (role, status = null) => {
    let query = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', role);

    if (status) query = query.eq('status', status);

    const { count, error } = await query;

    if (error) throw error;

    return count || 0;
  };

  try {
    const [
      totalLearners,
      activeLearners,
      pendingLearners,
      admin,
      dg,
      dga,
      daf,
      secretariat
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
        <strong>${admin + dg}</strong>
      </div>

      <div class="stat-card">
        <span>DGA</span>
        <strong>${dga}</strong>
      </div>

      <div class="stat-card">
        <span>DAF</span>
        <strong>${daf}</strong>
      </div>

      <div class="stat-card">
        <span>Secrétariat</span>
        <strong>${secretariat}</strong>
      </div>
    `;
  } catch (error) {
    stats.textContent = 'Erreur : ' + error.message;
  }
}

// ==========================================
// CRÉATION DU PERSONNEL
// ==========================================

async function createStaff(event) {
  event.preventDefault();

  const form = document.getElementById('staffForm');
  const button = document.getElementById('createStaffBtn');
  const result = document.getElementById('staffMessage');

  button.disabled = true;
  button.textContent = 'Création en cours...';
  result.textContent = '';

  const staff = {
    full_name: document.getElementById('staffName').value.trim(),
    email: document.getElementById('staffEmail').value.trim(),
    phone: document.getElementById('staffPhone').value.trim(),
    password: document.getElementById('staffPassword').value,
    role: document.getElementById('staffRole').value
  };

  try {
    const { data, error } = await supabase.functions.invoke(
      'creer-personnel',
      { body: staff }
    );

    if (error) throw error;

    if (!data || !data.success) {
      throw new Error(data?.error || 'Création impossible.');
    }

    result.textContent = 'Compte créé avec succès.';
    result.style.color = '#087844';

    form.reset();

    await loadStaff();
    await loadDirectorStats();

  } catch (error) {
    result.textContent =
      error.message || 'Erreur lors de la création du compte.';

    result.style.color = '#b52d2d';
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = 'Créer le compte';
  }
}

// ==========================================
// LISTE DU PERSONNEL
// ==========================================

async function loadStaff() {
  const staffList = document.getElementById('staffList');
  if (!staffList) return;

  staffList.textContent = 'Chargement...';

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone, role, status, created_at')
    .in('role', ['admin', 'dg', 'dga', 'daf', 'secretariat'])
    .order('created_at', { ascending: true });

  if (error) {
    staffList.textContent =
      'Erreur de chargement : ' + error.message;
    return;
  }

  if (!data || data.length === 0) {
    staffList.textContent = 'Aucun membre du personnel enregistré.';
    return;
  }

  staffList.innerHTML = '';

  data.forEach((person) => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const name = document.createElement('h3');
    name.textContent = person.full_name || 'Nom non renseigné';

    const role = document.createElement('p');
    role.textContent =
      'Fonction : ' + (roleNames[roles[person.role]] || person.role);

    const phone = document.createElement('p');
    phone.textContent =
      'Téléphone : ' + (person.phone || 'Non renseigné');

    const status = document.createElement('p');
    status.textContent =
      'Statut : ' + person.status;

    card.append(name, role, phone, status);
    staffList.appendChild(card);
  });
}

// ==========================================
// DEMANDES D'INSCRIPTION
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
    learners.textContent = 'Erreur : ' + error.message;
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
// APPROBATION / REFUS
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

  if (document.getElementById('directorStats')) {
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
