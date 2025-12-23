import React, { useState, useEffect } from 'react';
import { Search, Star, Calendar, Popcorn, Film, TrendingUp } from 'lucide-react';

export default function MovieLens() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // DEBOUNCING - Delay API calls until user stops typing
  useEffect(() => {
    // Don't search if term is too short
    if (searchTerm.length < 3) {
      setMovies([]);
      return;
    }

    // Set up a timer
    const timer = setTimeout(() => {
      searchMovies(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    // CLEANUP FUNCTION - Cancel timer if user keeps typing
    // This is crucial for debouncing!
    return () => clearTimeout(timer);
  }, [searchTerm]); // Re-run when searchTerm changes

  // ASYNC FUNCTION - Fetch movies from API
  const searchMovies = async (query) => {
    setLoading(true);
    setError(null);

    try {
      // Using OMDB API (free, but limited)
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=fcb312b2&s=${encodeURIComponent(query)}&type=movie`
      );
      

      const data = await response.json();

      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setError(data.Error);
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed movie info when clicked
  const fetchMovieDetails = async (imdbID) => {
    try {
        const response = await fetch(
            `https://www.omdbapi.com/?apikey=fcb312b2&i=${imdbID}&plot=full`
          );
      const data = await response.json();
      setSelectedMovie(data);
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Popcorn className="text-yellow-400" size={48} />
            <h1 className="text-5xl font-bold text-white">Movie Lens</h1>
          </div>
          <p className="text-blue-200 text-lg">Search millions of movies instantly</p>
        </div>

        {/* SEARCH BAR - Controlled Input with Debouncing */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for movies... (e.g., Inception, Avatar, Matrix)"
              className="w-full pl-14 pr-4 py-4 bg-white rounded-xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500"
            />
          </div>
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="mt-3 text-blue-200 text-sm">Type at least 3 characters to search</p>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent"></div>
            <p className="mt-4 text-blue-200 text-lg">Searching movies...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="bg-red-500/20 backdrop-blur border border-red-400 rounded-xl p-6 text-center">
            <p className="text-red-200 text-lg font-semibold">{error}</p>
          </div>
        )}

        {/* MOVIE GRID - Mapping over array to render components */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                onClick={() => fetchMovieDetails(movie.imdbID)}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && searchTerm.length >= 3 && movies.length === 0 && (
          <div className="text-center py-12">
            <Film className="mx-auto text-blue-300 mb-4" size={64} />
            <p className="text-blue-200 text-xl">No movies found. Try a different search!</p>
          </div>
        )}

        {/* INITIAL STATE - Show popular searches */}
        {!searchTerm && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-yellow-400" size={28} />
              <h2 className="text-2xl font-bold text-white">Try searching for:</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Inception', 'The Matrix', 'Interstellar', 'Avatar', 'The Dark Knight', 'Pulp Fiction'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODAL - Movie Details */}
        {selectedMovie && (
          <MovieModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </div>
    </div>
  );
}

// CHILD COMPONENT - Movie Card with Props
function MovieCard({ movie, onClick }) {
  const hasPoster = movie.Poster && movie.Poster !== 'N/A';

  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all hover:shadow-2xl group"
    >
      <div className="aspect-[2/3] bg-gray-800 relative overflow-hidden">
        {hasPoster ? (
          <img
            src={movie.Poster}
            alt={movie.Title}
            className="w-full h-full object-cover group-hover:opacity-80 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="text-gray-600" size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
          <p className="text-white text-sm font-medium">Click for details</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
          {movie.Title}
        </h3>
        <div className="flex items-center gap-2 text-blue-200 text-xs">
          <Calendar size={14} />
          <span>{movie.Year}</span>
        </div>
      </div>
    </div>
  );
}

// MODAL COMPONENT - Conditional rendering with backdrop
function MovieModal({ movie, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 transition"
          >
            ✕
          </button>

          {/* Movie poster header */}
          {movie.Poster && movie.Poster !== 'N/A' && (
            <div className="relative h-64 bg-gray-800">
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
              />
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="relative h-full mx-auto object-contain"
              />
            </div>
          )}

          {/* Movie details */}
          <div className="p-8">
            <h2 className="text-4xl font-bold text-white mb-4">{movie.Title}</h2>

            <div className="flex flex-wrap gap-4 mb-6">
              {movie.imdbRating !== 'N/A' && (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
                  <Star className="text-yellow-400" size={20} fill="currentColor" />
                  <span className="text-yellow-400 font-bold">{movie.imdbRating}/10</span>
                </div>
              )}
              <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg font-medium">
                {movie.Year}
              </span>
              <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg font-medium">
                {movie.Runtime}
              </span>
              <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg font-medium">
                {movie.Rated}
              </span>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Genre</h3>
                <p>{movie.Genre}</p>
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Plot</h3>
                <p className="leading-relaxed">{movie.Plot}</p>
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Director</h3>
                <p>{movie.Director}</p>
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Cast</h3>
                <p>{movie.Actors}</p>
              </div>
              {movie.Awards !== 'N/A' && (
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">Awards</h3>
                  <p className="text-yellow-300">{movie.Awards}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}