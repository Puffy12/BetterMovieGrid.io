<script lang="ts">
  import SearchModal from "../components/SearchModal.svelte";
  import HintModal from "../components/HintModal.svelte";
  import ActorModal from "../components/ActorModal.svelte";
  import GameOverModal from "../components/GameOverModal.svelte";
  import { onMount } from "svelte";
  import { actors, hints } from "../stores/movieStore";
  import { fetchPopularActors, fetchMoviesByActor } from "../utils/api";
  import { hintOptions, hintDescriptions } from "../utils/data";
  import { fetchCollectionImages, fetchActorPhoto, SearchForMovieByActorXorGenre } from "../utils/functions";
  import toast, { Toaster } from 'svelte-french-toast';

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
    isLoading = false;
  });


  let actorData: Actor[] = [];
  let hintData: string[][] = [];
  $: actorData = $actors || [];
  $: hintData = $hints || [];

  let imageSources: (string | null)[] = Array(9).fill(null);
  let isLoading = true;

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
        correctGuesses++;
        correctAnswers[cellId - 1] = movie.title;

        try {
          let image = await fetchCollectionImages(movie.title);
          if (image) {
            handleImageSubmit(cellId, image);
          } else {
            console.log("No image found for collection.");
          }
          toast.success(`Correct guess: ${movie.title}`);
          console.log(`Correct guess: ${movie.title}`);

        } catch (error) {
          console.error("Error fetching image:", error);
        }
      } else {
        toast.error(`Incorrect guess: ${movie.title}`)
        console.log(`Incorrect guess: ${movie.title}`);
      }
    } else {
      toast.error(`Incorrect guess: ${movie.title}`)
      console.log(`Incorrect guess: ${movie.title}`);
    }

    remainingGuesses--;
    if (remainingGuesses === 0) {
      showGameOverModal = true;
      populatePossibleAnswers();
    }
  };

  const populatePossibleAnswers = () => {
    // Logic to fill possibleAnswers array with correct answers
    /*
    actorData.forEach(element => {
      const actorsMovies = SearchForMovieByActorXorGenre(element.name);
      console.log(element.name);
      console.log(actorsMovies);
      //who know if this works fr 
    });
    console.log(possibleAnswers);
    */
  };

  const giveUp = () => {
    showGameOverModal = true;
    populatePossibleAnswers();
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

  let remainingGuesses = 9;
  let correctGuesses = 0;
  let correctAnswers: (string | null)[] = Array(9).fill(null);
  let possibleAnswers: (string | null)[] = Array(9).fill(null);
  let showGameOverModal = false;
</script>

<div class="flex items-center justify-center min-h-screen">
  <Toaster />
 {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
      <div class="loader w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
    </div>
  {:else}
  <div class="grid grid-cols-4 grid-rows-4 -translate-x-12 w-full max-w-lg border border-transparent">
    <!-- Empty top-left cell -->
    <div class="flex items-center justify-start border border-transparent bg-transparent"></div>

    <!-- Column hints -->
    {#if hintData.length > 0}
      {#each hintData[0] as hint}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="flex items-center justify-center border border-transparent bg-transparent h-24 text-center cursor-pointer" on:click={() => openHintModal(hint)}>
          <p>{hint}</p>
        </div>
      {/each}
    {/if}

    <!-- Actor names and movie cells -->
    {#if actorData.length > 0 && hintData.length > 0}
      {#each actorData as actor, rowIndex}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="flex items-center justify-center border border-transparent bg-transparent m-2 cursor-pointer" on:click={() => openActorModal(actor)}>
          <p>{actor.name}</p>
        </div>
        {#each Array(3) as _, colIndex}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div role="button" tabindex="0" class="flex items-center justify-center bg-gray-400 text-xl hover:bg-gray-700 h-48 border border-black cursor-pointer relative" on:click={() => openModal(rowIndex * 3 + colIndex + 1)}>
            {#if imageSources[rowIndex * 3 + colIndex]}
              <img src={imageSources[rowIndex * 3 + colIndex]} alt={`Image for cell ${rowIndex * 3 + colIndex + 1}`} class="object-cover w-full h-full" />
            {:else}
              <span class="text-white text-2xl font-bold">{rowIndex * 3 + colIndex + 1}</span>
            {/if}
          </div>
        {/each}
      {/each}
    {/if}
  </div>

  <div class="text-center mb-4 inline-block">
    <p class="font-medium mb-2" >Remaining Guesses:</p>
    <h1 class="mb-2" >{remainingGuesses}</h1>
    <button on:click={giveUp} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Give Up</button>
  </div>

  {/if}
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

<GameOverModal
  visible={showGameOverModal}
  correctGuesses={correctGuesses}
  correctAnswers={correctAnswers}
  possibleAnswers={possibleAnswers}
  onClose={() => { showGameOverModal = false,window.location.reload(); //When the game is over and they close the module 
; }} 
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
