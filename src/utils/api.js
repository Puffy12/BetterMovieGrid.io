import axios from "axios";

const API_KEY = import.meta.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchPopularActors = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/person/popular`, {
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YzdmNGRiMGY5OTdjZWYxNGVhZDY2ZjA0ZGNhMzQ3YyIsIm5iZiI6MTcyMTY3ODM5Ny41MDM4MDMsInN1YiI6IjY2OWViOTliMmJiNDcyOWEzNWQxNzY4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jkt6au6iiXeO6abHLuPvWWxSQTyv-jyGUeDCK5KiRcM",
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
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YzdmNGRiMGY5OTdjZWYxNGVhZDY2ZjA0ZGNhMzQ3YyIsIm5iZiI6MTcyMTY3ODM5Ny41MDM4MDMsInN1YiI6IjY2OWViOTliMmJiNDcyOWEzNWQxNzY4ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jkt6au6iiXeO6abHLuPvWWxSQTyv-jyGUeDCK5KiRcM",
        },
      }
    );
    return response.data.cast;
  } catch (error) {
    console.error("Error fetching movies by actor from TMDB API", error);
    return [];
  }
};
