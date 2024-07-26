import axios from "axios";

const BEARER_TOKEN = import.meta.env.VITE_TMDB_BEARER_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchActorPhoto = async (actorId: number): Promise<string | null> => {
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

export const fetchCollectionImages = async (
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