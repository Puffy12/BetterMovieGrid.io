<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import axios from "axios";

  const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
  const BASE_URL = "https://api.themoviedb.org/3";

  export let visible: boolean;
  export let cellId: number | null;
  export let onClose: () => void;
  export let onSubmitImage: (cellId: number, imageUrl: string) => void;

  let query = "";
  let movieResults: { id: number; title: string; popularity: number; release_date: string }[] = [];
  let selectedMovie: { id: number; title: string } | null = null;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (cellId) {
      query = "";
      movieResults = [];
      selectedMovie = null;
    }
  });

  const fetchMovies = async (query: string) => {
    if (query.length < 3) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/search/movie`,
        {
          params: {
            query: query,
            include_adult: false,
            language: "en-US",
            page: 1
          },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      );

      // Filter out movies with low popularity and sort by popularity and release date
      movieResults = response.data.results
        .filter((movie: { popularity: number }) => movie.popularity > 10)
        .sort((a: { popularity: number; release_date: string }, b: { popularity: number; release_date: string }) => {
          if (b.popularity === a.popularity) {
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
          }
          return b.popularity - a.popularity;
        })
        .slice(0, 10)
        .map((movie: { id: number; title: string }) => ({
          id: movie.id,
          title: movie.title
        }));
    } catch (error) {
      console.error("Error fetching movies from TMDB API", error);
    }
  };

  const selectMovie = (movie: { id: number; title: string }) => {
    selectedMovie = movie;
    query = movie.title;
    movieResults = [];
  };

  const submitGuess = () => {
    if (cellId && selectedMovie) {
      dispatch("submitGuess", { cellId, movie: selectedMovie });
    }
    query = "";
    movieResults = [];
    onClose();
  };

  const handleCancel = () => {
    query = "";
    movieResults = [];
    onClose();
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if visible}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-overlay" on:click={handleCancel}>
    
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal" on:click|stopPropagation>
      
      <h2 class="mb-2">Guess the Movie</h2>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="Start typing a movie name..."
        bind:value={query}
        on:input={() => fetchMovies(query)}
      />
      {#if movieResults.length > 0}
        <ul class="results">
          {#each movieResults as movie}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <li on:click={() => selectMovie(movie)}>{movie.title}</li>
          {/each}
        </ul>
      {/if}
      <button on:click={submitGuess} disabled={!selectedMovie} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Guess</button>
      <button on:click={handleCancel} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >Cancel</button>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 600px;
  }
  .results {
    list-style: none;
    padding: 0;
    margin: 10px 0;
    max-height: 150px; /* Adjust the height as needed */
    overflow-y: auto;
    border: 1px solid #ddd; /* Optional: Add a border */
  }
  .results li {
    padding: 5px;
    cursor: pointer;
  }
  .results li:hover {
    background: #ddd;
  }
</style>
