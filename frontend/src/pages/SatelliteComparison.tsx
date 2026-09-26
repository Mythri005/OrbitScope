import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  GitCompare,
  RefreshCw,
  Satellite,
  X,
} from "lucide-react";

import {
  compareSatellites,
  type SatelliteComparison,
} from "../services/comparisonService";

import { getSatellites } from "../services/satelliteService";

const MAX_SATELLITES = 4;

export default function SatelliteComparison() {
  const [satellites, setSatellites] = useState<string[]>([]);
  const [selectedSatellites, setSelectedSatellites] =
    useState<string[]>(["ISS"]);

  const [comparison, setComparison] = useState<
    SatelliteComparison[]
  >([]);

  const [loadingSatellites, setLoadingSatellites] =
    useState(true);

  const [loadingComparison, setLoadingComparison] =
    useState(false);

  const [error, setError] = useState("");

  const [selectorOpen, setSelectorOpen] = useState(false);

  async function loadSatellites() {
    try {
      setLoadingSatellites(true);
      setError("");

      const response = await getSatellites();

      setSatellites(response.satellites);
    } catch {
      setError("Unable to load satellite catalog.");
    } finally {
      setLoadingSatellites(false);
    }
  }

  async function handleCompare() {
    if (selectedSatellites.length < 2) {
      setError(
        "Select at least two satellites to compare."
      );
      setComparison([]);
      return;
    }

    try {
      setLoadingComparison(true);
      setError("");

      const response = await compareSatellites(
        selectedSatellites
      );

      setComparison(response.satellites);
    } catch {
      setError(
        "Unable to compare the selected satellites."
      );
      setComparison([]);
    } finally {
      setLoadingComparison(false);
    }
  }

  function toggleSatellite(satelliteName: string) {
    setError("");

    setSelectedSatellites((current) => {
      if (current.includes(satelliteName)) {
        return current.filter(
          (name) => name !== satelliteName
        );
      }

      if (current.length >= MAX_SATELLITES) {
        return current;
      }

      return [...current, satelliteName];
    });
  }

  function removeSatellite(satelliteName: string) {
    setSelectedSatellites((current) =>
      current.filter((name) => name !== satelliteName)
    );

    setComparison((current) =>
      current.filter(
        (satellite) =>
          satellite.name !== satelliteName
      )
    );
  }

  function clearSelection() {
    setSelectedSatellites([]);
    setComparison([]);
    setError("");
  }

  useEffect(() => {
    void loadSatellites();
  }, []);

  return (
    <div className="comparison-page">

      {/* Header */}

      <header className="comparison-header">

        <div>
          <div className="eyebrow">
            ORBITAL ANALYSIS
          </div>

          <h1>
            Satellite Comparison
          </h1>

          <p>
            Compare orbital characteristics across
            multiple satellites.
          </p>
        </div>

        <button
          className="comparison-refresh"
          onClick={loadSatellites}
          disabled={
            loadingSatellites ||
            loadingComparison
          }
        >
          <RefreshCw
            size={15}
            className={
              loadingSatellites
                ? "spin"
                : ""
            }
          />

          Refresh Catalog
        </button>

      </header>


      {/* Selector */}

      <section className="comparison-selector">

        <div className="comparison-selector-header">

          <div className="comparison-selector-title">

            <div className="comparison-selector-icon">
              <GitCompare size={18} />
            </div>

            <div>
              <div className="eyebrow">
                SELECT SATELLITES
              </div>

              <h2>
                Choose 2–4 satellites
              </h2>
            </div>

          </div>

          <span className="comparison-selection-count">
            {selectedSatellites.length}/{MAX_SATELLITES}
          </span>

        </div>


        {/* Selected satellites */}

        <div className="comparison-selected">

          {selectedSatellites.length === 0 ? (
            <span className="comparison-placeholder">
              No satellites selected
            </span>
          ) : (
            selectedSatellites.map(
              (satelliteName) => (
                <div
                  key={satelliteName}
                  className="comparison-chip"
                >
                  <Satellite size={13} />

                  <span>
                    {satelliteName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeSatellite(
                        satelliteName
                      )
                    }
                    aria-label={`Remove ${satelliteName}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            )
          )}

        </div>


        {/* Dropdown */}

        <div className="comparison-dropdown">

          <button
            type="button"
            className="comparison-dropdown-trigger"
            onClick={() =>
              setSelectorOpen(
                (current) => !current
              )
            }
            disabled={loadingSatellites}
          >
            <span>
              {loadingSatellites
                ? "Loading satellite catalog..."
                : "Add satellite"}
            </span>

            <ChevronDown
              size={15}
              className={
                selectorOpen
                  ? "comparison-chevron-open"
                  : ""
              }
            />
          </button>


          {selectorOpen &&
            !loadingSatellites && (
              <div className="comparison-dropdown-menu">

                {satellites.map(
                  (satelliteName) => {
                    const selected =
                      selectedSatellites.includes(
                        satelliteName
                      );

                    const disabled =
                      !selected &&
                      selectedSatellites.length >=
                        MAX_SATELLITES;

                    return (
                      <button
                        type="button"
                        key={satelliteName}
                        className={`comparison-option ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        disabled={disabled}
                        onClick={() =>
                          toggleSatellite(
                            satelliteName
                          )
                        }
                      >
                        <span className="comparison-option-name">
                          <Satellite size={14} />
                          {satelliteName}
                        </span>

                        <span className="comparison-option-check">
                          {selected && (
                            <Check size={14} />
                          )}
                        </span>
                      </button>
                    );
                  }
                )}

              </div>
            )}

        </div>


        <div className="comparison-selector-footer">

          <button
            type="button"
            className="comparison-clear"
            onClick={clearSelection}
            disabled={
              selectedSatellites.length === 0
            }
          >
            Clear selection
          </button>

          <button
            type="button"
            className="comparison-button"
            onClick={handleCompare}
            disabled={
              loadingComparison ||
              selectedSatellites.length < 2
            }
          >
            <ArrowLeftRight size={15} />

            {loadingComparison
              ? "Comparing..."
              : "Compare Satellites"}
          </button>

        </div>

      </section>


      {/* Error */}

      {error && (
        <div className="comparison-error">
          {error}
        </div>
      )}


      {/* Comparison */}

      {comparison.length > 0 && (
        <section className="comparison-results">

          <div className="comparison-results-header">

            <div>
              <div className="eyebrow">
                COMPARISON
              </div>

              <h2>
                Orbital characteristics
              </h2>
            </div>

            <span className="comparison-result-count">
              {comparison.length} satellites
            </span>

          </div>


          <div className="comparison-table-wrapper">

            <table className="comparison-table">

              <thead>
                <tr>

                  <th>
                    Parameter
                  </th>

                  {comparison.map(
                    (satellite) => (
                      <th key={satellite.name}>
                        <div className="comparison-satellite-heading">
                          <div className="comparison-satellite-icon">
                            <Satellite size={15} />
                          </div>

                          <span>
                            {satellite.name}
                          </span>
                        </div>
                      </th>
                    )
                  )}

                </tr>
              </thead>


              <tbody>

                <tr>
                  <td>NORAD ID</td>

                  {comparison.map(
                    (satellite) => (
                      <td key={satellite.name}>
                        {satellite.norad_id}
                      </td>
                    )
                  )}
                </tr>


                <tr>
                  <td>Inclination</td>

                  {comparison.map(
                    (satellite) => (
                      <td key={satellite.name}>
                        {satellite.inclination.toFixed(4)}°
                      </td>
                    )
                  )}
                </tr>


                <tr>
                  <td>Eccentricity</td>

                  {comparison.map(
                    (satellite) => (
                      <td key={satellite.name}>
                        {satellite.eccentricity.toFixed(7)}
                      </td>
                    )
                  )}
                </tr>


                <tr>
                  <td>Mean Motion</td>

                  {comparison.map(
                    (satellite) => (
                      <td key={satellite.name}>
                        {satellite.mean_motion.toFixed(4)}
                        {" "}
                        rev/day
                      </td>
                    )
                  )}
                </tr>


                <tr>
                  <td>Orbital Period</td>

                  {comparison.map(
                    (satellite) => (
                      <td key={satellite.name}>
                        {satellite.orbital_period.toFixed(2)}
                        {" "}
                        min
                      </td>
                    )
                  )}
                </tr>


                <tr>
                  <td>Epoch</td>

                  {comparison.map(
                    (satellite) => (
                      <td key={satellite.name}>
                        {new Date(
                          satellite.epoch
                        ).toLocaleString()}
                      </td>
                    )
                  )}
                </tr>

              </tbody>

            </table>

          </div>

        </section>
      )}


      {/* Empty state */}

      {!loadingComparison &&
        comparison.length === 0 &&
        selectedSatellites.length < 2 &&
        !error && (
          <section className="comparison-empty">

            <div className="comparison-empty-icon">
              <GitCompare size={25} />
            </div>

            <h2>
              Ready to compare
            </h2>

            <p>
              Select at least two satellites above
              to compare their orbital characteristics.
            </p>

          </section>
        )}

    </div>
  );
}