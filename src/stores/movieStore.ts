import { writable } from 'svelte/store';

// Define types for actors, movies, and hints
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

// Create stores with the appropriate types
export const actors = writable<Actor[]>([]);
export const movies = writable<Movie[][]>([]);
export const hints = writable<string[][]>([]);
