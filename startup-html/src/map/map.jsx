import React from 'react';
import './map.css';

const popularSpots = [
  { name: 'Willow Creek', details: 'Bass reported this week' },
  { name: 'North Reservoir', details: 'Quiet shoreline access' },
  { name: 'Pine Lake', details: 'Best at sunrise' },
];

export function Map() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredSpots = popularSpots.filter((spot) => (
    `${spot.name} ${spot.details}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  ));

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
        {filteredSpots.length > 0 ? (
          <ul>
            {filteredSpots.map((spot) => (
              <li key={spot.name}><strong>{spot.name}</strong> &mdash; {spot.details}</li>
            ))}
          </ul>
        ) : (
          <p role="status">No fishing spots match “{searchTerm}”.</p>
        )}
      </section>
    </main>
  );
}