<script lang="ts">
    import SearchModal from '../components/SearchModal.svelte';
    import HintModal from '../components/HintModal.svelte';
    import ActorModal from '../components/ActorModal.svelte';
    import { onMount } from 'svelte';
    import { actors, hints } from '../stores/movieStore';
    import { fetchPopularActors, fetchMoviesByActor } from '../utils/api';
    import axios from 'axios';
  
    const BASE_URL = "https://api.themoviedb.org/3";
  
    interface Actor {
      id: number;
      name: string;
      popularity: number;
      profile_path: string | null;
      known_for: Array<{ media_type: string; title?: string; name?: string }>;
    }
  
    const getRandomActors = (actorList: Actor[], num: number): Actor[] => {
      const shuffled = [...actorList].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    };
  
    const generateHints = (actors: Actor[]): string[] => [
      'Title Starts with A-H (Ignore "the")',
      'Title Starts with I-P (Ignore "the")',
      'Double Letter Word in Title'
    ];
  
    // Hint descriptions
    const hintDescriptions = {
      'Title Starts with A-H (Ignore "the")': 'This hint indicates that the movie title begins with a letter from A to H, not considering the initial "the".',
      'Title Starts with I-P (Ignore "the")': 'This hint suggests that the movie title starts with a letter from I to P, again ignoring any leading "the".',
      'Double Letter Word in Title': 'This hint reveals that the movie title contains a word with double letters, such as "letter" or "butter".'
    };
  
    onMount(async () => {
    const popularActors: Actor[] = await fetchPopularActors();
    if (popularActors.length === 0) {
        console.error("No popular actors fetched");
        return;
    }
    const filteredActors: Actor[] = popularActors.filter(actor => actor.known_for.some(movie => movie.media_type === 'movie'));
    const dailyActors = getRandomActors(filteredActors, 3);
    const dailyHints = dailyActors.map(generateHints);

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
        const response = await axios.get(
          `${BASE_URL}/person/${actorId}/images`,
          {
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YzdmNGRiMGY5OTdjZWYxNGVhZDY2ZjA0ZGNhMzQ3YyIsIm5iZiI6MTcyMTY3ODM5Ny41MDM4MDMsInN1YiI6IjY2OWViOTliMmJiNDcyOWEzNWQxNzY4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jkt6au6iiXeO6abHLuPvWWxSQTyv-jyGUeDCK5KiRcM",
            },
          }
        );
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
  
    const fetchCollectionImages = async (collectionId: number): Promise<string | null> => {
      try {
        const response = await axios.get(
          `${BASE_URL}/collection/${collectionId}/images`,
          {
            headers: {
              accept: "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YzdmNGRiMGY5OTdjZWYxNGVhZDY2ZjA0ZGNhMzQ3YyIsIm5iZiI6MTcyMTY3ODM5Ny41MDM4MDMsInN1YiI6IjY2OWViOTliMmJiNDcyOWEzNWQxNzY4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jkt6au6iiXeO6abHLuPvWWxSQTyv-jyGUeDCK5KiRcM",
            },
          }
        );
        const imageResults = response.data;
  
        if (imageResults.backdrops.length > 0) {
          return `https://image.tmdb.org/t/p/w500${imageResults.backdrops[0].file_path}`;
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
    let hintText: string = '';
    let hintDescription: string = '';

    let showActorModal: boolean = false;
    let selectedActorName: string = '';
    let selectedActorPhoto: string | null = null;
    let actorPhotos: { [key: string]: string } = {};
  
    const openHintModal = (hint: string) => {
        hintText = hint;
        hintDescription = hintDescriptions[hint as keyof typeof hintDescriptions] || 'Description not available.';
        showHintModal = true;
    };
  
    const closeHintModal = () => {
      showHintModal = false;
      hintText = '';
      hintDescription = '';
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
      const actor = actorData[Math.floor((cellId - 1) / 3)];
      const movies = await fetchMoviesByActor(actor.id);
      const isCorrect = movies.some(m => m.id === movie.id);
  
      if (isCorrect) {
        try {
          let image = await fetchCollectionImages(10);
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
    };

    const openActorModal = async (actor: Actor) => {
        selectedActorName = actor.name;
        selectedActorPhoto = actorPhotos[actor.name];
        showActorModal = true;
    };

    const closeActorModal = () => {
        showActorModal = false;
        selectedActorName = '';
        selectedActorPhoto = null;
    };
  </script>
  
  <div class="flex items-center justify-center min-h-screen">
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
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="flex items-center justify-center border border-transparent bg-transparent m-2 cursor-pointer" on:click={() => openActorModal(actor)}>
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
                <img src={imageSources[rowIndex * 3 + colIndex]} alt={`Image for cell ${rowIndex * 3 + colIndex + 1}`} class="object-cover w-full h-full"/>
              {:else}
                <span class="text-white text-2xl font-bold">{rowIndex * 3 + colIndex + 1}</span>
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
    hintText={hintText} 
    hintDescription={hintDescription} 
    onClose={closeHintModal} />
    
  <SearchModal 
    visible={showModal} 
    onClose={closeModal} 
    cellId={selectedCellId} 
    on:submitGuess={handleGuessSubmit} />
  
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
  