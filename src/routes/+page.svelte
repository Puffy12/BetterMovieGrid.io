<script lang="ts">
  import SearchModal from "../components/SearchModal.svelte";
  import HintModal from "../components/HintModal.svelte";
  import ActorModal from "../components/ActorModal.svelte";
  import { onMount } from "svelte";
  import { actors, hints } from "../stores/movieStore";
  import { fetchPopularActors, fetchMoviesByActor } from "../utils/api";
  import axios from "axios";

  const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
  const BASE_URL = "https://api.themoviedb.org/3";

  interface Actor {
    id: number;
    name: string;
    popularity: number;
    profile_path: string | null;
    known_for: Array<{ media_type: string; title?: string; name?: string }>;
  }

  interface Movie {
    id: number;
    title: string;
    release_date: string;
    genre_ids: number[];
  }

  const hintOptions = [
    'Title Starts with A-H (Ignore "the")',
    'Title Starts with I-P (Ignore "the")',
    'Title Starts with Q-Z (Ignore "the")',
    "Double Letter Word in Title",
    'One Word Title (Ignore "the")',
    "Three or More Word Title",
    "Released From: 2010-2024",
    "Released From: 1990-2010",
    "Pilot Released From: 1990-2024",
    "Genre: Action",
    "Genre: Comedy",
    "Genre: Drama",
    "Genre: Thriller",
  ];

  const hintDescriptions = {
    'Title Starts with A-H (Ignore "the")':
      'This hint indicates that the movie title begins with a letter from A to H, not considering the initial "the".',
    'Title Starts with I-P (Ignore "the")':
      'This hint suggests that the movie title starts with a letter from I to P, again ignoring any leading "the".',
    'Title Starts with Q-Z (Ignore "the")':
      'This hint suggests that the movie title starts with a letter from Q to Z, again ignoring any leading "the".',
    "Double Letter Word in Title":
      'This hint reveals that the movie title contains a word with double letters, such as "letter" or "butter".',
    "One Word Title (Ignore 'the')":
      'This hint indicates that the movie title is a single word, ignoring any leading "the".',
    "Three or More Word Title":
      "This hint suggests that the movie title consists of three or more words.",
    "Released From: 2010-2024":
      "This hint indicates that the movie was released between the years 2010 and 2024.",
    "Released From: 1990-2010":
      "This hint indicates that the movie was released between the years 1990 and 2010.",
    "Pilot Released From: 1990-2024":
      "This hint suggests that the pilot episode of a series was released between 1990 and 2024.",
    "Genre: Action":
      "This hint suggests that the movie belongs to the action genre.",
    "Genre: Comedy":
      "This hint suggests that the movie belongs to the comedy genre.",
    "Genre: Drama":
      "This hint suggests that the movie belongs to the drama genre.",
    "Genre: Thriller":
      "This hint suggests that the movie belongs to the thriller genre.",
  };

  const getRandomActors = (actorList: Actor[], num: number): Actor[] => {
    const shuffled = [...actorList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  const fetchMovies = async (actorId: number): Promise<Movie[]> => {
    const movies = await fetchMoviesByActor(actorId);
    return movies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids,
    }));
  };

  const generateHintsForActor = (movies: Movie[]): string[] => {
    const validHints: string[] = [];

    const hintCheckers = {
      'Title Starts with A-H (Ignore "the")': (title: string) =>
        /^[A-H]/i.test(title.replace(/^the\s+/i, "")),
      'Title Starts with I-P (Ignore "the")': (title: string) =>
        /^[I-P]/i.test(title.replace(/^the\s+/i, "")),
      'Title Starts with Q-Z (Ignore "the")': (title: string) =>
        /^[Q-Z]/i.test(title.replace(/^the\s+/i, "")),
      "Double Letter Word in Title": (title: string) =>
        /\b\w*([a-z])\1\w*\b/i.test(title),
      "One Word Title (Ignore 'the')": (title: string) =>
        title.replace(/^the\s+/i, "").split(" ").length === 1,
      "Three or More Word Title": (title: string) =>
        title.split(" ").length >= 3,
      "Released From: 2010-2024": (release_date: string) => {
        const year = parseInt(release_date.split("-")[0], 10);
        return year >= 2010 && year <= 2024;
      },
      "Released From: 1990-2010": (release_date: string) => {
        const year = parseInt(release_date.split("-")[0], 10);
        return year >= 1990 && year <= 2010;
      },
      "Pilot Released From: 1990-2024": (release_date: string) => {
        const year = parseInt(release_date.split("-")[0], 10);
        return year >= 1990 && year <= 2024;
      },
      "Genre: Action": (genres: number[]) => genres.includes(28),
      "Genre: Comedy": (genres: number[]) => genres.includes(35),
      "Genre: Drama": (genres: number[]) => genres.includes(18),
      "Genre: Thriller": (genres: number[]) => genres.includes(53),
    };

    for (const hint in hintCheckers) {
      if (
        movies.some((movie) =>
          (hintCheckers as any)[hint](
            hint.includes("Title")
              ? movie.title
              : hint.includes("Released")
                ? movie.release_date
                : movie.genre_ids
          )
        )
      ) {
        validHints.push(hint);
      }
    }

    return validHints;
  };

  const generateHints = async (actor: Actor): Promise<string[]> => {
    const movies = await fetchMovies(actor.id);
    const validHints = generateHintsForActor(movies);
    const shuffledHints = validHints.sort(() => 0.5 - Math.random());
    return shuffledHints.slice(0, 3); // Select 3 random hints
  };

  onMount(async () => {
    const popularActors: Actor[] = await fetchPopularActors(50); // Fetch actors from 5 pages
    if (popularActors.length === 0) {
      console.error("No popular actors fetched");
      return;
    }
    const filteredActors: Actor[] = popularActors.filter((actor) =>
      actor.known_for.some((movie) => movie.media_type === "movie")
    );
    const dailyActors = getRandomActors(filteredActors, 3);

    // Fetch and store hints for each actor
    const dailyHintsPromises = dailyActors.map(generateHints);
    const dailyHints = await Promise.all(dailyHintsPromises);

    // Fetch and store actor photos
    for (const actor of dailyActors) {
      const photoUrl = await fetchActorPhoto(actor.id);
      if (photoUrl) {
        actorPhotos[actor.name] = photoUrl;
      }
    }

    actors.set(dailyActors);
    hints.set(dailyHints);
  });

  const fetchActorPhoto = async (actorId: number): Promise<string | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/person/${actorId}/images`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });
      const data = await response.data;
      if (data.profiles && data.profiles.length > 0) {
        return `https://image.tmdb.org/t/p/w300_and_h450_bestv2${data.profiles[0].file_path}`;
      }
      return null;
    } catch (error) {
      console.error("Error fetching actor photo:", error);
      return null;
    }
  };

  const fetchCollectionImages = async (
    movie: string
  ): Promise<string | null> => {
    let encodedString = encodeURIComponent(movie);
    try {
      const response = await axios.get(
        `${BASE_URL}/search/movie?query=${encodedString}&include_adult=false&language=en-US&page=1`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      );
      const imageResults = response.data;
      if (imageResults.results.length >= 1) {
        return `https://image.tmdb.org/t/p/w500${imageResults.results[0].poster_path}`;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching images from TMDB API", error);
      return null;
    }
  };

  let actorData: Actor[] = [];
  let hintData: string[][] = [];
  $: actorData = $actors || [];
  $: hintData = $hints || [];

  let imageSources: (string | null)[] = Array(9).fill(null);
  let showModal: boolean = false;
  let selectedCellId: number | null = null;

  let showHintModal: boolean = false;
  let hintText: string = "";
  let hintDescription: string = "";

  let showActorModal: boolean = false;
  let selectedActorName: string = "";
  let selectedActorPhoto: string | null = null;
  let actorPhotos: { [key: string]: string } = {};

  const openHintModal = (hint: string) => {
    hintText = hint;
    hintDescription =
      hintDescriptions[hint as keyof typeof hintDescriptions] ||
      "Description not available.";
    showHintModal = true;
  };

  const closeHintModal = () => {
    showHintModal = false;
    hintText = "";
    hintDescription = "";
  };

  const openModal = (cellId: number) => {
    selectedCellId = cellId;
    showModal = true;
  };

  const closeModal = () => {
    showModal = false;
    selectedCellId = null;
  };

  const handleImageSubmit = (cellId: number, imageUrl: string) => {
    if (cellId > 0 && cellId <= imageSources.length) {
      imageSources[cellId - 1] = imageUrl;
    }
  };

  const handleGuessSubmit = async (event: CustomEvent) => {
    const { cellId, movie } = event.detail;
    console.log(movie);
    const actor = actorData[Math.floor((cellId - 1) / 3)];
    const rowIndex = Math.floor((cellId - 1) / 3);
    const hint = hintData[rowIndex][(cellId - 1) % 3];

    const movies = await fetchMoviesByActor(actor.id);
    const isCorrectMovie = movies.some((m: any) => m.id === movie.id);

    if (isCorrectMovie) {
      const hintCheckers = {
        'Title Starts with A-H (Ignore "the")': (title: string) =>
          /^[A-H]/i.test(title.replace(/^the\s+/i, "")),
        'Title Starts with I-P (Ignore "the")': (title: string) =>
          /^[I-P]/i.test(title.replace(/^the\s+/i, "")),
        'Title Starts with Q-Z (Ignore "the")': (title: string) =>
          /^[Q-Z]/i.test(title.replace(/^the\s+/i, "")),
        "Double Letter Word in Title": (title: string) =>
          /\b\w*([a-z])\1\w*\b/i.test(title),
        "One Word Title (Ignore 'the')": (title: string) =>
          title.replace(/^the\s+/i, "").split(" ").length === 1,
        "Three or More Word Title": (title: string) =>
          title.split(" ").length >= 3,
        "Released From: 2010-2024": (release_date: string) => {
          const year = parseInt(release_date.split("-")[0], 10);
          return year >= 2010 && year <= 2024;
        },
        "Released From: 1990-2010": (release_date: string) => {
          const year = parseInt(release_date.split("-")[0], 10);
          return year >= 1990 && year <= 2010;
        },
        "Pilot Released From: 1990-2024": (release_date: string) => {
          const year = parseInt(release_date.split("-")[0], 10);
          return year >= 1990 && year <= 2024;
        },
        "Genre: Action": (genres: number[]) => genres && genres.includes(28),
        "Genre: Comedy": (genres: number[]) => genres && genres.includes(35),
        "Genre: Drama": (genres: number[]) => genres && genres.includes(18),
        "Genre: Thriller": (genres: number[]) => genres && genres.includes(53),
      };

      const isCorrectHint = (hintCheckers as any)[hint](
        hint.includes("Title")
          ? movie.title
          : hint.includes("Released")
            ? movie.release_date
            : movie.genre_ids
      );

      console.log(isCorrectMovie, isCorrectHint);

      if (isCorrectHint) {
        try {
          let image = await fetchCollectionImages(movie.title);
          if (image) {
            handleImageSubmit(cellId, image);
          } else {
            console.log("No image found for collection.");
          }
          console.log(`Correct guess: ${movie.title}`);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      } else {
        console.log(`Incorrect guess: ${movie.title}`);
      }
    } else {
      console.log(`Incorrect guess: ${movie.title}`);
    }
  };

  const openActorModal = async (actor: Actor) => {
    selectedActorName = actor.name;
    selectedActorPhoto = actorPhotos[actor.name];
    showActorModal = true;
  };

  const closeActorModal = () => {
    showActorModal = false;
    selectedActorName = "";
    selectedActorPhoto = null;
  };
</script>

<div class="flex items-center justify-center min-h-screen">
  <div
    class="grid grid-cols-4 grid-rows-4 -translate-x-12 w-full max-w-lg border border-transparent"
  >
    <!-- Empty top-left cell -->
    <div
      class="flex items-center justify-start border border-transparent bg-transparent"
    ></div>

    <!-- Column hints -->
    {#if hintData.length > 0}
      {#each hintData[0] as hint}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="flex items-center justify-center border border-transparent bg-transparent h-24 text-center cursor-pointer"
          on:click={() => openHintModal(hint)}
        >
          <p>{hint}</p>
        </div>
      {/each}
    {/if}

    <!-- Actor names and movie cells -->
    {#if actorData.length > 0 && hintData.length > 0}
      {#each actorData as actor, rowIndex}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="flex items-center justify-center border border-transparent bg-transparent m-2 cursor-pointer"
          on:click={() => openActorModal(actor)}
        >
          <p>{actor.name}</p>
        </div>
        {#each Array(3) as _, colIndex}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            role="button"
            tabindex="0"
            class="flex items-center justify-center bg-gray-400 text-xl hover:bg-gray-700 h-48 border border-black cursor-pointer relative"
            on:click={() => openModal(rowIndex * 3 + colIndex + 1)}
          >
            {#if imageSources[rowIndex * 3 + colIndex]}
              <img
                src={imageSources[rowIndex * 3 + colIndex]}
                alt={`Image for cell ${rowIndex * 3 + colIndex + 1}`}
                class="object-cover w-full h-full"
              />
            {:else}
              <span class="text-white text-2xl font-bold"
                >{rowIndex * 3 + colIndex + 1}</span
              >
            {/if}
          </div>
        {/each}
      {/each}
    {/if}
  </div>
</div>

{#if showActorModal}
  <ActorModal
    visible={showActorModal}
    actorName={selectedActorName}
    actorPhoto={selectedActorPhoto}
    onClose={closeActorModal}
  />
{/if}

<HintModal
  visible={showHintModal}
  {hintText}
  {hintDescription}
  onClose={closeHintModal}
/>

<SearchModal
  visible={showModal}
  onClose={closeModal}
  cellId={selectedCellId}
  on:submitGuess={handleGuessSubmit}
/>

<style>
  .grid {
    display: grid;
    grid-template-columns: auto repeat(3, 1fr);
    grid-template-rows: auto repeat(3, 1fr);
  }
  .grid div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
