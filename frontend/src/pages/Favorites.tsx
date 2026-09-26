import { useEffect, useState } from "react";
import { Heart, Satellite, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getFavorites,
  removeFavorite,
  type FavoriteSatellite,
} from "../services/favoriteService";

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<
    FavoriteSatellite[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadFavorites() {
    try {
      setLoading(true);
      setError("");

      const result = await getFavorites();

      setFavorites(result);
    } catch {
      setError("Unable to load your favorite satellites.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  async function handleRemove(
    satelliteName: string
  ) {
    try {
      setRemoving(satelliteName);
      setError("");

      await removeFavorite(satelliteName);

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            favorite.satellite_name !== satelliteName
        )
      );
    } catch {
      setError(
        `Unable to remove ${satelliteName} from favorites.`
      );
    } finally {
      setRemoving(null);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            PERSONAL COLLECTION
          </div>

          <h1>Favorites</h1>

          <p>
            Keep your most interesting satellites close
            for quick access.
          </p>
        </div>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="page-loading">
          Loading your favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div className="page-empty">
          <Heart size={28} />

          <h2>No favorite satellites yet</h2>

          <p>
            Explore the satellite catalog and add
            satellites you want to track.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/satellites")}
          >
            <Satellite size={16} />
            Explore Satellites
          </button>
        </div>
      ) : (
        <section className="favorites-grid">
          {favorites.map((favorite) => (
            <article
              key={favorite.id}
              className="favorite-card"
            >
              <div className="favorite-card-icon">
                <Satellite size={22} />
              </div>

              <div className="favorite-card-content">
                <span className="eyebrow">
                  FAVORITE SATELLITE
                </span>

                <h2>
                  {favorite.satellite_name}
                </h2>

                <p>
                  Added to your collection
                </p>
              </div>

              <div className="favorite-card-actions">
                <button
                  className="favorite-track-button"
                  onClick={() =>
                    navigate(
                      `/satellites/${encodeURIComponent(
                        favorite.satellite_name
                      )}`
                    )
                  }
                >
                  TRACK
                </button>

                <button
                  className="favorite-remove-button"
                  onClick={() =>
                    handleRemove(
                      favorite.satellite_name
                    )
                  }
                  disabled={
                    removing ===
                    favorite.satellite_name
                  }
                  title="Remove from favorites"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}