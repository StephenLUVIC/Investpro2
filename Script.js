// Données des paquets d'investissement
const packages = [
    { id: 0, price: 5000, dailyGain: 500, totalReturn: 22500 },
    { id: 1, price: 10000, dailyGain: 1000, totalReturn: 45000 },
    { id: 2, price: 15000, dailyGain: 1500, totalReturn: 68000 },
    { id: 3, price: 20000, dailyGain: 2000, totalReturn: 90000 },
    { id: 4, price: 25000, dailyGain: 2500, totalReturn: 112500 },
    { id: 5, price: 50000, dailyGain: 5000, totalReturn: 225000 },
    { id: 6, price: 100000, dailyGain: 10000, totalReturn: 450000 },
    { id: 7, price: 200000, dailyGain: 20000, totalReturn: 900000 },
    { id: 8, price: 300000, dailyGain: 30000, totalReturn: 1350000 },
    { id: 9, price: 500000, dailyGain: 50000, totalReturn: 2250000 }
];

// Données utilisateur (simulation)
let userData = {
    balance: 500,
    investments: [],
    transactions: [],
    referralCode: 'INV123456',
    referralCount: 0,
    commissionEarned: 0,
    lastMiningTime: null
};

// Variables globales
let selectedPackage = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    generatePackages();
    updateDashboard();
    updateHistory();
    updateReferralInfo();
    checkMiningStatus();
    
    // Charger les données depuis localStorage si disponibles
    loadUserData();
}

function setupEventListeners() {
    // Navigation mobile
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    
    mobileMenu.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // Fermer le menu mobile lors du clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Navigation entre les pages
function showPage(pageId) {
    // Cacher toutes les pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Afficher la page sélectionnée
    document.getElementById(pageId).classList.add('active');
    
    // Mettre à jour le contenu si nécessaire
    if (pageId === 'dashboard') {
        updateDashboard();
    } else if (pageId === 'history') {
        updateHistory();
    } else if (pageId === 'team') {
        updateReferralInfo();
    }
}

// Génération des paquets d'investissement
function generatePackages() {
    const packagesGrid = document.getElementById('packages-grid');
    packagesGrid.innerHTML = '';
    
    packages.forEach(pkg => {
        const packageCard = createPackageCard(pkg);
        packagesGrid.appendChild(packageCard);
    });
}

function createPackageCard(pkg) {
    const card = document.createElement('div');
    card.className = 'package-card';
    
    card.innerHTML = `
        <div class="package-header">
            <h3 class="package-title">Paquet ${pkg.id}</h3>
            <div class="package-price">${formatCurrency(pkg.price)}</div>
        </div>
        <div class="package-details">
            <div class="detail-item">
                <span class="detail-label">Prix d'achat:</span>
                <span class="detail-value">${formatCurrency(pkg.price)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Gains quotidiens:</span>
                <span class="detail-value">${formatCurrency(pkg.dailyGain)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Rendement total (45j):</span>
                <span class="detail-value">${formatCurrency(pkg.totalReturn)}</span>
            </div>
        </div>
        <button class="buy-btn" onclick="openPurchaseModal(${pkg.id})">
            Acheter Maintenant
        </button>
    `;
    
    return card;
}

// Gestion des achats
function openPurchaseModal(packageId) {
    selectedPackage = packages.find(pkg => pkg.id === packageId);
    const modal = document.getElementById('purchase-modal');
    const packageInfo = document.getElementById('selected-package-info');
    
    packageInfo.innerHTML = `
        <h4>Paquet ${selectedPackage.id}</h4>
        <p><strong>Prix:</strong> ${formatCurrency(selectedPackage.price)}</p>
        <p><strong>Gains quotidiens:</strong> ${formatCurrency(selectedPackage.dailyGain)}</p>
        <p><strong>Rendement total:</strong> ${formatCurrency(selectedPackage.totalReturn)}</p>
    `;
    
    modal.style.display = 'block';
}

function closePurchaseModal() {
    document.getElementById('purchase-modal').style.display = 'none';
    selectedPackage = null;
}

function confirmPurchase() {
    if (!selectedPackage) return;
    
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    if (!paymentMethod) {
        alert('Veuillez sélectionner une méthode de paiement');
        return;
    }
    
    if (userData.balance < selectedPackage.price) {
        alert('Solde insuffisant');
        return;
    }
    
    // Effectuer l'achat
    userData.balance -= selectedPackage.price;
    
    const investment = {
        id: Date.now(),
        packageId: selectedPackage.id,
        package: selectedPackage,
        purchaseDate: new Date(),
        daysRemaining: 45,
        totalEarned: 0,
        dailyGains: Array(45).fill(false)
    };
    
    userData.investments.push(investment);
    
    // Ajouter la transaction
    addTransaction('Achat Paquet ' + selectedPackage.id, -selectedPackage.price, paymentMethod.value);
    
    // Sauvegarder et mettre à jour
    saveUserData();
    updateDashboard();
    closePurchaseModal();
    
    alert('Achat effectué avec succès!');
}

// Gestion du minage
function mineGains() {
    const now = new Date();
    const lastMining = userData.lastMiningTime ? new Date(userData.lastMiningTime) : null;
    
    // Vérifier si 24h se sont écoulées
    if (lastMining && (now - lastMining) < 24 * 60 * 60 * 1000) {
        alert('Vous devez attendre 24h entre chaque minage');
        return;
    }
    
    let totalMined = 0;
    
    // Calculer les gains pour chaque investissement actif
    userData.investments.forEach(investment => {
        if (investment.daysRemaining > 0) {
            const dayIndex = 45 - investment.daysRemaining;
            if (!investment.dailyGains[dayIndex]) {
                investment.dailyGains[dayIndex] = true;
                investment.totalEarned += investment.package.dailyGain;
                investment.daysRemaining--;
                totalMined += investment.package.dailyGain;
            }
        }
    });
    
    if (totalMined > 0) {
        userData.balance += totalMined;
        userData.lastMiningTime = now.toISOString();
        addTransaction('Minage quotidien', totalMined, 'mining');
        
        saveUserData();
        updateDashboard();
        checkMiningStatus();
        
        alert(`Vous avez miné ${formatCurrency(totalMined)}!`);
    } else {
        alert('Aucun gain à miner pour le moment');
    }
}

function checkMiningStatus() {
    const mineBtn = document.getElementById('mine-btn');
    const mineText = document.getElementById('mine-text');
    const mineTimer = document.getElementById('mine-timer');
    
    if (!userData.lastMiningTime) {
        mineBtn.disabled = false;
        mineText.style.display = 'inline';
        mineTimer.style.display = 'none';
        return;
    }
    
    const now = new Date();
    const lastMining = new Date(userData.lastMiningTime);
    const timeDiff = now - lastMining;
    const timeUntilNext = 24 * 60 * 60 * 1000 - timeDiff;
    
    if (timeUntilNext <= 0) {
        mineBtn.disabled = false;
        mineText.style.display = 'inline';
        mineTimer.style.display = 'none';
    } else {
        mineBtn.disabled = true;
        mineText.style.display = 'none';
        mineTimer.style.display = 'inline';
        
        const hours = Math.floor(timeUntilNext / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
        mineTimer.textContent = `Disponible dans ${hours}h ${minutes}m`;
        
        // Mettre à jour le timer toutes les minutes
        setTimeout(checkMiningStatus, 60000);
    }
}

// Gestion des retraits et dépôts
function showWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'block';
}

function closeWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'none';
}

