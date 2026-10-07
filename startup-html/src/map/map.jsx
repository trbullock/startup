import React from 'react';
import './map.css';

export function Map() {
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
        {/*<!-- Database placeholder: these sample spots will be loaded from the application database. -->*/}
        <ul>
          <li><strong>Willow Creek</strong> &mdash; Bass reported this week</li>
          <li><strong>North Reservoir</strong> &mdash; Quiet shoreline access</li>
          <li><strong>Pine Lake</strong> &mdash; Best at sunrise</li>
        </ul>
      </section>
    </main>
  );
}