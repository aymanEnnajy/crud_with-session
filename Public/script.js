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

modalConfirm.addEventListener('click', async () => {
    if (currentCatId) {
        await deleteCatFromDB(currentCatId);
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
// FONCTIONS API
// ============================================

// Récupérer tous les chats
async function getAllCatsFromDB(search = '') {
    const res = await fetch('/api/cats');
    let cats = await res.json();
    if (search.trim()) {
        const searchLower = search.toLowerCase();
        cats = cats.filter(cat =>
            cat.name_cats.toLowerCase().includes(searchLower) ||
            cat.tag.toLowerCase().includes(searchLower) ||
            cat.description.toLowerCase().includes(searchLower)
        );
    }
    return cats;
}

// Ajouter un chat
async function addCatToDB(cat) {
    const res = await fetch('/api/cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
    });
    return await res.json();
}

// Modifier un chat
async function updateCatInDB(id, cat) {
    const res = await fetch(`/api/cats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat)
    });
    return await res.json();
}

// Supprimer un chat
async function deleteCatFromDB(id) {
    await fetch(`/api/cats/${id}`, { method: 'DELETE' });
}

// Récupérer un chat par ID
async function getCatFromDB(id) {
    const cats = await getAllCatsFromDB();
    return cats.find(cat => cat.id === id);
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

// Afficher tous les chats
async function fetchCats(search = '') {
    if (search.trim() !== '') {
        formSection.style.display = 'none';
    } else {
        formSection.style.display = 'block';
    }
    
    const cats = await getAllCatsFromDB(search);
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
            <img src="${cat.images || 'https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?w=600'}" 
                 alt="${cat.name_cats}" 
                 onerror="this.src='https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?w=600'">
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
addBtn.addEventListener('click', async () => {
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

    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout...';
    addBtn.disabled = true;

    try {
        await addCatToDB(newCat);

        nameInput.value = '';
        tagInput.value = '';
        descInput.value = '';
        imgInput.value = '';

        addBtn.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
        addBtn.style.backgroundColor = '#10b981';
        setTimeout(() => {
            addBtn.innerHTML = originalText;
            addBtn.style.backgroundColor = '';
            addBtn.disabled = false;
        }, 1500);

        fetchCats(searchInput.value);
    } catch (error) {
        showAlert('Erreur lors de l\'ajout du chat', 'danger');
        addBtn.innerHTML = originalText;
        addBtn.disabled = false;
    }
});

// Supprimer chat
function deleteCat(id) {
    currentCatId = id;
    confirmationModal.classList.add('show');
}

// Modifier chat
async function editCat(id) {
    const cat = await getCatFromDB(id);
    if (!cat) {
        showAlert('Chat non trouvé dans la base de données', 'danger');
        return;
    }

    document.getElementById('editName').value = cat.name_cats;
    document.getElementById('editTag').value = cat.tag;
    document.getElementById('editDesc').value = cat.description;
    document.getElementById('editImg').value = cat.images;
    
    currentCatId = id;
    editModal.classList.add('show');

    const saveHandler = async () => {
        const updatedCat = {
            name_cats: document.getElementById('editName').value,
            tag: document.getElementById('editTag').value,
            description: document.getElementById('editDesc').value,
            images: document.getElementById('editImg').value
        };
        
        if (!updatedCat.name_cats || !updatedCat.tag || !updatedCat.description || !updatedCat.images) {
            showAlert('Veuillez remplir tous les champs !');
            return;
        }

        const saveBtn = document.getElementById('editSave');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        saveBtn.disabled = true;

        try {
            await updateCatInDB(id, updatedCat);
            editModal.classList.remove('show');
            fetchCats(searchInput.value);
            showAlert('Chat modifié avec succès !', 'success');
        } catch (error) {
            showAlert('Erreur lors de la modification', 'danger');
        }

        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    };

    const cancelHandler = () => editModal.classList.remove('show');

    const saveBtn = document.getElementById('editSave');
    const cancelBtn = document.getElementById('editCancel');

    const newSaveBtn = saveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);

    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newSaveBtn.addEventListener('click', saveHandler);
    newCancelBtn.addEventListener('click', cancelHandler);
}

// Recherche en direct
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    if (e.target.value.trim() !== '') formSection.style.display = 'none';
    else formSection.style.display = 'block';
    
    searchTimeout = setTimeout(() => fetchCats(e.target.value), 300);
});

// Fonction d'alerte
function showAlert(message, type = 'info') {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
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
    fetchCats();
    const title = document.querySelector('.header h1');
    if (title) title.style.animation = 'fadeInDown 0.8s ease';
});

/*filter*/
