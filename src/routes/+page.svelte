<script lang="ts">
    import { onMount } from 'svelte';
    import { actors, movies, hints } from '../stores/movieStore';
    import { fetchPopularActors, fetchMoviesByActor } from '../utils/api';

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
        name?: string;
    }

    const getRandomActors = (actorList: Actor[], num: number): Actor[] => {
        const shuffled = [...actorList].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };

    const generateHints = (movies: Movie[]): string[] => {
        return [
            'Title Starts with A-H (Ignore "the")',
            'Title Starts with I-P (Ignore "the")',
            'Double Letter Word in Title'
        ];
    };

    onMount(async () => {
        let dailyActors: Actor[] = JSON.parse(localStorage.getItem('dailyActors') || 'null');
        let dailyMovies: Movie[][] = JSON.parse(localStorage.getItem('dailyMovies') || 'null');
        let dailyHints: string[][] = JSON.parse(localStorage.getItem('dailyHints') || 'null');

        if (!dailyActors || !dailyMovies || !dailyHints) {
            const popularActors: Actor[] = await fetchPopularActors();
            if (popularActors.length === 0) {
                console.error("No popular actors fetched");
                return;
            }
            const filteredActors: Actor[] = popularActors.filter(actor => actor.known_for.some(movie => movie.media_type === 'movie'));
            dailyActors = getRandomActors(filteredActors, 3);
            dailyMovies = await Promise.all(dailyActors.map(async actor => {
                const actorMovies: Movie[] = await fetchMoviesByActor(actor.id);
                return actorMovies.slice(0, 3); // limit to 3 movies per actor
            }));
            dailyHints = dailyMovies.map(generateHints);

            localStorage.setItem('dailyActors', JSON.stringify(dailyActors));
            localStorage.setItem('dailyMovies', JSON.stringify(dailyMovies));
            localStorage.setItem('dailyHints', JSON.stringify(dailyHints));
        }

        actors.set(dailyActors);
        movies.set(dailyMovies);
        hints.set(dailyHints);
    });

    let actorData: Actor[] = [];
    let movieData: Movie[][] = [];
    let hintData: string[][] = [];
    $: actorData = $actors || [];
    $: movieData = $movies || [];
    $: hintData = $hints || [];
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex items-center justify-center min-h-screen">
    <div class="grid grid-cols-4 grid-rows-4 w-full max-w-4xl border border-black">
        <!-- Empty top-left cell -->
        <div class="flex items-center justify-center border border-black bg-gray-200"></div>

        <!-- Column hints -->
        {#if hintData.length > 0}
            {#each hintData[0] as hint}
                <div class="flex items-center justify-center border border-black bg-gray-200 h-24 text-center">
                    <p>{hint}</p>
                </div>
            {/each}
        {/if}

        <!-- Actor names and movie cells -->
        {#if actorData.length > 0 && hintData.length > 0}
            {#each actorData as actor, rowIndex}
                <div class="flex items-center justify-center border border-black bg-gray-200">
                    <p>{actor.name}</p>
                </div>
                {#each hintData[rowIndex] as hint, colIndex}
                    <div class="flex items-center justify-center bg-gray-400 text-xl hover:bg-gray-700 h-48 border border-black" id="{`${rowIndex}-${colIndex}`}">
                        <!-- Display movie title if available -->
                        {#if movieData[rowIndex] && movieData[rowIndex][colIndex]}
                            <p>{movieData[rowIndex][colIndex].title}</p>
                        {/if}
                    </div>
                {/each}
            {/each}
        {/if}
    </div>
</div>

<style>
    .grid div {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
