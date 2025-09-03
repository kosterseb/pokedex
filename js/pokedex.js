const url = 'https://pokeapi.co/api/v2/pokemon?limit=151';
const pokemonContainer = document.getElementById('pokemon-container');
let currentIndex = 0;
const pokemonCards = [];
const allPokemonData = []; // Store all Pokemon data for searching
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const pageInfo = document.getElementById('pageInfo');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Function to update page info and button states
function updateNavigation() {
    pageInfo.textContent = `${currentIndex + 1} / ${pokemonCards.length}`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === pokemonCards.length - 1;
}

// Function to show only one Pokemon at a time
function showPokemon(index) {
    pokemonCards.forEach((card, i) => {
        card.style.display = i === index ? 'block' : 'none';
    });
    updateNavigation();
}

// Function to create a Pokemon card element
function createPokemonCard(pokemonData) {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.innerHTML = `
        <img src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}">
        <h3>#${pokemonData.id} ${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</h3>
        <p>Type: ${pokemonData.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
        <p>Height: ${pokemonData.height / 10}m</p>
        <p>Weight: ${pokemonData.weight / 10}kg</p>
        <p>Base Experience: ${pokemonData.base_experience}</p>
        <p>Abilities: ${pokemonData.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ')}</p>
        ${pokemonData.held_items.length > 0 ? `<p>Held Items: ${pokemonData.held_items.map(itemInfo => itemInfo.item.name).join(', ')}</p>` : ''}
    `;
    return pokemonCard;

}


// Function to display Pokemon cards (for search results or full list)
function displayPokemon(pokemonDataArray) {
    // Clear current display
    pokemonContainer.innerHTML = '';
    pokemonCards.length = 0;
    
    // Create and add cards
    pokemonDataArray.forEach(pokemonData => {
        const card = createPokemonCard(pokemonData);
        pokemonContainer.appendChild(card);
        pokemonCards.push(card);
    });
    
    // Reset to first Pokemon and show it
    currentIndex = 0;
    if (pokemonCards.length > 0) {
        showPokemon(0);
    } else {
        pageInfo.textContent = 'No Pokémon found';
        prevButton.disabled = true;
        nextButton.disabled = true;
    }
}

// Search function
function searchPokemon(query) {
    if (!query.trim()) {
        // If empty search, show all Pokemon
        displayPokemon(allPokemonData);
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const filteredPokemon = allPokemonData.filter(pokemon => {
        // Search by name or ID
        const matchesName = pokemon.name.toLowerCase().includes(searchTerm);
        const matchesId = pokemon.id.toString() === searchTerm;
        return matchesName || matchesId;
    });
    
    displayPokemon(filteredPokemon);
}

// Navigation event listeners
prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        showPokemon(currentIndex);
    }
});

nextButton.addEventListener('click', () => {
    if (currentIndex < pokemonCards.length - 1) {
        currentIndex++;
        showPokemon(currentIndex);
    }
});

// Search event listeners
searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    searchPokemon(query);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value;
        searchPokemon(query);
    }
});

// Real-time search as user types (optional - you can remove this if you prefer only search on button click/enter)
searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    searchPokemon(query);
});

// Load all Pokemon data
fetch(url)
    .then(response => response.json())
    .then(data => {
        let pokemonLoaded = 0;
        const totalPokemon = data.results.length;
        
        data.results.forEach((pokemon, index) => {
            fetch(pokemon.url)
                .then(response => response.json())
                .then(pokemonData => {
                    // Store the data for searching
                    allPokemonData.push(pokemonData);

                    console.log(pokemonData);
                    
                    pokemonLoaded++;
                    
                    // When all Pokemon are loaded, display them
                    if (pokemonLoaded === totalPokemon) {
                        // Sort by ID to maintain proper order
                        allPokemonData.sort((a, b) => a.id - b.id);
                        displayPokemon(allPokemonData);
                        console.log(`Loaded ${totalPokemon} Pokémon!`);
                    }
                })
                
                .catch(error => console.error(`Error fetching ${pokemon.name}:`, error));
        });
    })
    .catch(error => console.error('Error fetching Pokémon data:', error));
