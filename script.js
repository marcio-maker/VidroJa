/**
 * JavaScript for VidraJá platform.
 * Handles tab switching, modals, form submissions, and dynamic content loading.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    const tabs = document.querySelectorAll('.tab, .tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Update header navigation
            document.querySelector(`.tab-link[data-tab="${targetTab}"]`)?.classList.add('active');
        });
    });

    // Modal Handling (Terms of Use)
    const termsModal = document.getElementById('termsModal');
    const termsLinks = document.querySelectorAll('#termsLink, #termsLinkInForm, #termsLinkFooter');
    const closeTerms = termsModal.querySelector('.close');

    termsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.style.display = 'block';
        });
    });

    closeTerms.addEventListener('click', () => {
        termsModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === termsModal) {
            termsModal.style.display = 'none';
        }
    });

    // Profile Modal (Placeholder for dynamic content)
    const profileModal = document.getElementById('profileModal');
    const closeProfile = document.getElementById('closeProfileModal');

    closeProfile.addEventListener('click', () => {
        profileModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });

    // CNPJ Field Toggle
    const hasCNPJCheckbox = document.getElementById('hasCNPJ');
    const cnpjSection = document.getElementById('cnpjSection');

    hasCNPJCheckbox.addEventListener('change', () => {
        cnpjSection.style.display = hasCNPJCheckbox.checked ? 'block' : 'none';
    });

    // Search Form Submission
    const searchForm = document.getElementById('searchForm');
    const loading = document.getElementById('loading');
    const resultsContainer = document.getElementById('resultsContainer');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const service = document.getElementById('service').value;
        const location = document.getElementById('location').value;
        const emergency = document.getElementById('emergency').checked;
        const verified = document.getElementById('verified').checked;

        // Show loading spinner
        loading.style.display = 'block';
        resultsContainer.innerHTML = '';

        try {
            const response = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service, location, emergency, verified })
            });

            const data = await response.json();

            // Hide loading spinner
            loading.style.display = 'none';

            // Render results
            if (data.results.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum vidraceiro encontrado.</p>';
                return;
            }

            data.results.forEach(glazier => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-img">
                        <img src="${glazier.image || 'https://via.placeholder.com/300x200'}" alt="${glazier.name}">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${glazier.name}</h3>
                        <div class="profile-badges">
                            ${glazier.verified ? '<span class="badge badge-verified">Verificado</span>' : ''}
                            ${glazier.emergency ? '<span class="badge badge-emergency">24h</span>' : ''}
                        </div>
                        <div class="rating">
                            ${'★'.repeat(Math.floor(glazier.rating))}${'☆'.repeat(5 - Math.floor(glazier.rating))} (${glazier.rating})
                        </div>
                        <p class="card-text">${glazier.bio || 'Sem descrição disponível.'}</p>
                    </div>
                    <div class="card-footer">
                        <a href="https://wa.me/${glazier.whatsapp}" class="btn btn-whatsapp">
                            <i class="fab fa-whatsapp"></i> Contatar
                        </a>
                        <button class="btn btn-primary view-profile" data-id="${glazier.id}">Ver Perfil</button>
                    </div>
                `;
                resultsContainer.appendChild(card);
            });

            // Add event listeners for profile buttons
            document.querySelectorAll('.view-profile').forEach(button => {
                button.addEventListener('click', () => {
                    const glazierId = button.dataset.id;
                    // Placeholder: Populate profile modal (requires backend endpoint)
                    profileModal.querySelector('.profile-card').innerHTML = `
                        <div class="profile-img">
                            <img src="https://via.placeholder.com/120" alt="Profile">
                        </div>
                        <h3 class="profile-name">Carregando...</h3>
                        <p>Perfil do vidraceiro (ID: ${glazierId}) será carregado aqui.</p>
                    `;
                    profileModal.style.display = 'block';
                });
            });
        } catch (error) {
            console.error('Error fetching search results:', error);
            loading.style.display = 'none';
            resultsContainer.innerHTML = '<p>Erro ao buscar vidraceiros. Tente novamente.</p>';
        }
    });

    // Register Form Submission
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const cep = document.getElementById('cep').value;
        const bio = document.getElementById('bio').value;
        const profileImage = document.getElementById('profileImage').files[0];
        const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(input => input.value);
        const emergency24h = document.getElementById('emergency24h').checked;
        const hasCNPJ = document.getElementById('hasCNPJ').checked;
        const cnpj = hasCNPJ ? document.getElementById('cnpj').value : '';

        // Basic validation
        if (!fullName || !whatsapp || !cep || services.length === 0 || !document.getElementById('termsAccepted').checked) {
            alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.');
            return;
        }

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('whatsapp', whatsapp);
        formData.append('cep', cep);
        formData.append('bio', bio);
        if (profileImage) formData.append('profileImage', profileImage);
        formData.append('services', JSON.stringify(services));
        formData.append('emergency24h', emergency24h);
        formData.append('hasCNPJ', hasCNPJ);
        if (hasCNPJ) formData.append('cnpj', cnpj);

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            alert(data.message);
            registerForm.reset();
            cnpjSection.style.display = 'none';
        } catch (error) {
            console.error('Error submitting registration:', error);
            alert('Erro ao cadastrar. Tente novamente.');
        }
    });
});