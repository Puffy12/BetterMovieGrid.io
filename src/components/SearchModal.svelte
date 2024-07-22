<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import axios from "axios";

  const API_KEY = import.meta.env.TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  export let visible: boolean;
  export let cellId: number | null;
  export let onClose: () => void;
  export let onSubmitImage: (cellId: number, imageUrl: string) => void;

  let query = "";
  let movieResults: { id: number; title: string }[] = [];
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
        `${BASE_URL}/search/movie?query=${query}`,
        {
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YzdmNGRiMGY5OTdjZWYxNGVhZDY2ZjA0ZGNhMzQ3YyIsIm5iZiI6MTcyMTY3ODM5Ny41MDM4MDMsInN1YiI6IjY2OWViOTliMmJiNDcyOWEzNWQxNzY4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jkt6au6iiXeO6abHLuPvWWxSQTyv-jyGUeDCK5KiRcM",
          },
        }
      );
      movieResults = response.data.results.map(
        (movie: { id: number; title: string }) => ({
          id: movie.id,
          title: movie.title,
        })
      );
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
    onClose();
  };
</script>

{#if visible}
  <div class="modal-overlay" on:click={onClose}>
    <div class="modal" on:click|stopPropagation>
      <h2>Guess the Movie</h2>
      <input
        type="text"
        placeholder="Start typing a movie name..."
        bind:value={query}
        on:input={() => fetchMovies(query)}
      />
      {#if movieResults.length > 0}
        <ul class="results">
          {#each movieResults as movie}
            <li on:click={() => selectMovie(movie)}>{movie.title}</li>
          {/each}
        </ul>
      {/if}
      <button on:click={submitGuess} disabled={!selectedMovie}>Guess</button>
      <button on:click={onClose}>Cancel</button>
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
    width: 300px;
  }
  .results {
    list-style: none;
    padding: 0;
    margin: 10px 0;
  }
  .results li {
    padding: 5px;
    cursor: pointer;
  }
  .results li:hover {
    background: #ddd;
  }
</style>
