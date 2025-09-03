let offset = 0;

let API_Pokemon = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=151`;

let API_Evolve = `https://pokeapi.co/api/v2/evolution-chain`;

let pokemonDataGlobal;

// ------------ FETCHING ALL API DATA ----------- //

// Fetches the first 151 pokemon from the /pokemon from pokeAPI
fetch(API_Pokemon)
  .then((response) => response.json())
  .then((data) => {
    // Get all URLS
    let pokemonUrls = data.results.map((pokemon) => pokemon.url);

    let allPokemonData = [];
    // get data from each pokemons URL
    let fetchPromises = pokemonUrls.map((url) =>
      fetch(url)
        .then((response) => response.json())
        .then((pokemonData) => {
          allPokemonData.push(pokemonData);
        })
    );
    // Set the global pokemonData variable to the an array of all 151 pokemon
    Promise.all(fetchPromises).then(() => {
      // Now we can call it globally
      pokemonDataGlobal = allPokemonData;
    });
  });

function testAll() {
  console.log(pokemonDataGlobal[0].cries.latest);
}
