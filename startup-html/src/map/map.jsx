import React from 'react';
import './map.css';

export function Map() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [spots, setSpots] = React.useState([]);
  const [error, setError] = React.useState('');
  const [spotName, setSpotName] = React.useState('');
  const [spotDetails, setSpotDetails] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ search: searchTerm.trim() });

    async function searchSpots() {
      setLoading(true);
      try {
        const response = await fetch(`/api/spots?${query}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.msg || 'Could not search fishing spots.');
        }
        setSpots(result);
        setError('');
      } catch (searchError) {
        if (searchError.name !== 'AbortError') {
          setError(searchError.message || 'Could not search fishing spots.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    searchSpots();
    return () => controller.abort();
  }, [searchTerm]);

  async function handleAddSpot(event) {
    event.preventDefault();
    const name = spotName.trim();
    const details = spotDetails.trim();

    if (!name || !details) {
      setError('Spot name and details are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/spots', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, details }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.msg || 'The spot could not be added.');
      }

      setError('');
      setSpotName('');
      setSpotDetails('');
      setSearchTerm('');
      setSpots((currentSpots) => [...currentSpots, result]);
    } catch (addSpotError) {
      setError(addSpotError.message || 'The spot could not be added.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container page-main map-page">
      <section className="content-panel" aria-labelledby="map-heading">
        <h2 id="map-heading">Explore nearby water</h2>
        <p>Choose a spot to see local conditions, recent catches, and community notes.</p>

        {/*<!-- Third-party service placeholder: a map provider will render the interactive map here. -->*/}
        <div id="map-container" className="map-placeholder" role="img" aria-label="Interactive fishing map coming soon">
          <h3>Interactive map coming soon</h3>
          <img src="/placeholder.png" alt="Future interactive fishing map" width="150"/>
          <p>Map provider integration will display lakes, rivers, and saved fishing spots here.</p>
        </div>
      </section>

      <section className="content-panel" aria-labelledby="spots-heading">
        <h2 id="spots-heading">Popular spots</h2>
        <label htmlFor="spot-search">Search fishing spots</label>
        <input
          className="form-control"
          id="spot-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or detail"
        />
        <form onSubmit={handleAddSpot}>
          <label htmlFor="spot-name">Spot name</label>
          <input
            className="form-control"
            id="spot-name"
            name="spot-name"
            type="text"
            value={spotName}
            onChange={(event) => setSpotName(event.target.value)}
            required
          />
          <label htmlFor="spot-details">Details</label>
          <input
            className="form-control"
            id="spot-details"
            name="spot-details"
            type="text"
            value={spotDetails}
            onChange={(event) => setSpotDetails(event.target.value)}
            required
          />
          {error && <p role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Adding spot...' : 'Add spot'}
          </button>
        </form>
        {loading ? (
          <p role="status">Loading fishing spots...</p>
        ) : spots.length > 0 ? (
          <ul>
            {spots.map((spot) => (
              <li key={spot.id}><strong>{spot.name}</strong> &mdash; {spot.details}</li>
            ))}
          </ul>
        ) : (
          <p role="status">{searchTerm ? `No fishing spots match “${searchTerm}”.` : 'Add spots to see locations here.'}</p>
        )}
      </section>
    </main>
  );
}