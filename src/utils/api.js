import axios from "axios";

const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchPopularActors = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/person/popular`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });

    // Filtering criteria
    const filteredActors = response.data.results.filter((actor) => {
      return (
        actor.popularity > 10 &&
        actor.profile_path &&
        actor.known_for_department === "Acting"
      );
    });

    return filteredActors;
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
    return response.data.cast;
  } catch (error) {
    console.error("Error fetching movies by actor from TMDB API", error);
    return [];
  }
};
