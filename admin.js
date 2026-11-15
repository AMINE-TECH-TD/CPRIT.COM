
import { supabase } from './supabase-config.js';

const loginSection = document.getElementById('loginSection');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

const loginMessage = document.createElement('p');
loginMessage.id = 'loginMessage';
loginForm.insertAdjacentElement('afterend', loginMessage);

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

let currentContent = null;

function money(value) {
  return Number(value || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 0
  }) + ' FCFA';
}

// CONNEXION ET VÉRIFICATION DU PROFIL

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

function hideAllSpaces() {
  document.getElementById('directorDashboard').hidden = true;
  document.getElementById('deputyDashboard').hidden = true;
  document.getElementById('financeDashboard').hidden = true;
  document.getElementById('secretariatDashboard').hidden = true;
}

// TABLEAU DE BORD DG ET DGA

function dashboardTemplate(isDga = false) {
  if (isDga) {
    return `
      <section class="dg-header">
        <div>
          <p class="dg-eyebrow">DIRECTION GÉNÉRALE ADJOINTE</p>
          <h2>Tableau de bord du DGA</h2>
          <p>Coordination et suivi des services et activités du CPRIT.</p>
        </div>
        <button type="button" id="refreshDirector">
          Actualiser les données
        </button>
      </section>

      <section class="dg-section">
        <h3>Coordination générale</h3>
        <p>
          Coordination des services, suivi des activités pédagogiques,
          accompagnement des responsables et suivi des décisions.
        </p>
      </section>

      <section class="dg-section">
        <h3>Enregistrer une activité</h3>
        <form id="activityForm">
          <label for="activityTitle">Titre de l'activité</label>
          <input id="activityTitle" type="text"
            placeholder="Titre de l'activité" required>

          <label for="activityService">Service concerné</label>
          <input id="activityService" type="text"
            placeholder="Exemple : Service pédagogique" required>

          <label for="activityType">Type d'activité</label>
          <input id="activityType" type="text"
            placeholder="Exemple : Réunion, formation, suivi" required>

          <label for="activityDescription">Description</label>
          <textarea id="activityDescription"
            placeholder="Description et observations"></textarea>

          <label for="activityDueDate">Date d'échéance</label>
          <input id="activityDueDate" type="date">

          <label for="activityStatus">État de l'activité</label>
          <select id="activityStatus" required>
            <option value="planned">Planifiée</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminée</option>
            <option value="cancelled">Annulée</option>
          </select>

          <button id="saveActivityBtn" type="submit">
            Enregistrer l'activité
          </button>
        </form>
        <p id="activityMessage" role="status"></p>
      </section>

      <section class="dg-section">
        <h3>Suivi des activités</h3>
        <div id="coordinationActivityList">
          Chargement des activités...
        </div>
      </section>
    `;
  }

  return `
    <section class="dg-header">
      <div>
        <p class="dg-eyebrow">DIRECTION GÉNÉRALE</p>
        <h2>Tableau de bord du DG</h2>
        <p>
          Pilotage et suivi du Centre pédagogique régional de l'ICESCO au Tchad.
        </p>
      </div>
      <button type="button" id="refreshDirector">
        Actualiser les données
      </button>
    </section>

    <section class="dg-section">
      <h3>Vue générale du CPRIT</h3>
      <div id="directorStats" class="director-stats">
        Chargement des indicateurs...
      </div>
    </section>

    <section class="dg-section">
      <h3>Situation financière du CPRIT</h3>
      <p>
        Consultation des budgets et des opérations financières.
        Les modifications restent réservées au DAF.
      </p>

      <button type="button" id="refreshDirectorFinance">
        Actualiser la situation financière
      </button>

      <div id="directorFinanceMessage" role="status"></div>

      <h4>Indicateurs financiers de l'année en cours</h4>
      <div id="directorFinanceStats" class="director-stats">
        Chargement des données financières...
      </div>

      <h4>Budgets annuels</h4>
      <div id="directorBudgetList">
        Chargement des budgets...
      </div>

      <h4>Historique de toutes les opérations</h4>
      <div id="directorTransactionList">
        Chargement des opérations...
      </div>
    </section>

    <section class="dg-section">
      <h3>Gestion du personnel de direction</h3>
      <p>Créer les comptes des responsables et suivre le personnel enregistré.</p>

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
      <p id="staffMessage" role="status"></p>
    </section>

    <section class="dg-section">
      <h3>Personnel de direction</h3>
      <div id="staffList">Chargement du personnel...</div>
    </section>

    <section class="dg-section">
      <h3>Demandes d'inscription</h3>
      <p>Consulter les demandes en attente et prendre une décision.</p>
      <div id="learners">Chargement des demandes...</div>
    </section>
  `;
}

