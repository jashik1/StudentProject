let map;
        let marker;
        let geocoder;

        function initMap() {
            const mapDiv = document.getElementById("map");
            if (!mapDiv) return; // in case the map div doesn't exist

            map = new google.maps.Map(mapDiv, {
                zoom: 16,
                center: { lat: 0, lng: 0 }, 
                mapTypeControl: false,
            });

            geocoder = new google.maps.Geocoder();
            marker = new google.maps.Marker({ map });

            map.addListener("click", (e) => {
                setMarker(e.latLng);
                const addressInput = document.getElementById('address');
                if (!addressInput) return;

                // Option A: just lat,lng
                // const lat = e.latLng.lat().toFixed(6);
                // const lng = e.latLng.lng().toFixed(6);
                // addressInput.value = `${lat}, ${lng}`;

                // Option B: reverse geocode to human address
                reverseGeocode(e.latLng, (formatted) => {
                    addressInput.value = formatted;
                });
            });

        }

        function setMarker(latLng) {
        }

        function reverseGeocode(latLng, callback) {
            if (!geocoder) return;
            geocoder
                .geocode({ location: latLng })
                .then((result) => {
                    const { results } = result;
                    if (!results[0]) return;
                    const formatted = results[0].formatted_address;
                    callback(formatted);
                })
                .catch((e) => {
                    console.error("Reverse geocode failed:", e);
                });
        }

        // Optional: geocode an address string from the input
        function geocodeAddress(address) {
            if (!geocoder) return;
            geocoder
                .geocode({ address })
                .then((result) => {
                    const { results } = result;
                    if (!results[0]) return;
                    map.setCenter(results[0].geometry.location);
                    setMarker(results[0].geometry.location);
                })
                .catch((e) => {
                    console.error("Geocode failed:", e);
                });
        }

        // expose to global for callback
        window.initMap = initMap;