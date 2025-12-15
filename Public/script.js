// Éléments DOM
const catsList = document.getElementById('catsList');
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('search');
const catCount = document.getElementById('catCount');
const catsCount = document.getElementById('catsCount');
const emptyState = document.getElementById('emptyState');
const formSection = document.querySelector('.form-section');

// Champs du formulaire
const nameInput = document.getElementById('name_cats');
const tagInput = document.getElementById('tag');
const descInput = document.getElementById('description');
const imgInput = document.getElementById('images');

// Modales
const confirmationModal = document.getElementById('confirmationModal');
const editModal = document.getElementById('editModal');
const alertModal = document.getElementById('alertModal');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');
const alertOk = document.getElementById('alertOk');

// Variables pour la gestion
let currentCatId = null;
let catsDatabase = [];
let nextId = 1;

// Initialiser les modales
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
        confirmationModal.classList.remove('show');
        editModal.classList.remove('show');
        alertModal.classList.remove('show');
    });
});

modalCancel.addEventListener('click', () => {
    confirmationModal.classList.remove('show');
});

modalConfirm.addEventListener('click', () => {
    if (currentCatId) {
        deleteCatFromDB(currentCatId);
        confirmationModal.classList.remove('show');
        fetchCats(searchInput.value);
        showAlert('Chat supprimé avec succès !', 'success');
    }
});

alertOk.addEventListener('click', () => {
    alertModal.classList.remove('show');
});

// Fermer modales en cliquant à l'extérieur
window.addEventListener('click', (e) => {
    if (e.target === confirmationModal || e.target === editModal || e.target === alertModal) {
        e.target.classList.remove('show');
    }
});

// ============================================
// BASE DE DONNÉES LOCALE (localStorage)
// ============================================

// Initialiser la base de données
function initDatabase() {
    // Données de démo initiales
    const demoCats = [
        {
            id: 1,
            name_cats: "Mimi",
            tag: "Siamois",
            description: "Un chat calme et affectueux qui aime les câlins.",
            images: "https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?w=600"
        },
        {
            id: 2,
            name_cats: "Luna",
            tag: "Persan",
            description: "Belle chatte aux poils longs, très élégante.",
            images: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600"
        },
        {
            id: 3,
            name_cats: "Simba",
            tag: "Maine Coon",
            description: "Grand chat joueur et très sociable.",
            images: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600"
        }
    ];
    
    // Charger depuis localStorage ou initialiser avec les données de démo
    const savedCats = localStorage.getItem('catsDatabase');
    if (savedCats) {
        catsDatabase = JSON.parse(savedCats);
        nextId = Math.max(...catsDatabase.map(cat => cat.id)) + 1;
    } else {
        catsDatabase = demoCats;
        nextId = 4;
        saveToLocalStorage();
    }
}

// Sauvegarder dans localStorage
function saveToLocalStorage() {
    localStorage.setItem('catsDatabase', JSON.stringify(catsDatabase));
}

// Ajouter un chat à la base de données
function addCatToDB(cat) {
    const newCat = {
        id: nextId++,
        name_cats: cat.name_cats,
        tag: cat.tag,
        description: cat.description,
        images: cat.images
    };
    
    catsDatabase.push(newCat);
    saveToLocalStorage();
    return newCat.id;
}

// Supprimer un chat de la base de données
function deleteCatFromDB(id) {
    const index = catsDatabase.findIndex(cat => cat.id === id);
    if (index !== -1) {
        catsDatabase.splice(index, 1);
        saveToLocalStorage();
        return true;
    }
    return false;
}

// Modifier un chat dans la base de données
function updateCatInDB(id, updatedCat) {
    const index = catsDatabase.findIndex(cat => cat.id === id);
    if (index !== -1) {
        catsDatabase[index] = {
            ...catsDatabase[index],
            name_cats: updatedCat.name_cats,
            tag: updatedCat.tag,
            description: updatedCat.description,
            images: updatedCat.images
        };
        saveToLocalStorage();
        return true;
    }
    return false;
}

// Récupérer un chat par ID
function getCatFromDB(id) {
    return catsDatabase.find(cat => cat.id === id);
}