// TABLEAU DE BORD DAF

function financeTemplate() {
  return `
    <section class="dg-header">
      <div>
        <p class="dg-eyebrow">DIRECTION ADMINISTRATIVE ET FINANCIÈRE</p>
        <h2>Tableau de bord du DAF</h2>
        <p>Gestion et suivi des finances du CPRIT.</p>
      </div>
      <button type="button" id="refreshFinance">
        Actualiser les données
      </button>
    </section>

    <section class="dg-section">
      <h3>Synthèse financière</h3>
      <div class="director-stats" id="financeStats">
        Chargement des données financières...
      </div>
    </section>

    <section class="dg-section">
      <h3>Budget annuel</h3>
      <form id="budgetForm">
        <label for="budgetYear">Année budgétaire</label>
        <input id="budgetYear" type="number"
          min="2020" max="2100" required>

        <label for="budgetAmount">Montant du budget (FCFA)</label>
        <input id="budgetAmount" type="number"
          min="0" step="1" placeholder="Exemple : 5000000" required>

        <label for="budgetNotes">Observations</label>
        <textarea id="budgetNotes"
          placeholder="Notes sur le budget annuel"></textarea>

        <button id="saveBudgetBtn" type="submit">
          Enregistrer le budget
        </button>
      </form>
      <p id="budgetMessage" role="status"></p>
    </section>

    <section class="dg-section">
      <h3>Enregistrer une opération</h3>
      <form id="transactionForm">
        <label for="transactionType">Type d'opération</label>
        <select id="transactionType" required>
          <option value="">Choisir une opération</option>
          <option value="recette">Recette</option>
          <option value="depense">Dépense</option>
        </select>

        <label for="transactionAmount">Montant (FCFA)</label>
        <input id="transactionAmount" type="number"
          min="1" step="1" placeholder="Montant" required>

        <label for="transactionCategory">Catégorie</label>
        <input id="transactionCategory" type="text"
          placeholder="Exemple : Formation, fournitures, transport" required>

        <label for="transactionDescription">Description</label>
        <textarea id="transactionDescription"
          placeholder="Détails de l'opération" required></textarea>

        <label for="transactionDate">Date de l'opération</label>
        <input id="transactionDate" type="date" required>

        <button id="saveTransactionBtn" type="submit">
          Enregistrer l'opération
        </button>
      </form>
      <p id="transactionMessage" role="status"></p>
    </section>

    <section class="dg-section">
      <h3>Historique des opérations</h3>
      <div id="transactionList">Chargement de l'historique...</div>
    </section>
  `;
}

// AFFICHAGE DES ESPACES