function confirmWithdraw() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const method = document.querySelector('input[name="withdraw-method"]:checked');
    
    if (!amount || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    if (!method) {
        alert('Veuillez sélectionner une méthode de retrait');
        return;
    }
    
    if (amount > userData.balance) {
        alert('Solde insuffisant');
        return;
    }
    
    userData.balance -= amount;
    addTransaction('Retrait', -amount, method.value);
    
    saveUserData();
    updateDashboard();
    closeWithdrawModal();
    
    alert('Veuiller patienter!');
}

function showDepositModal() {
    document.getElementById('deposit-modal').style.display = 'block';
}

function closeDepositModal() {
    document.getElementById('deposit-modal').style.display = 'none';
}

function confirmDeposit() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    const method = document.querySelector('input[name="deposit-method"]:checked');
    
    if (!amount || amount <= 0) {
        alert('Veuillez entrer un montant valide');
        return;
    }
    
    if (!method) {
        alert('Veuillez sélectionner une méthode de dépôt');
        return;
    }
   
}

// Mise à jour du dashboard
function updateDashboard() {
    // Mettre à jour le solde
   
    
    // Mettre à jour les investissements
    const investmentsContainer = document.getElementById('');
    investmentsContainer.innerHTML = '';
    
    if (userData.investments.length === 0) {
        investmentsContainer.innerHTML = '<p>Aucun investissement pour le moment</p>';
    } else {
        userData.investments.forEach(investment => {
            const investmentDiv = document.createElement('div');
            investmentDiv.className = 'investment-item';
            investmentDiv.innerHTML = `
                <div style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h4>Paquet ${investment.packageId}</h4>
                    <p><strong>Investi:</strong> ${formatCurrency(investment.package.price)}</p>
                    <p><strong>Gagné:</strong> ${formatCurrency(investment.totalEarned)}</p>
                    <p><strong>Jours restants:</strong> ${investment.daysRemaining}</p>
                    <div style="background-color: #f0f0f0; border-radius: 4px; height: 8px; margin-top: 0.5rem;">
                        <div style="background-color: var(--primary-green); height: 100%; border-radius: 4px; width: ${((45 - investment.daysRemaining) / 45) * 100}%;"></div>
                    </div>
                </div>
            `;
            investmentsContainer.appendChild(investmentDiv);
        });
    }
    
    // Mettre à jour les transactions
   
}

