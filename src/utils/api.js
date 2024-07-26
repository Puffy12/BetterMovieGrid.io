import axios from "axios";

const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchPopularActors = async (pages = 50) => {
  try {
    let allActors = [];

    for (let page = 1; page <= pages; page++) {
      const response = await axios.get(`${BASE_URL}/person/popular`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
        params: {
          language: "en-US",
          page,
        },
      });

      const filteredActors = response.data.results.filter((actor) => {
        return (
          actor.popularity > 10 &&
          actor.profile_path &&
          actor.known_for_department === "Acting" &&
          actor.known_for[0].original_language === "en"
        );
      });

      allActors = allActors.concat(filteredActors);
    }

    return allActors;
  } catch (error) {
    console.error("Error fetching popular actors from TMDB API", error);
    return [];
  }
};

export const fetchMoviesByActor = async (actorId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/person/${actorId}/movie_credits`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    return response.data.cast.map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids,
    }));
  } catch (error) {
    console.error("Error fetching movies by actor from TMDB API", error);
    return [];
  }
};

