import React from 'react';
import './map.css';

const SAVED_SPOTS_KEY = 'fishTrackerSavedSpots';

const popularSpots = [
  { id: 'willow-creek', name: 'Willow Creek', details: 'Bass reported this week' },
  { id: 'north-reservoir', name: 'North Reservoir', details: 'Quiet shoreline access' },
  { id: 'pine-lake', name: 'Pine Lake', details: 'Best at sunrise' },
];

function readSavedSpots() {
  try {
    const savedSpots = JSON.parse(localStorage.getItem(SAVED_SPOTS_KEY) || '[]');
    return Array.isArray(savedSpots) ? savedSpots : [];
  } catch {
    return [];
  }
}

export function Map() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [savedSpots, setSavedSpots] = React.useState(readSavedSpots);
  const [addError, setAddError] = React.useState('');
  const allSpots = [...popularSpots, ...savedSpots];
  const filteredSpots = allSpots.filter((spot) => (
    `${spot.name} ${spot.details}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  ));

  function handleAddSpot(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('spot-name').trim();
    const details = formData.get('spot-details').trim();

    if (allSpots.some((spot) => spot.name.toLowerCase() === name.toLowerCase())) {
      setAddError('A spot with that name is already on the list.');
      return;
    }

    const updatedSpots = [
      ...savedSpots,
      { id: `saved-${Date.now()}`, name, details },
    ];

    try {
      localStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(updatedSpots));
      setSavedSpots(updatedSpots);
      setAddError('');
      event.currentTarget.reset();
    } catch {
      setAddError('The spot could not be saved in this browser.');
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
          <input className="form-control" id="spot-name" name="spot-name" type="text" required />
          <label htmlFor="spot-details">Details</label>
          <input className="form-control" id="spot-details" name="spot-details" type="text" required />
          {addError && <p role="alert">{addError}</p>}
          <button className="btn btn-primary" type="submit">Add spot</button>
        </form>
        {filteredSpots.length > 0 ? (
          <ul>
            {filteredSpots.map((spot) => (
              <li key={spot.id}><strong>{spot.name}</strong> &mdash; {spot.details}</li>
            ))}
          </ul>
        ) : (
          <p role="status">No fishing spots match “{searchTerm}”.</p>
        )}
      </section>
    </main>
  );
}