// Récupérer tous les chats (avec recherche optionnelle)
function getAllCatsFromDB(search = '') {
    if (!search.trim()) {
        return catsDatabase;
    }
    
    const searchLower = search.toLowerCase();
    return catsDatabase.filter(cat => 
        cat.name_cats.toLowerCase().includes(searchLower) ||
        cat.tag.toLowerCase().includes(searchLower) ||
        cat.description.toLowerCase().includes(searchLower)
    );
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

// Afficher tous les chats
function fetchCats(search = '') {
    // Masquer/afficher le formulaire selon la recherche
    if (search.trim() !== '') {
        formSection.style.display = 'none';
    } else {
        formSection.style.display = 'block';
    }
    
    const cats = getAllCatsFromDB(search);
    catsList.innerHTML = '';

    if (cats.length === 0) {
        emptyState.style.display = 'block';
        catsList.appendChild(emptyState);
        catCount.textContent = '0';
        catsCount.textContent = '0';
        return;
    }

    emptyState.style.display = 'none';
    catCount.textContent = cats.length;
    catsCount.textContent = cats.length;

    cats.forEach((cat, index) => {
        const div = document.createElement('div');
        div.classList.add('cat-card');
        div.style.animationDelay = `${index * 0.1}s`;
        div.innerHTML = `
            <img src="${cat.images || 'https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" 
                 alt="${cat.name_cats}" 
                 onerror="this.src='https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
            <div class="cat-card-content">
                <h3>${cat.name_cats}</h3>
                <div class="cat-tag">${cat.tag}</div>
                <p>${cat.description}</p>
                <div class="cat-card-actions">
                    <button class="btn-primary" onclick="editCat(${cat.id})">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn-danger" onclick="deleteCat(${cat.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
        catsList.appendChild(div);
    });
}

// Ajouter chat
addBtn.addEventListener('click', () => {
    if (!nameInput.value || !tagInput.value || !descInput.value || !imgInput.value) {
        showAlert("Veuillez remplir tous les champs !");
        return;
    }

    const newCat = {
        name_cats: nameInput.value,
        tag: tagInput.value,
        description: descInput.value,
        images: imgInput.value
    };

    // Animation du bouton
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout...';
    addBtn.disabled = true;

    // Simuler un délai d'ajout
    setTimeout(() => {
        addCatToDB(newCat);

        // Réinitialiser
        nameInput.value = '';
        tagInput.value = '';
        descInput.value = '';
        imgInput.value = '';

        // Succès visuel
        addBtn.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
        addBtn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            addBtn.innerHTML = originalText;
            addBtn.style.backgroundColor = '';
            addBtn.disabled = false;
        }, 1500);

        fetchCats(searchInput.value);
    }, 500);
});

// Supprimer chat
function deleteCat(id) {
    currentCatId = id;
    confirmationModal.classList.add('show');
}

// Modifier chat - FONCTION CORRECTE
function editCat(id) {
    // Récupérer le chat depuis la base de données
    const cat = getCatFromDB(id);
    
    if (!cat) {
        showAlert('Chat non trouvé dans la base de données');
        return;
    }
    
    console.log('Chat trouvé pour modification:', cat);
    
    // Remplir la modale avec les données actuelles
    document.getElementById('editName').value = cat.name_cats;
    document.getElementById('editTag').value = cat.tag;
    document.getElementById('editDesc').value = cat.description;
    document.getElementById('editImg').value = cat.images;
    
    currentCatId = id;
    editModal.classList.add('show');
    
    // Configurer le bouton Enregistrer
    const saveHandler = () => {
        const name = document.getElementById('editName').value;
        const tag = document.getElementById('editTag').value;
        const desc = document.getElementById('editDesc').value;
        const img = document.getElementById('editImg').value;
        
        if (!name || !tag || !desc || !img) {
            showAlert('Veuillez remplir tous les champs !');
            return;
        }
        
        // Animation
        const saveBtn = document.getElementById('editSave');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        saveBtn.disabled = true;
        
        // Simuler un délai de sauvegarde
        setTimeout(() => {
            const updated = updateCatInDB(id, {
                name_cats: name,
                tag: tag,
                description: desc,
                images: img
            });
            
            if (updated) {
                editModal.classList.remove('show');
                fetchCats(searchInput.value);
                showAlert('Chat modifié avec succès !', 'success');
            } else {
                showAlert('Erreur lors de la modification');
            }
            
            // Restaurer le bouton
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 500);
    };
    
    // Configurer le bouton Annuler
    const cancelHandler = () => {
        editModal.classList.remove('show');
    };
    
    // Retirer les anciens écouteurs et ajouter les nouveaux
    const saveBtn = document.getElementById('editSave');
    const cancelBtn = document.getElementById('editCancel');
    
    // Cloner pour retirer les anciens écouteurs
    const newSaveBtn = saveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Ajouter les nouveaux écouteurs
    newSaveBtn.addEventListener('click', saveHandler);
    newCancelBtn.addEventListener('click', cancelHandler);
}

// Recherche en direct
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    // Masquer/afficher le formulaire
    if (e.target.value.trim() !== '') {
        formSection.style.display = 'none';
    } else {
        formSection.style.display = 'block';
    }
    
    searchTimeout = setTimeout(() => {
        fetchCats(e.target.value);
    }, 300);
});

// Fonction d'alerte personnalisée
function showAlert(message, type = 'info') {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    
    // Couleur selon le type
    const header = alertModal.querySelector('.modal-header');
    const icon = header.querySelector('i');
    
    if (type === 'success') {
        header.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        icon.className = 'fas fa-check-circle';
    } else if (type === 'danger') {
        header.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        icon.className = 'fas fa-exclamation-triangle';
    } else {
        header.style.background = 'linear-gradient(90deg, var(--primary-color), var(--primary-dark))';
        icon.className = 'fas fa-info-circle';
    }
    
    alertModal.classList.add('show');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initDatabase();
    fetchCats();
    
    // Ajouter une animation au titre
    const title = document.querySelector('.header h1');
    title.style.animation = 'fadeInDown 0.8s ease';
});

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Réinitialiser la base de données (pour le débogage)
function resetDatabase() {
    if (confirm('Voulez-vous réinitialiser la base de données ? Toutes les données seront perdues.')) {
        localStorage.removeItem('catsDatabase');
        initDatabase();
        fetchCats();
        showAlert('Base de données réinitialisée !', 'success');
    }
}

// Exporter les données
function exportData() {
    const dataStr = JSON.stringify(catsDatabase, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'chats_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAlert('Données exportées avec succès !', 'success');
}

// Importer des données
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const importedData = JSON.parse(event.target.result);
                catsDatabase = importedData;
                nextId = Math.max(...catsDatabase.map(cat => cat.id)) + 1;
                saveToLocalStorage();
                fetchCats();
                showAlert('Données importées avec succès !', 'success');
            } catch (error) {
                showAlert('Erreur lors de l\'importation: fichier JSON invalide');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Ajouter ces fonctions au scope global pour les utiliser depuis la console
window.resetDatabase = resetDatabase;
window.exportData = exportData;
window.importData = importData;