async function showDashboard() {
  const access = await verifyUser();

  if (!access) {
    loginSection.hidden = false;
    dashboard.hidden = true;
    loginMessage.textContent = '';
    currentContent = null;
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

  if (access.role === 'dg' || access.role === 'dga') {
    const isDga = access.role === 'dga';

    const dashboardId = isDga
      ? 'deputyDashboard'
      : 'directorDashboard';

    const contentId = isDga
      ? 'deputyContent'
      : 'directorContent';

    document.getElementById(dashboardId).hidden = false;

    currentContent = document.getElementById(contentId);
    currentContent.innerHTML = dashboardTemplate(isDga);
    currentContent.onclick = handleDashboardClick;

    if (isDga) {
      document.getElementById('activityForm')
        .addEventListener('submit', createCoordinationActivity);

      await loadCoordinationActivities();
    } else {
      document.getElementById('staffForm')
        .addEventListener('submit', createStaff);

      await refreshDirectorDashboard();
    }
  }

  if (access.role === 'daf') {
    document.getElementById('financeDashboard').hidden = false;

    currentContent = document.getElementById('financeContent');
    currentContent.innerHTML = financeTemplate();

    document.getElementById('refreshFinance')
      .addEventListener('click', loadFinanceDashboard);

    document.getElementById('budgetForm')
      .addEventListener('submit', saveBudget);

    document.getElementById('transactionForm')
      .addEventListener('submit', saveTransaction);

    document.getElementById('budgetYear').value =
      new Date().getFullYear();

    document.getElementById('transactionDate').value =
      new Date().toISOString().slice(0, 10);

    await loadFinanceDashboard();
  }

  if (access.role === 'secretariat') {
    document.getElementById('secretariatDashboard').hidden = false;

    currentContent = document.getElementById('secretariatContent');

    currentContent.innerHTML = `
      <h3>Gestion du secrétariat général</h3>
      <p>Suivi des dossiers et des demandes d'inscription.</p>
      <div id="learners">Chargement des demandes...</div>
    `;

    await loadLearners();
  }
}

// GESTION DES CLICS DG ET DGA

function handleDashboardClick(event) {
  const refreshButton = event.target.closest('#refreshDirector');

  if (refreshButton) {
    event.preventDefault();

    if (document.getElementById('activityForm')) {
      loadCoordinationActivities();
    } else {
      refreshDirectorDashboard();
    }
    return;
  }

  const financeButton = event.target.closest('#refreshDirectorFinance');

  if (financeButton) {
    event.preventDefault();
    loadDirectorFinance();
    return;
  }

  const updateButton = event.target.closest('.update-activity');

  if (updateButton) {
    event.preventDefault();

    const id = updateButton.dataset.id;
    const select = document.getElementById('status-' + id);

    if (select) {
      updateCoordinationActivity(id, select.value);
    }
  }
}

// ACTUALISATION DG

async function refreshDirectorDashboard() {
  const button = document.getElementById('refreshDirector');

  if (button) {
    button.disabled = true;
    button.textContent = 'Actualisation en cours...';
  }

  message.textContent = 'Actualisation des données...';

  try {
    await loadDirectorStats();
    await loadStaff();
    await loadLearners();
    await loadDirectorFinance();

    message.textContent = 'Actualisation terminée avec succès.';
    message.style.color = '#087844';
  } catch (error) {
    message.textContent = 'Erreur : ' + error.message;
    message.style.color = '#b52d2d';
    console.error(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Actualiser les données';
    }
  }
}

// STATISTIQUES DG

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
      <span>Secrétariat général</span>
      <strong>${secretariat}</strong>
    </div>
  `;
}

// SITUATION FINANCIÈRE DG : CONSULTATION UNIQUEMENT

async function loadDirectorFinance() {
  const stats = document.getElementById('directorFinanceStats');
  const budgetList = document.getElementById('directorBudgetList');
  const transactionList = document.getElementById('directorTransactionList');
  const result = document.getElementById('directorFinanceMessage');
  const button = document.getElementById('refreshDirectorFinance');

  if (!stats || !budgetList || !transactionList) return;

  if (button) {
    button.disabled = true;
    button.textContent = 'Chargement...';
  }

  stats.textContent = 'Chargement des données financières...';
  budgetList.textContent = 'Chargement des budgets...';
  transactionList.textContent = 'Chargement des opérations...';

  try {
    const [
      { data: budgets, error: budgetError },
      { data: transactions, error: transactionError }
    ] = await Promise.all([
      supabase
        .from('financial_budgets')
        .select('*')
        .order('budget_year', { ascending: false }),

      supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
    ]);

    if (budgetError) throw budgetError;
    if (transactionError) throw transactionError;

    const currentYear = new Date().getFullYear();

    const currentTransactions = (transactions || []).filter(item =>
      String(item.transaction_date || '').startsWith(String(currentYear))
    );

    const recettes = currentTransactions
      .filter(item => item.transaction_type === 'recette')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const depenses = currentTransactions
      .filter(item => item.transaction_type === 'depense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const currentBudget = (budgets || []).find(item =>
      Number(item.budget_year) === currentYear
    );

    const budgetAmount = Number(currentBudget?.amount || 0);

    stats.innerHTML = `
      <div class="stat-card">
        <span>Recettes ${currentYear}</span>
        <strong>${money(recettes)}</strong>
      </div>
      <div class="stat-card">
        <span>Dépenses ${currentYear}</span>
        <strong>${money(depenses)}</strong>
      </div>
      <div class="stat-card">
        <span>Solde des opérations</span>
        <strong>${money(recettes - depenses)}</strong>
      </div>
      <div class="stat-card">
        <span>Budget annuel ${currentYear}</span>
        <strong>${money(budgetAmount)}</strong>
      </div>
      <div class="stat-card">
        <span>Budget restant après dépenses</span>
        <strong>${money(budgetAmount - depenses)}</strong>
      </div>
      <div class="stat-card">
        <span>Nombre total d'opérations</span>
        <strong>${(transactions || []).length}</strong>
      </div>
    `;

    displayDirectorBudgets(budgets || []);
    displayDirectorTransactions(transactions || []);

    if (result) {
      result.textContent = 'Situation financière actualisée.';
      result.style.color = '#087844';
    }
  } catch (error) {
    stats.textContent = 'Impossible de charger les indicateurs financiers.';
    budgetList.textContent = 'Erreur : ' + error.message;
    transactionList.textContent = 'Erreur : ' + error.message;

    if (result) {
      result.textContent =
        'Accès financier non autorisé ou erreur : ' + error.message;
      result.style.color = '#b52d2d';
    }

    console.error('Erreur finance DG :', error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = 'Actualiser la situation financière';
    }
  }
}

// BUDGETS VISIBLES PAR LE DG

function displayDirectorBudgets(budgets) {
  const list = document.getElementById('directorBudgetList');
  if (!list) return;

  list.innerHTML = '';

  if (!budgets.length) {
    list.textContent = 'Aucun budget enregistré.';
    return;
  }

  budgets.forEach(budget => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const title = document.createElement('h3');
    title.textContent = 'Budget annuel ' + budget.budget_year;

    const amount = document.createElement('p');
    amount.textContent = 'Montant : ' + money(budget.amount);

    const notes = document.createElement('p');
    notes.textContent = 'Observations : ' + (budget.notes || 'Aucune');

    card.append(title, amount, notes);
    list.appendChild(card);
  });
}

// OPÉRATIONS VISIBLES PAR LE DG

function displayDirectorTransactions(transactions) {
  const list = document.getElementById('directorTransactionList');
  if (!list) return;

  list.innerHTML = '';

  if (!transactions.length) {
    list.textContent = 'Aucune opération financière enregistrée.';
    return;
  }

  transactions.forEach(item => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const title = document.createElement('h3');
    title.textContent =
      item.transaction_type === 'recette' ? 'RECETTE' : 'DÉPENSE';

    const amount = document.createElement('p');
    amount.textContent = 'Montant : ' + money(item.amount);

    const category = document.createElement('p');
    category.textContent = 'Catégorie : ' + (item.category || 'Non précisée');

    const description = document.createElement('p');
    description.textContent =
      'Description : ' + (item.description || 'Aucune');

    const date = document.createElement('p');
    date.textContent = 'Date : ' + (
      item.transaction_date
        ? new Date(item.transaction_date + 'T00:00:00')
            .toLocaleDateString('fr-FR')
        : 'Non précisée'
    );

    card.append(title, amount, category, description, date);
    list.appendChild(card);
  });
}

// CRÉATION DU PERSONNEL PAR LE DG

async function createStaff(event) {
  event.preventDefault();

  const button = document.getElementById('createStaffBtn');
  const result = document.getElementById('staffMessage');
  const form = document.getElementById('staffForm');

  button.disabled = true;
  result.textContent = 'Création en cours...';

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

    result.textContent = data.message || 'Compte créé avec succès.';
    result.style.color = '#087844';

    form.reset();
    await loadStaff();
    await loadDirectorStats();
  } catch (error) {
    result.textContent = 'Échec : ' + error.message;
    result.style.color = '#b52d2d';
  } finally {
    button.disabled = false;
  }
}

// LISTE DU PERSONNEL

async function loadStaff() {
  const staffList = document.getElementById('staffList');
  if (!staffList) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone, role, status, created_at')
    .in('role', ['admin', 'dg', 'dga', 'daf', 'secretariat'])
    .order('created_at', { ascending: true });

  if (error) throw error;

  staffList.innerHTML = '';

  if (!data || data.length === 0) {
    staffList.textContent = 'Aucun membre du personnel enregistré.';
    return;
  }

  data.forEach(person => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const name = document.createElement('h3');
    name.textContent = person.full_name || 'Nom non renseigné';

    const role = document.createElement('p');
    role.textContent = 'Fonction : ' +
      (roleNames[roles[person.role]] || person.role);

    const phone = document.createElement('p');
    phone.textContent = 'Téléphone : ' + (person.phone || 'Non renseigné');

    const status = document.createElement('p');
    status.textContent = 'Statut : ' + person.status;

    card.append(name, role, phone, status);
    staffList.appendChild(card);
  });
}

// DEMANDES D'INSCRIPTION

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

  if (error) throw error;

  if (!data || data.length === 0) {
    learners.innerHTML = '<p>Aucune demande en attente.</p>';
    return;
  }

  learners.innerHTML = '';

  data.forEach(learner => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const name = document.createElement('h3');
    name.textContent = learner.full_name || 'Nom non renseigné';

    const phone = document.createElement('p');
    phone.textContent = 'Téléphone : ' + (learner.phone || 'Non renseigné');

    const date = document.createElement('p');
    date.textContent = 'Inscription : ' +
      new Date(learner.created_at).toLocaleDateString('fr-FR');

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
  await loadDirectorStats();
}

// TABLEAU DE BORD DGA : ACTIVITÉS

const activityStatuses = {
  planned: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée'
};

async function createCoordinationActivity(event) {
  event.preventDefault();

  const button = document.getElementById('saveActivityBtn');
  const result = document.getElementById('activityMessage');

  button.disabled = true;
  result.textContent = 'Enregistrement en cours...';

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Session utilisateur introuvable.');
    }

    const activity = {
      title: document.getElementById('activityTitle').value.trim(),
      service: document.getElementById('activityService').value.trim(),
      activity_type: document.getElementById('activityType').value.trim(),
      description: document.getElementById('activityDescription').value.trim(),
      due_date: document.getElementById('activityDueDate').value || null,
      status: document.getElementById('activityStatus').value,
      created_by: user.id
    };

    const { error } = await supabase
      .from('coordination_activities')
      .insert(activity);

    if (error) throw error;

    result.textContent = 'Activité enregistrée avec succès.';
    result.style.color = '#087844';

    document.getElementById('activityForm').reset();
    await loadCoordinationActivities();
  } catch (error) {
    result.textContent = 'Erreur : ' + error.message;
    result.style.color = '#b52d2d';
    console.error(error);
  } finally {
    button.disabled = false;
  }
}

async function loadCoordinationActivities() {
  const list = document.getElementById('coordinationActivityList');
  if (!list) return;

  list.textContent = 'Chargement des activités...';

  try {
    const { data, error } = await supabase
      .from('coordination_activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    list.innerHTML = '';

    if (!data || data.length === 0) {
      list.textContent = 'Aucune activité enregistrée.';
      return;
    }

    data.forEach(activity => {
      const card = document.createElement('article');
      card.className = 'learner-card';

      const title = document.createElement('h3');
      title.textContent = activity.title;

      const service = document.createElement('p');
      service.textContent = 'Service concerné : ' + activity.service;

      const type = document.createElement('p');
      type.textContent = 'Type : ' + activity.activity_type;

      const description = document.createElement('p');
      description.textContent =
        'Description : ' + (activity.description || 'Aucune');

      const dueDate = document.createElement('p');
      dueDate.textContent = 'Échéance : ' +
        (activity.due_date
          ? new Date(activity.due_date + 'T00:00:00')
              .toLocaleDateString('fr-FR')
          : 'Non définie');

      const statusLabel = document.createElement('p');
      statusLabel.textContent =
        'État actuel : ' +
        (activityStatuses[activity.status] || activity.status);

      const select = document.createElement('select');
      select.id = 'status-' + activity.id;

      Object.entries(activityStatuses).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        option.selected = activity.status === value;
        select.appendChild(option);
      });

      const updateButton = document.createElement('button');
      updateButton.type = 'button';
      updateButton.className = 'update-activity';
      updateButton.dataset.id = activity.id;
      updateButton.textContent = 'Mettre à jour le statut';

      card.append(
        title, service, type, description, dueDate,
        statusLabel, select, updateButton
      );

      list.appendChild(card);
    });
  } catch (error) {
    list.textContent = 'Erreur de chargement : ' + error.message;
    console.error(error);
  }
}

async function updateCoordinationActivity(id, status) {
  const button = document.querySelector(
    '.update-activity[data-id="' + id + '"]'
  );

  if (button) button.disabled = true;

  try {
    const { error } = await supabase
      .from('coordination_activities')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    const result = document.getElementById('activityMessage');

    if (result) {
      result.textContent = 'Statut de l’activité mis à jour.';
      result.style.color = '#087844';
    }

    await loadCoordinationActivities();
  } catch (error) {
    const result = document.getElementById('activityMessage');

    if (result) {
      result.textContent = 'Erreur : ' + error.message;
      result.style.color = '#b52d2d';
    }

    console.error(error);
  } finally {
    if (button) button.disabled = false;
  }
}

// TABLEAU FINANCIER DAF

async function loadFinanceDashboard() {
  const stats = document.getElementById('financeStats');
  const list = document.getElementById('transactionList');

  if (!stats || !list) return;

  stats.textContent = 'Chargement des données...';
  list.textContent = 'Chargement de l’historique...';

  try {
    const year = new Date().getFullYear();

    const { data: transactions, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .gte('transaction_date', `${year}-01-01`)
      .lte('transaction_date', `${year}-12-31`)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    const { data: budgets, error: budgetError } = await supabase
      .from('financial_budgets')
      .select('*')
      .eq('budget_year', year)
      .maybeSingle();

    if (budgetError) throw budgetError;

    const recettes = (transactions || [])
      .filter(item => item.transaction_type === 'recette')
      .reduce((total, item) => total + Number(item.amount), 0);

    const depenses = (transactions || [])
      .filter(item => item.transaction_type === 'depense')
      .reduce((total, item) => total + Number(item.amount), 0);

    const budget = Number(budgets?.amount || 0);
    const solde = recettes - depenses;

    stats.innerHTML = `
      <div class="stat-card">
        <span>Recettes de ${year}</span>
        <strong>${money(recettes)}</strong>
      </div>
      <div class="stat-card">
        <span>Dépenses de ${year}</span>
        <strong>${money(depenses)}</strong>
      </div>
      <div class="stat-card">
        <span>Solde des opérations</span>
        <strong>${money(solde)}</strong>
      </div>
      <div class="stat-card">
        <span>Budget annuel</span>
        <strong>${money(budget)}</strong>
      </div>
      <div class="stat-card">
        <span>Budget restant après dépenses</span>
        <strong>${money(budget - depenses)}</strong>
      </div>
    `;

    document.getElementById('budgetAmount').value =
      budgets?.amount || '';

    document.getElementById('budgetNotes').value =
      budgets?.notes || '';

    displayTransactions(transactions || []);

    message.textContent = 'Données financières actualisées.';
    message.style.color = '#087844';
  } catch (error) {
    stats.textContent = 'Erreur de chargement : ' + error.message;
    list.textContent = 'Impossible de charger les opérations.';
    message.textContent = 'Erreur financière : ' + error.message;
    message.style.color = '#b52d2d';
    console.error(error);
  }
}

function displayTransactions(transactions) {
  const list = document.getElementById('transactionList');
  list.innerHTML = '';

  if (transactions.length === 0) {
    list.textContent = 'Aucune opération enregistrée cette année.';
    return;
  }

  transactions.forEach(item => {
    const card = document.createElement('article');
    card.className = 'learner-card';

    const title = document.createElement('h3');
    title.textContent =
      item.transaction_type === 'recette' ? 'RECETTE' : 'DÉPENSE';

    const amount = document.createElement('p');
    amount.textContent = 'Montant : ' + money(item.amount);

    const category = document.createElement('p');
    category.textContent = 'Catégorie : ' + item.category;

    const description = document.createElement('p');
    description.textContent = 'Description : ' + item.description;

    const date = document.createElement('p');
    date.textContent = 'Date : ' +
      new Date(item.transaction_date + 'T00:00:00')
        .toLocaleDateString('fr-FR');

    card.append(title, amount, category, description, date);
    list.appendChild(card);
  });
}

async function saveBudget(event) {
  event.preventDefault();

  const button = document.getElementById('saveBudgetBtn');
  const result = document.getElementById('budgetMessage');

  button.disabled = true;
  result.textContent = 'Enregistrement en cours...';

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Session utilisateur introuvable.');
    }

    const budget = {
      budget_year: Number(document.getElementById('budgetYear').value),
      amount: Number(document.getElementById('budgetAmount').value),
      notes: document.getElementById('budgetNotes').value.trim(),
      created_by: user.id,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('financial_budgets')
      .upsert(budget, { onConflict: 'budget_year' });

    if (error) throw error;

    result.textContent = 'Budget enregistré avec succès.';
    result.style.color = '#087844';

    await loadFinanceDashboard();
  } catch (error) {
    result.textContent = 'Erreur : ' + error.message;
    result.style.color = '#b52d2d';
  } finally {
    button.disabled = false;
  }
}

async function saveTransaction(event) {
  event.preventDefault();

  const button = document.getElementById('saveTransactionBtn');
  const result = document.getElementById('transactionMessage');

  button.disabled = true;
  result.textContent = 'Enregistrement en cours...';

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Session utilisateur introuvable.');
    }

    const transaction = {
      transaction_type: document.getElementById('transactionType').value,
      amount: Number(document.getElementById('transactionAmount').value),
      category: document.getElementById('transactionCategory').value.trim(),
      description: document.getElementById('transactionDescription').value.trim(),
      transaction_date: document.getElementById('transactionDate').value,
      created_by: user.id
    };

    const { error } = await supabase
      .from('financial_transactions')
      .insert(transaction);

    if (error) throw error;

    result.textContent = 'Opération enregistrée avec succès.';
    result.style.color = '#087844';

    document.getElementById('transactionForm').reset();

    document.getElementById('transactionDate').value =
      new Date().toISOString().slice(0, 10);

    await loadFinanceDashboard();
  } catch (error) {
    result.textContent = 'Erreur : ' + error.message;
    result.style.color = '#b52d2d';
  } finally {
    button.disabled = false;
  }
}

// CONNEXION

loginForm.addEventListener('submit', async event => {
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

// DÉCONNEXION

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

// DÉMARRAGE

showDashboard();
