// Global variables
let currentPage = 0;
let currentPokemonIndex = 0;
let pokemonData = [];
let filteredPokemon = [];
let currentAudio = null;

// Page navigation
const pages = ['cover', 'page1', 'page2', 'page3'];
const tabs = document.querySelectorAll('.page-tab');

function goToPage(pageIndex) {
    // Remove active class from current tab
    tabs[currentPage].classList.remove('active');
    
    // Update current page
    currentPage = pageIndex;
    
    // Add active class to new tab
    tabs[currentPage].classList.add('active');

    // Handle page flipping animation
    pages.forEach((pageId, index) => {
        const element = document.getElementById(pageId);
        if (index <= pageIndex) {
            element.classList.add('flipped');
        } else {
            element.classList.remove('flipped');
        }
    });
}

// Add click events to cover and pages for navigation
document.getElementById('cover').addEventListener('click', () => goToPage(0));
document.getElementById('page1').addEventListener('click', () => goToPage(1));
document.getElementById('page2').addEventListener('click', (e) => {
    if (e.target === document.getElementById('page2')) {
        goToPage(2);
    }
});

// Pokemon API functions
async function getTypeSprite(typeName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`);
        const typeData = await response.json();
        return typeData.sprites['generation-viii']['sword-shield'].name_icon || null;
    } catch (error) {
        console.log(`Could not fetch sprite for type ${typeName}:`, error);
        return null;
    }
}

async function createTypeBadges(types) {
    const typeBadges = await Promise.all(types.map(async (typeInfo) => {
        const typeName = typeInfo.type.name;
        const spriteUrl = await getTypeSprite(typeName);
        
        if (spriteUrl) {
            return `<div class="type-badge" data-type="${typeName}">
                        <img src="${spriteUrl}" alt="${typeName}">
                    </div>`;
        } else {
            return `<div class="type-badge" data-type="${typeName}">
                    </div>`;
        }
    }));
    
    return typeBadges.join('');
}

function playPokemonCry(pokemon) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    if (pokemon.cries && pokemon.cries.latest) {
        currentAudio = new Audio(pokemon.cries.latest);
        currentAudio.volume = 0.3;
        
        currentAudio.play().catch(error => {
            console.log(`Could not play cry for ${pokemon.name}:`, error);
            if (pokemon.cries.legacy) {
                currentAudio = new Audio(pokemon.cries.legacy);
                currentAudio.volume = 0.3;
                currentAudio.play().catch(fallbackError => {
                    console.log(`Could not play legacy cry for ${pokemon.name}:`, fallbackError);
                });
            }
        });
    }
}

async function createPokemonCard(pokemon, isDetailed = false) {
    const typeBadgesHtml = await createTypeBadges(pokemon.types);
    
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.style.cursor = 'pointer';
    
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" loading="lazy">
        <h3>#${pokemon.id.toString().padStart(3, '0')} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <div class="types-container">
            ${typeBadgesHtml}
        </div>
        <div class="pokemon-info">Height: ${pokemon.height / 10}m</div>
        <div class="pokemon-info">Weight: ${pokemon.weight / 10}kg</div>
        <div class="pokemon-info">Base Experience: ${pokemon.base_experience || 'Unknown'}</div>
        ${isDetailed ? `
            <div class="pokemon-info">Abilities: ${pokemon.abilities.map(a => a.ability.name).join(', ')}</div>
            ${pokemon.held_items.length > 0 ? `<div class="pokemon-info">Held Items: ${pokemon.held_items.map(i => i.item.name).join(', ')}</div>` : ''}
            <div class="pokemon-info">Stats:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 10px 0; font-size: 0.8em;">
                ${pokemon.stats.map(stat => `
                    <div>${stat.stat.name}: ${stat.base_stat}</div>
                `).join('')}
            </div>
        ` : '<div style="margin-top: 10px; font-size: 0.9em; color: #667eea;">Click for details →</div>'}
    `;
    
    card.addEventListener('click', () => {
        playPokemonCry(pokemon);
        if (!isDetailed) {
            showDetailedView(pokemon);
            goToPage(2);
        }
    });
    
    return card;
}

async function showDetailedView(pokemon) {
    const detailedContainer = document.getElementById('detailed-view');
    detailedContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading details...</p></div>';
    
    const detailedCard = await createPokemonCard(pokemon, true);
    detailedContainer.innerHTML = '';
    detailedContainer.appendChild(detailedCard);
}

function updateNavigation() {
    const pageInfo = document.getElementById('pageInfo');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    
    if (filteredPokemon.length === 0) {
        pageInfo.textContent = 'No Pokémon found';
        prevButton.disabled = true;
        nextButton.disabled = true;
        return;
    }
    
    pageInfo.textContent = `${currentPokemonIndex + 1} / ${filteredPokemon.length}`;
    prevButton.disabled = currentPokemonIndex === 0;
    nextButton.disabled = currentPokemonIndex === filteredPokemon.length - 1;
}

async function displayPokemon(index = currentPokemonIndex) {
    const container = document.getElementById('pokemon-container');
    
    if (filteredPokemon.length === 0) {
        container.innerHTML = '<p style="text-align: center; margin: 50px 0; color: #666;">No Pokémon found. Try a different search term.</p>';
        updateNavigation();
        return;
    }
    
    const pokemon = filteredPokemon[index];
    container.innerHTML = '';
    
    const card = await createPokemonCard(pokemon);
    container.appendChild(card);
    
    currentPokemonIndex = index;
    updateNavigation();
}

function searchPokemon(query) {
    if (!query.trim()) {
        filteredPokemon = [...pokemonData];
    } else {
        const searchTerm = query.toLowerCase().trim();
        filteredPokemon = pokemonData.filter(pokemon => {
            const matchesName = pokemon.name.toLowerCase().includes(searchTerm);
            const matchesId = pokemon.id.toString() === searchTerm;
            return matchesName || matchesId;
        });
    }
    
    currentPokemonIndex = 0;
    displayPokemon(0);
}

// Event listeners
document.getElementById('prev-button').addEventListener('click', () => {
    if (currentPokemonIndex > 0) {
        displayPokemon(currentPokemonIndex - 1);
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    if (currentPokemonIndex < filteredPokemon.length - 1) {
        displayPokemon(currentPokemonIndex + 1);
    }
});

document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    searchPokemon(query);
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value;
        searchPokemon(query);
    }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value;
    searchPokemon(query);
});

// Load Pokemon data
async function loadPokemonData() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=900');
        const data = await response.json();
        
        const promises = data.results.map(async (pokemon) => {
            const pokemonResponse = await fetch(pokemon.url);
            return await pokemonResponse.json();
        });
        
        pokemonData = await Promise.all(promises);
        pokemonData.sort((a, b) => a.id - b.id);
        
        filteredPokemon = [...pokemonData];
        await displayPokemon(0);
        
        console.log(`Loaded ${pokemonData.length} Pokémon!`);
    } catch (error) {
        console.error('Error loading Pokémon data:', error);
        document.getElementById('pokemon-container').innerHTML = 
            '<p style="text-align: center; color: #ff6b6b; margin: 50px 0;">Error loading Pokémon data. Please try again later.</p>';
    }
}

// Initialize the app
loadPokemonData();