// Vérifier si on est dans un environnement Cordova ou navigateur
var isCordovaApp = (typeof window.cordova !== 'undefined');

// Gestionnaire d'événement pour le chargement du document
$(document).on('pagecreate', function() {
    // Initialisation de l'application
    initApp();
});

// Variables globales
var contacts = [];
var selectedContacts = [];
var isSelectionMode = false;
var currentContactId = null;
var defaultPhoto = 'img/contact_icone.jpg';

// Fonction pour initialiser Cordova uniquement si disponible
function initCordova() {
    if (!isCordovaApp) return;
    
    document.addEventListener('deviceready', function() {
        console.log('Cordova est prêt');
        // Initialisation spécifique à Cordova ici si nécessaire
    }, false);
}

// Appeler l'initialisation de Cordova au chargement
initCordova();

// Initialisation de l'application
function initApp() {
    // Charger les contacts depuis le stockage local
    loadContacts();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Mettre à jour l'affichage
    updateContactList();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Gestion du clic sur le bouton d'ajout de contact
    $('a[href="#add-contact"]').off('click').on('click', function(e) {
        e.preventDefault();
        prepareNewContactForm();
    });
    
    // Gestion du bouton d'enregistrement
    $('#saveContactBtn').off('click').on('click', saveContact);
    
    // Bouton de changement de photo
    $('#changePhotoBtn').off('click').on('click', function() {
        $('#photoInput').click();
    });
    
    // Gestion du changement de photo
    $('#photoInput').off('change').on('change', handlePhotoUpload);
    
    // Bouton de suppression d'un contact
    $('#deleteContactBtn').off('click').on('click', function(e) {
        e.stopPropagation();
        deleteCurrentContact();
    });
    
    // Bouton de modification d'un contact
    $('#editContactBtn').off('click').on('click', editCurrentContact);
    
    // Bouton de sélection multiple
    $('#selectBtn').off('click').on('click', toggleSelectionMode);
    
    // Bouton de suppression des contacts sélectionnés
    $('#deleteSelectedBtn').off('click').on('click', function(e) {
        e.stopPropagation();
        deleteSelectedContacts();
    });
    
    // Gestion du clic sur un contact dans la liste
    $(document).off('click', '.contact-item').on('click', '.contact-item', function(e) {
        if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            toggleContactSelection($(this).data('id'));
        } else {
            e.preventDefault();
            e.stopPropagation();
            showContactDetails($(this).data('id'));
        }
    });
}

// Charger les contacts depuis le stockage local
function loadContacts() {
    var storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
        contacts = JSON.parse(storedContacts);
    }
    // Trier les contacts d'abord par prénom, puis par nom de famille
    contacts.sort((a, b) => {
        // Comparaison des prénoms
        const firstNameCompare = a.firstName.localeCompare(b.firstName);
        // Si les prénoms sont identiques, on compare les noms de famille
        return firstNameCompare !== 0 ? firstNameCompare : a.lastName.localeCompare(b.lastName);
    });
}

// Sauvegarder les contacts dans le stockage local
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Mettre à jour l'affichage de la liste des contacts
function updateContactList() {
    var $contactList = $('#contactList');
    $contactList.empty();
    
    if (contacts.length === 0) {
        $contactList.append('<li class="empty-list"><span class="ui-icon ui-icon-info"></span><p>Aucun contact enregistré</p></li>');
        return;
    } 
    
    // Grouper les contacts par première lettre du prénom
    var groupedContacts = {};
    contacts.forEach(contact => {    
        // Utiliser la première lettre du prénom pour le regroupement
        var firstLetter = contact.firstName.charAt(0).toUpperCase();
        if (!groupedContacts[firstLetter]) {
            groupedContacts[firstLetter] = [];
        }
        groupedContacts[firstLetter].push(contact);
    });
    
    // Afficher les contacts groupés par lettre
    Object.keys(groupedContacts).sort().forEach(letter => {
        $contactList.append(`<li data-role="list-divider">${letter}</li>`);
        
        groupedContacts[letter].forEach(contact => {
            var isSelected = selectedContacts.includes(contact.id);
            var selectedClass = isSelected ? 'ui-btn-active' : '';
            
            var contactItem = `
                <li class="contact-item ${selectedClass}" data-id="${contact.id}">
                    <img src="${contact.photo || defaultPhoto}" class="contact-avatar">
                    <h2 class="contact-name">${contact.firstName} ${contact.lastName}</h2>
                    <p class="contact-phone">${contact.phone || 'Aucun numéro'}</p>
                    ${isSelectionMode ? '<input type="checkbox" ' + (isSelected ? 'checked' : '') + '>' : ''}
                </li>
            `;
            $contactList.append(contactItem);
        });
    });
    
    // Rafraîchir la liste jQuery Mobile
    $contactList.listview('refresh');
}

// Afficher les détails d'un contact
function showContactDetails(contactId) {
    var contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    currentContactId = contactId;
    
    // Mettre à jour l'interface avec les détails du contact
    $('#detailName').text(`${contact.lastName} ${contact.firstName}`);
    $('#detailPhone, #detailPhone2').text(contact.phone || 'Non renseigné');
    $('#detailEmail').text(contact.email || 'Non renseigné');
    $('#detailAddress').text(contact.address || 'Non renseignée');
    $('#detailPhoto').attr('src', contact.photo || defaultPhoto);
    
    // Mettre à jour les liens d'action
    if (contact.phone) {
        $('#phoneLink').attr('href', `tel:${contact.phone}`);
    } else {
        $('#phoneLink').removeAttr('href');
    }
    
    if (contact.email) {
        $('#emailLink').attr('href', `mailto:${contact.email}`);
    } else {
        $('#emailLink').removeAttr('href');
    }
    
    // Aller à la page des détails
    $.mobile.pageContainer.pagecontainer('change', '#contact-details', { transition: 'slide' });
}

