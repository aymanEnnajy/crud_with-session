// Éléments DOM
const catsList = document.getElementById('catsList');
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('search');
const catCount = document.getElementById('catCount');
const catsCount = document.getElementById('catsCount');
const emptyState = document.getElementById('emptyState');
const formSection = document.querySelector('.form-section'); // Nouvel élément

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

// Variables pour la gestion des modales
let currentCatId = null;
let deleteCallback = null;

// Initialiser les écouteurs d'événements pour les modales
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
    if (deleteCallback) {
        deleteCallback();
        confirmationModal.classList.remove('show');
    }
});

alertOk.addEventListener('click', () => {
    alertModal.classList.remove('show');
});

// Fermer les modales en cliquant à l'extérieur
window.addEventListener('click', (e) => {
    if (e.target === confirmationModal) {
        confirmationModal.classList.remove('show');
    }
    if (e.target === editModal) {
        editModal.classList.remove('show');
    }
    if (e.target === alertModal) {
        alertModal.classList.remove('show');
    }
});

// Afficher tous les chats avec animation
async function fetchCats(search = '') {
    try {
        // Afficher un indicateur de chargement
        if (catsList.children.length === 0 || catsList.children[0].classList.contains('empty-state')) {
            catsList.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin loading-icon"></i>
                    <p>Chargement des chats...</p>
                </div>
            `;
        }
        
        const res = await fetch(`/api/cats?search=${encodeURIComponent(search)}`);
        
        if (!res.ok) {
            throw new Error(`Erreur HTTP: ${res.status}`);
        }
        
        const data = await res.json();
        
        catsList.innerHTML = '';
        
        // Cacher/afficher le formulaire selon la recherche
        if (search.trim() !== '') {
            formSection.style.display = 'none';
        } else {
            formSection.style.display = 'block';
        }
        
        // Afficher l'état vide si aucun chat n'est trouvé
        if (data.length === 0) {
            emptyState.style.display = 'block';
            catsList.appendChild(emptyState);
            catCount.textContent = '0';
            catsCount.textContent = '0';
            return;
        }
        
        emptyState.style.display = 'none';
        catCount.textContent = data.length;
        catsCount.textContent = data.length;
        
        // Ajouter chaque chat avec un délai d'animation
        data.forEach((cat, index) => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.classList.add('cat-card');
                div.style.animationDelay = `${index * 0.1}s`;
                
                // Image par défaut si l'URL est invalide
                const imageUrl = cat.images && cat.images.trim() !== '' 
                    ? cat.images 
                    : 'https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                
                div.innerHTML = `
                    <img src="${imageUrl}" alt="${cat.name_cats}" onerror="this.src='https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
                    <div class="cat-card-content">
                        <h3>${cat.name_cats || 'Sans nom'}</h3>
                        <div class="cat-tag">${cat.tag || 'Non spécifié'}</div>
                        <p>${cat.description || 'Aucune description disponible'}</p>
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
            }, 10);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des chats:', error);
        catsList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle error-icon"></i>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger les chats. Veuillez réessayer.</p>
                <button class="btn-primary" onclick="fetchCats('')">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
        `;
        catCount.textContent = '0';
        catsCount.textContent = '0';
    }
}

// Ajouter un chat
addBtn.addEventListener('click', async () => {
    // Validation des champs
    if (!nameInput.value.trim() || !tagInput.value.trim() || !descInput.value.trim() || !imgInput.value.trim()) {
        showAlert('Veuillez remplir tous les champs !');
        
        // Animation sur les champs vides
        const inputs = [nameInput, tagInput, descInput, imgInput];
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--danger-color)';
                input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
                
                setTimeout(() => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }, 2000);
            }
        });
        
        return;
    }
    
    // Validation de l'URL de l'image (optionnelle)
    if (imgInput.value.trim() && !isValidUrl(imgInput.value.trim())) {
        showAlert('Veuillez entrer une URL valide pour l\'image (commençant par http:// ou https://).');
        imgInput.style.borderColor = 'var(--danger-color)';
        imgInput.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
        
        setTimeout(() => {
            imgInput.style.borderColor = '';
            imgInput.style.boxShadow = '';
        }, 2000);
        
        return;
    }
    
    const newCat = {
        name_cats: nameInput.value.trim(),
        tag: tagInput.value.trim(),
        description: descInput.value.trim(),
        images: imgInput.value.trim()
    };
    
    try {
        // Animation du bouton
        const originalText = addBtn.innerHTML;
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';
        addBtn.disabled = true;
        
        const response = await fetch('/api/cats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCat)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Réinitialiser le formulaire
        nameInput.value = '';
        tagInput.value = '';
        descInput.value = '';
        imgInput.value = '';
        
        // Message de succès visuel
        addBtn.innerHTML = '<i class="fas fa-check"></i> Chat ajouté !';
        addBtn.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
            addBtn.innerHTML = originalText;
            addBtn.style.backgroundColor = '';
            addBtn.disabled = false;
        }, 1500);
        
        // Recharger la liste des chats
        fetchCats(searchInput.value);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du chat:', error);
        showAlert('Erreur lors de l\'ajout du chat. Veuillez réessayer.');
        
        // Réactiver le bouton
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter Chat';
        addBtn.disabled = false;
    }
});

// Supprimer un chat
async function deleteCat(id) {
    currentCatId = id;
    
    // Afficher la modale de confirmation
    document.getElementById('modalMessage').textContent = 'Êtes-vous sûr de vouloir supprimer ce chat ? Cette action est irréversible.';
    confirmationModal.classList.add('show');
    
    // Définir le callback de suppression
    deleteCallback = async () => {
        try {
            const response = await fetch(`/api/cats/${id}`, { method: 'DELETE' });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            fetchCats(searchInput.value);
            
            // Message de succès visuel
            showAlert('Chat supprimé avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de la suppression du chat:', error);
            showAlert('Erreur lors de la suppression du chat. Veuillez réessayer.');
        }
    };
}

// Modifier un chat
// Modifier chat - VERSION ALTERNATIVE TRÈS SIMPLE
// Modifier chat - EXACTEMENT COMME TON ORIGINAL MAIS AVEC MODALE
// Modifier chat - EXACTEMENT COMME TON ORIGINAL MAIS AVEC MODALE
async function editCat(id) {
    // Ouvrir la modale vide
    document.getElementById('editName').value = '';
    document.getElementById('editTag').value = '';
    document.getElementById('editDesc').value = '';
    document.getElementById('editImg').value = '';
    
    editModal.classList.add('show');
    
    // Attendre que l'utilisateur clique sur Enregistrer
    return new Promise((resolve) => {
        const checkAndSave = async () => {
            const name = document.getElementById('editName').value;
            const tag = document.getElementById('editTag').value;
            const desc = document.getElementById('editDesc').value;
            const img = document.getElementById('editImg').value;
            
            if (name && tag && desc && img) {
                try {
                    await fetch(`/api/cats/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name_cats: name, tag, description: desc, images: img })
                    });
                    
                    editModal.classList.remove('show');
                    fetchCats(searchInput.value);
                    showAlert('Chat modifié avec succès !', 'success');
                } catch (error) {
                    console.error('Erreur:', error);
                    showAlert('Erreur lors de la modification');
                }
                
                // Retirer les écouteurs
                saveBtn.removeEventListener('click', checkAndSave);
                cancelBtn.removeEventListener('click', cancelHandler);
                resolve();
            } else {
                showAlert('Veuillez remplir tous les champs !');
            }
        };
        
        const cancelHandler = () => {
            editModal.classList.remove('show');
            saveBtn.removeEventListener('click', checkAndSave);
            cancelBtn.removeEventListener('click', cancelHandler);
            resolve();
        };
        
        const saveBtn = document.getElementById('editSave');
        const cancelBtn = document.getElementById('editCancel');
        
        saveBtn.addEventListener('click', checkAndSave);
        cancelBtn.addEventListener('click', cancelHandler);
    });
}

