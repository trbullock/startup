import React from 'react';
import './map.css';

let googleMapsPromise;

function loadGoogleMaps() {
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google);
  }

  if (!googleMapsPromise) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Promise.reject(new Error('Add VITE_GOOGLE_MAPS_API_KEY to .env.local, then restart Vite.'));
    }

    googleMapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const params = new URLSearchParams({ key: apiKey, v: 'weekly' });
      script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        googleMapsPromise = null;
        reject(new Error('Google Maps could not be loaded. Check the API key, billing, and API restrictions.'));
      };
      document.head.append(script);
    });
  }

  return googleMapsPromise;
}

export function Map() {
  const mapElementRef = React.useRef(null);
  const placeSearchRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [spots, setSpots] = React.useState([]);
  const [error, setError] = React.useState('');
  const [mapsError, setMapsError] = React.useState('');
  const [mapsLoading, setMapsLoading] = React.useState(true);
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [spotName, setSpotName] = React.useState('');
  const [spotDetails, setSpotDetails] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    let autocompleteElement;
    let placeSelectHandler;
    let map;
    let marker;

    async function initializeMap() {
      try {
        const google = await loadGoogleMaps();
        const [{ Map: GoogleMap }, { PlaceAutocompleteElement }] = await Promise.all([
          google.maps.importLibrary('maps'),
          google.maps.importLibrary('places'),
        ]);
        if (!active) return;

        map = new GoogleMap(mapElementRef.current, {
          center: { lat: 47.6062, lng: -122.3321 },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
        });
        autocompleteElement = new PlaceAutocompleteElement();
        autocompleteElement.setAttribute('aria-labelledby', 'google-place-search-label');
        autocompleteElement.setAttribute('placeholder', 'Search for a place');
        placeSearchRef.current.replaceChildren(autocompleteElement);

        placeSelectHandler = async (event) => {
          try {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
            if (!active || !place.location) return;

            map.panTo(place.location);
            map.setZoom(14);
            if (marker) {
              marker.setPosition(place.location);
              marker.setTitle(place.displayName?.text || 'Selected place');
            } else {
              marker = new google.maps.Marker({
                map,
                position: place.location,
                title: place.displayName?.text || 'Selected place',
              });
            }
            setSelectedPlace({
              name: place.displayName?.text || 'Selected place',
              address: place.formattedAddress || '',
            });
            setMapsError('');
          } catch (placeError) {
            if (active) {
              setMapsError(placeError.message || 'Could not load the selected place.');
            }
          }
        };
        autocompleteElement.addEventListener('gmp-select', placeSelectHandler);
        setMapsError('');
      } catch (mapError) {
        if (active) {
          setMapsError(mapError.message || 'Google Maps could not be initialized.');
        }
      } finally {
        if (active) setMapsLoading(false);
      }
    }

    initializeMap();
    return () => {
      active = false;
      if (autocompleteElement && placeSelectHandler) {
        autocompleteElement.removeEventListener('gmp-select', placeSelectHandler);
      }
      placeSearchRef.current?.replaceChildren();
      if (marker) marker.setMap(null);
    };
  }, []);

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

        <p id="google-place-search-label">Search Google Maps for a place</p>
        <div id="google-place-search" ref={placeSearchRef} className="google-place-search" />
        {mapsLoading && <p role="status">Loading Google Maps...</p>}
        {mapsError && <p role="alert">{mapsError}</p>}
        {selectedPlace && (
          <p role="status">
            Showing <strong>{selectedPlace.name}</strong>
            {selectedPlace.address ? ` — ${selectedPlace.address}` : ''}
          </p>
        )}
        <div
          id="map-container"
          ref={mapElementRef}
          aria-label="Google map. Search for a place to show it on the map."
        />
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