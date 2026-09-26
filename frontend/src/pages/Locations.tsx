import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createLocation,
  deleteLocation,
} from "../services/locationService";

import { useObserverLocation } from "../context/ObserverLocationContext";

export default function Locations() {
  const {
    locations,
    loading,
    activeLocation,
    setActiveLocation,
    refreshLocations,
  } = useObserverLocation();

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function resetForm() {
    setName("");
    setLatitude("");
    setLongitude("");
    setShowForm(false);
  }

  async function handleCreateLocation(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!name.trim()) {
      setError("Please enter a location name.");
      return;
    }

    if (
      !Number.isFinite(parsedLatitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90
    ) {
      setError("Latitude must be between -90 and 90.");
      return;
    }

    if (
      !Number.isFinite(parsedLongitude) ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      setError("Longitude must be between -180 and 180.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createLocation({
        name: name.trim(),
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });

      await refreshLocations();

      resetForm();
    } catch {
      setError("Unable to save this location.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteLocation(locationId: number) {
    try {
      setDeletingId(locationId);
      setError("");

      await deleteLocation(locationId);

      await refreshLocations();
      
    } catch {
      setError("Unable to delete this location.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page-shell locations-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OBSERVER CONFIGURATION</span>
          <h1>Saved Locations</h1>
          <p>
            Save observation points for satellite passes and darkness
            calculations.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Add Location
        </button>
      </div>

      {error && (
        <div className="inline-error">
          <X size={17} />
          <span>{error}</span>
        </div>
      )}

      {activeLocation && (
        <div className="active-location-banner">
          <span>ACTIVE OBSERVER LOCATION</span>

          <strong>{activeLocation.name}</strong>

          <small>
            {activeLocation.latitude.toFixed(4)}°,{" "}
            {activeLocation.longitude.toFixed(4)}°
          </small>
        </div>
      )}

      {showForm && (
        <section className="location-form-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">NEW OBSERVER POINT</span>
              <h2>Add a location</h2>
            </div>

            <button
              className="icon-button"
              onClick={resetForm}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form
            className="location-form"
            onSubmit={handleCreateLocation}
          >
            <label>
              Location name
              <input
                type="text"
                placeholder="Hyderabad"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <div className="location-coordinate-grid">
              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="17.3850"
                  value={latitude}
                  onChange={(event) =>
                    setLatitude(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="78.4867"
                  value={longitude}
                  onChange={(event) =>
                    setLongitude(event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="spin" size={17} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Save Location
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="locations-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR OBSERVATION POINTS</span>
            <h2>Locations</h2>
          </div>

          {!loading && (
            <span className="section-count">
              {locations.length} saved
            </span>
          )}
        </div>

        {loading ? (
          <div className="state-card">
            <Loader2 className="spin" size={24} />
            <p>Loading saved locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="state-card empty-state">
            <MapPin size={34} />
            <h3>No saved locations yet</h3>
            <p>
              Add your observation location to calculate satellite
              passes and night visibility.
            </p>
            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              Add Your First Location
            </button>
          </div>
        ) : (
          <div className="locations-grid">
            {locations.map((location) => (
              <article
                className="location-card"
                key={location.id}
              >
                <div className="location-card-top">
                  <div className="location-icon">
                    <MapPin size={20} />
                  </div>

                  <button
                    className="delete-location-button"
                    onClick={() =>
                      handleDeleteLocation(location.id)
                    }
                    disabled={deletingId === location.id}
                    aria-label={`Delete ${location.name}`}
                  >
                    {deletingId === location.id ? (
                      <Loader2 className="spin" size={17} />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>

                <h3>{location.name}</h3>

                <div className="coordinate-list">
                  <div>
                    <span>LATITUDE</span>
                    <strong>
                      {location.latitude.toFixed(4)}°
                    </strong>
                  </div>

                  <div>
                    <span>LONGITUDE</span>
                    <strong>
                      {location.longitude.toFixed(4)}°
                    </strong>
                  </div>
                </div>

                <div className="location-status">
                  <CheckCircle2 size={15} />

                  {activeLocation?.id === location.id
                    ? "Active observer location"
                    : "Saved observer point"}
                </div>

                <button
                  type="button"
                  className={
                    activeLocation?.id === location.id
                      ? "location-action active"
                      : "location-action"
                  }
                  onClick={() => setActiveLocation(location)}
                  disabled={activeLocation?.id === location.id}
                >
                  {activeLocation?.id === location.id
                    ? "Active location"
                    : "Use this location"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}