// Préparer le formulaire pour l'ajout d'un nouveau contact
function prepareNewContactForm() {
    $('#contactId').val('');
    $('#firstName').val('');
    $('#lastName').val('');
    $('#phone').val('');
    $('#email').val('');
    $('#address').val('');
    $('#contactPhoto').attr('src', defaultPhoto);
    
    // Aller à la page du formulaire
    $.mobile.pageContainer.pagecontainer('change', '#add-contact', { transition: 'slide' });
}

// Préparer le formulaire pour la modification d'un contact existant
function editCurrentContact() {
    var contact = contacts.find(c => c.id === currentContactId);
    if (!contact) return;
    
    // Remplir le formulaire avec les données du contact
    $('#contactId').val(contact.id);
    $('#firstName').val(contact.firstName);
    $('#lastName').val(contact.lastName);
    $('#phone').val(contact.phone || '');
    $('#email').val(contact.email || '');
    $('#address').val(contact.address || '');
    $('#contactPhoto').attr('src', contact.photo || defaultPhoto);
    
    // Aller à la page du formulaire
    $.mobile.pageContainer.pagecontainer('change', '#add-contact', { transition: 'slide' });
}

// Sauvegarder un contact (ajout ou modification)
function saveContact() {
    // Valider les champs obligatoires
    var firstName = $('#firstName').val().trim();
    var lastName = $('#lastName').val().trim();
    var phone = $('#phone').val().trim();
    
    if (!firstName || !lastName) {
        alert('Les champs Prénom et Nom sont obligatoires.');
        return;
    }
    
    // Préparer l'objet contact
    var contact = {
        id: $('#contactId').val() || generateId(),
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: $('#email').val().trim(),
        address: $('#address').val().trim(),
        photo: $('#contactPhoto').attr('src') === defaultPhoto ? '' : $('#contactPhoto').attr('src')
    };
    
    // Vérifier si c'est une modification ou un nouvel ajout
    var existingIndex = contacts.findIndex(c => c.id === contact.id);
    if (existingIndex !== -1) {
        // Mise à jour d'un contact existant
        contacts[existingIndex] = contact;
    } else {
        // Ajout d'un nouveau contact
        contacts.push(contact);
    }
    
    // Trier les contacts
    contacts.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
    
    // Sauvegarder et mettre à jour l'interface
    saveContacts();
    updateContactList();
    
    // Revenir à la page d'accueil
    $.mobile.pageContainer.pagecontainer('change', '#home', { transition: 'slide', reverse: true });
}

// Supprimer le contact actuel
function deleteCurrentContact() {
    if (!currentContactId) return;
    
    if (confirm('Voulez-vous vraiment supprimer ce contact ?')) {
        contacts = contacts.filter(c => c.id !== currentContactId);
        saveContacts();
        updateContactList();
        
        // Revenir à la page d'accueil
        $.mobile.pageContainer.pagecontainer('change', '#home', { transition: 'slide', reverse: true });
    }
}

// Activer/désactiver le mode de sélection multiple
function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    
    if (isSelectionMode) {
        $('#selectBtn').addClass('ui-btn-active');
        $('.ui-header h1').addClass('selection-mode');
    } else {
        $('#selectBtn').removeClass('ui-btn-active');
        $('.ui-header h1').removeClass('selection-mode');
        selectedContacts = [];
    }
    
    updateContactList();
}

// Basculer la sélection d'un contact
function toggleContactSelection(contactId) {
    var index = selectedContacts.indexOf(contactId);
    if (index === -1) {
        selectedContacts.push(contactId);
    } else {
        selectedContacts.splice(index, 1);
    }
    
    updateContactList();
}

// Supprimer les contacts sélectionnés
function deleteSelectedContacts() {
    if (selectedContacts.length === 0) {
        alert('Aucun contact sélectionné.');
        return;
    }
    
    if (confirm(`Voulez-vous vraiment supprimer ${selectedContacts.length} contact(s) ?`)) {
        contacts = contacts.filter(c => !selectedContacts.includes(c.id));
        saveContacts();
        selectedContacts = [];
        toggleSelectionMode(); // Désactive le mode sélection
        updateContactList();
    }
}

// Gérer le téléchargement d'une photo
function handlePhotoUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(event) {
        $('#contactPhoto').attr('src', event.target.result);
    };
    reader.readAsDataURL(file);
}

// Générer un ID unique
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Gestionnaire d'événement pour le chargement de l'application
if (isCordovaApp) {
    document.addEventListener('deviceready', function() {
        console.log('Application Cordova prête');
        // Initialisation spécifique à Cordova ici
    }, false);
} else {
    console.log('Application exécutée dans un navigateur');
    // Simuler l'événement deviceready pour le navigateur
    $(document).ready(function() {
        console.log('Document prêt');
        // Initialisation spécifique au navigateur ici
    });
}
