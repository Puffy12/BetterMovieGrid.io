<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<script lang="ts">
    import InputModal from './InputModal.svelte';
	import SearchModal from '../components/SearchModal.svelte';
    import { onMount } from 'svelte';
    import { actors, hints } from '../stores/movieStore';
    import { fetchPopularActors, fetchMoviesByActor } from '../utils/api';

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

    onMount(async () => {
        const popularActors: Actor[] = await fetchPopularActors();
        if (popularActors.length === 0) {
            console.error("No popular actors fetched");
            return;
        }
        const filteredActors: Actor[] = popularActors.filter(actor => actor.known_for.some(movie => movie.media_type === 'movie'));
        const dailyActors = getRandomActors(filteredActors, 3);
        const dailyHints = dailyActors.map(generateHints);

        actors.set(dailyActors);
        hints.set(dailyHints);
    });

    let actorData: Actor[] = [];
    let hintData: string[][] = [];
    $: actorData = $actors || [];
    $: hintData = $hints || [];

    let imageSources: (string | null)[] = Array(9).fill(null);
    let showModal: boolean = false;
    let selectedCellId: number | null = null;

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
            // Do something for correct guess
            console.log(`Correct guess: ${movie.title}`);
        } else {
            // Do something for incorrect guess
            console.log(`Incorrect guess: ${movie.title}`);
        }
    };
</script>

<div class="flex items-center justify-center min-h-screen">
    <div class="grid grid-cols-4 grid-rows-4 -translate-x-12 w-full max-w-lg border border-transparent">
        <!-- Empty top-left cell -->
        <div class="flex items-center justify-start border border-transparent bg-transparent"></div>

        <!-- Column hints -->
        {#if hintData.length > 0}
            {#each hintData[0] as hint}
                <div class="flex items-center justify-center border border-transparent bg-transparent h-24 text-center">
                    <p>{hint}</p>
                </div>
            {/each}
        {/if}

        <!-- Actor names and movie cells -->
        {#if actorData.length > 0 && hintData.length > 0}
            {#each actorData as actor, rowIndex}
                <div class="flex items-center justify-center border border-transparent bg-transparent m-2">
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

<!-- 
'src/lib/images/BadBoys.jpg',
'src/lib/images/MySpy.jpg',
'src/lib/images/TheBoys.jpg',
'src/lib/images/ThoseAboutTo.jpg',
 -->