function updateTransactionsList() {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';
    
    if (userData.transactions.length === 0) {
        transactionsList.innerHTML = '<p>Aucune transaction</p>';
        return;
    }
    
    // Afficher les 10 dernières transactions
    const recentTransactions = userData.transactions.slice(-10).reverse();
    
    recentTransactions.forEach(transaction => {
        const transactionDiv = document.createElement('div');
        transactionDiv.className = 'transaction-item';
        
        const amountClass = transaction.amount >= 0 ? 'positive' : 'negative';
        const amountSign = transaction.amount >= 0 ? '+' : '';
        
        transactionDiv.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-type">${transaction.type}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountSign}${formatCurrency(Math.abs(transaction.amount))}
            </div>
        `;
        
        transactionsList.appendChild(transactionDiv);
    });
}

// Mise à jour de l'historique
function updateHistory() {
    const historyContent = document.getElementById('history-content');
    historyContent.innerHTML = '';
    
    if (userData.investments.length === 0) {
        historyContent.innerHTML = '<p>Aucun investissement pour le moment</p>';
        return;
    }
    
    userData.investments.forEach(investment => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'investment-history';
        
        const status = investment.daysRemaining > 0 ? 'active' : 'completed';
        const statusText = investment.daysRemaining > 0 ? 'En cours' : 'Terminé';
        
        historyDiv.innerHTML = `
            <div class="investment-header">
                <div class="investment-title">Paquet ${investment.packageId}</div>
                <div class="investment-status status-${status}">${statusText}</div>
            </div>
            <div class="investment-details">
                <p><strong>Date d'achat:</strong> ${formatDate(investment.purchaseDate)}</p>
                <p><strong>Montant investi:</strong> ${formatCurrency(investment.package.price)}</p>
                <p><strong>Gains quotidiens:</strong> ${formatCurrency(investment.package.dailyGain)}</p>
                <p><strong>Total gagné:</strong> ${formatCurrency(investment.totalEarned)}</p>
                <p><strong>Jours restants:</strong> ${investment.daysRemaining}</p>
            </div>
            <div class="daily-gains">
                ${investment.dailyGains.map((earned, index) => `
                    <div class="daily-gain ${earned ? 'earned' : ''}">
                        J${index + 1}
                    </div>
                `).join('')}
            </div>
        `;
        
        historyContent.appendChild(historyDiv);
    });
}

// Mise à jour des informations de parrainage
function updateReferralInfo() {
    document.getElementById('referral-code').textContent = userData.referralCode;
    document.getElementById('referral-count').textContent = userData.referralCount;
    document.getElementById('commission-earned').textContent = formatCurrency(userData.commissionEarned);
}

// Partage du code de parrainage
function shareReferralCode() {
    const referralText = `Rejoignez InvestPro avec mon code de parrainage: ${userData.referralCode}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'InvestPro - Code de Parrainage',
            text: referralText,
            url: window.location.href
        });
    } else {
        // Fallback: copier dans le presse-papiers
        navigator.clipboard.writeText(referralText).then(() => {
            alert('Code de parrainage copié dans le presse-papiers!');
        }).catch(() => {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = referralText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Code de parrainage copié!');
        });
    }
}

// Fonctions utilitaires
function addTransaction(type, amount, method) {
    userData.transactions.push({
        id: Date.now(),
        type: type,
        amount: amount,
        method: method,
        date: new Date()
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Sauvegarde et chargement des données
function saveUserData() {
    localStorage.setItem('investProUserData', JSON.stringify(userData));
}

function loadUserData() {
    const savedData = localStorage.getItem('investProUserData');
    if (savedData) {
        userData = { ...userData, ...JSON.parse(savedData) };
        updateDashboard();
        updateHistory();
        updateReferralInfo();
        checkMiningStatus();
    }
}

// Fermer les modals en cliquant à l'extérieur
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Simulation de données pour la démonstration
function simulateData() {
    // Ajouter quelques transactions de démonstration
    if (userData.transactions.length === 0) {
        addTransaction('Dépôt initial', 500, 'mtn');
        addTransaction('Achat Paquet 1', 0, 'mtn');
        addTransaction('Minage quotidien', 0, 'mining');
    }
    
    // Ajouter un investissement de démonstration
    if (userData.investments.length === 0) {
        const demoInvestment = {
            id: Date.now(),
            packageId: 1,
            package: packages[1],
            purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
            daysRemaining: 40,
            totalEarned: 5000,
            dailyGains: [true, true, true, true, true, ...Array(40).fill(false)]
        };
        userData.investments.push(demoInvestment);
    }
    
    saveUserData();
}

// Initialiser avec des données de démonstration si c'est la première visite
if (!localStorage.getItem('investProUserData')) {
    simulateData();
}