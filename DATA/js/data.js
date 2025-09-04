let offset = 0;

let API_Pokemon = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=151`;

let API_Evolve = `https://pokeapi.co/api/v2/evolution-chain?offset=${offset}&limit=78`;

let pokemonDataGlobal;

let EvolutionDataGlobal;

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

// Fetches evolution chain for the first 151 Pokemon, although some evolutions weren't introduced until later generations
// We'll have to figure out what to do with those extra evolutions
fetch(API_Evolve)
  .then((response) => response.json())
  .then((data) => {
    console.log(data.results.map((evolve) => evolve.url));

    // Get all URLS
    let EvolveUrls = data.results.map((evolve) => evolve.url);

    let allEvolutionData = [];

    // get data from each Evolution URL
    let fetchPromises = EvolveUrls.map((url) =>
      fetch(url)
        .then((response) => response.json())
        .then((EvolveData) => {
          allEvolutionData.push(EvolveData);
        })
    );
    // Set the global EvolutionData variable to the an array of all Evolutions
    Promise.all(fetchPromises).then(() => {
      // Now we can call it globally
      EvolutionDataGlobal = allEvolutionData;
    });
  });
