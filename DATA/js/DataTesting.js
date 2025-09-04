const pokemonDiv = document.querySelector(".Pokemons");

function testAll() {
  console.log(pokemonDataGlobal);
  console.log(EvolutionDataGlobal);
}

function testingWithHTML() {
  pokemonDataGlobal.forEach((element) => {
    pokemonDiv.innerHTML += `<p>${element.name}</p>`;
  });
}

function getSpeciesNames(chain) {
  // Recursively collect all species names in the chain
  let names = [chain.species.name];
  chain.evolves_to.forEach((evo) => {
    names = names.concat(getSpeciesNames(evo));
  });
  return names;
}

function findNextEvolution(chain, name) {
  // Recursively search for the Pokémon and return its next evolution name(s)
  if (chain.species.name === name) {
    if (chain.evolves_to.length > 0) {
      // Return all possible next evolution names
      return chain.evolves_to.map((evo) => evo.species.name).join(", ");
    } else {
      return ""; // No evolution
    }
  }
  for (let evo of chain.evolves_to) {
    const result = findNextEvolution(evo, name);
    if (result !== null) return result;
  }
  return null;
}

function mapPokemonToEvolutionChain() {
  const nameToChainId = {};

  EvolutionDataGlobal.forEach((evoChain) => {
    const speciesNames = getSpeciesNames(evoChain.chain);
    speciesNames.forEach((name) => {
      nameToChainId[name] = evoChain.id;
    });
  });

  // Pick 2 random Pokémon
  const randomPokemons = [];
  const usedIndexes = new Set();
  while (randomPokemons.length < 2 && pokemonDataGlobal.length > 0) {
    const idx = Math.floor(Math.random() * pokemonDataGlobal.length);
    if (!usedIndexes.has(idx)) {
      randomPokemons.push(pokemonDataGlobal[idx]);
      usedIndexes.add(idx);
    }
  }

  pokemonDiv.innerHTML = "";

  randomPokemons.forEach((pokemon) => {
    const chainId = nameToChainId[pokemon.name];
    let nextEvolution = "";
    const evoChainObj = EvolutionDataGlobal.find((e) => e.id === chainId);
    if (evoChainObj) {
      const result = findNextEvolution(evoChainObj.chain, pokemon.name);
      nextEvolution =
        result !== ""
          ? `<span class="HasEvol">and evolves to ${result}</span>`
          : `<span class="DoesNotEvol">and doesn't evolve further</span>`;
    }

    // Build stats HTML
    let statsHTML = "<ul>";
    pokemon.stats.forEach((statObj) => {
      statsHTML += `<li>${statObj.stat.name}: ${statObj.base_stat}</li>`;
    });
    statsHTML += "</ul>";

    const PokemonHTMLdata = `<img src="${pokemon.sprites.front_default}">
    <p>${pokemon.name} belongs to evolution chain ${chainId} ${nextEvolution}</p>
    <p>Stats:</p>
    ${statsHTML}
    `;

    pokemonDiv.innerHTML += `<div class="Pokemon-${pokemon.id}">${PokemonHTMLdata}</div>`;
  });
}