// Recherche en direct avec debounce et masquage du formulaire
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    // Masquer/afficher immédiatement le formulaire
    if (e.target.value.trim() !== '') {
        formSection.style.display = 'none';
    } else {
        formSection.style.display = 'block';
    }
    
    searchTimeout = setTimeout(() => {
        fetchCats(e.target.value);
    }, 300);
});

// Fonction pour valider les URLs
function isValidUrl(string) {
    try {
        // Vérifier si c'est une URL valide
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Fonction pour afficher des alertes personnalisées
function showAlert(message, type = 'info') {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    
    // Changer la couleur en fonction du type
    const modalHeader = alertModal.querySelector('.modal-header');
    const alertIcon = modalHeader.querySelector('i');
    
    if (type === 'success') {
        modalHeader.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        alertIcon.className = 'fas fa-check-circle';
    } else if (type === 'danger') {
        modalHeader.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        alertIcon.className = 'fas fa-exclamation-triangle';
    } else {
        modalHeader.style.background = 'linear-gradient(90deg, var(--primary-color), var(--primary-dark))';
        alertIcon.className = 'fas fa-info-circle';
    }
    
    alertModal.classList.add('show');
}

// Ajouter un bouton pour afficher le formulaire lors de la recherche
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim() !== '') {
        // Ajouter un bouton pour afficher le formulaire
        if (!document.getElementById('showFormBtn')) {
            const showFormBtn = document.createElement('button');
            showFormBtn.id = 'showFormBtn';
            showFormBtn.className = 'btn-secondary';
            showFormBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter un chat';
            showFormBtn.style.marginTop = '10px';
            showFormBtn.style.width = 'auto';
            showFormBtn.style.padding = '10px 20px';
            
            showFormBtn.addEventListener('click', () => {
                formSection.style.display = 'block';
                formSection.scrollIntoView({ behavior: 'smooth' });
                showFormBtn.remove();
            });
            
            searchInput.parentNode.appendChild(showFormBtn);
        }
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    fetchCats();
    
    // Ajouter une animation au titre
    const title = document.querySelector('.header h1');
    title.style.animation = 'fadeInDown 0.8s ease';
});