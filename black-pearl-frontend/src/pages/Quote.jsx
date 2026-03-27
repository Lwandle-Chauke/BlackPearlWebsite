import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "../styles/quote.css";
import "../styles/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../chatbot/ChatWidget";

// ===============================
// MAP CONFIGURATION
// ===============================
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const defaultCenter = { lat: -26.2041, lng: 28.0473 }; // Johannesburg

// ===============================
// CUSTOM MAP ICONS
// ===============================
const createMapIcon = (color) => ({
  url: `data:image/svg+xml;base64,${btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 28.5C15.828 28.5 16.5 27.828 16.5 27H13.5C13.5 27.828 14.172 28.5 15 28.5Z" fill="${color}"/>
      <circle cx="15" cy="13" r="8" fill="${color}"/>
      <circle cx="15" cy="13" r="5" fill="white"/>
    </svg>
  `)}`,
  scaledSize: { width: 30, height: 30 },
  anchor: { x: 15, y: 30 }
});

const mapIcons = {
  pickup: createMapIcon("#3377FF"),
  dropoff: createMapIcon("#FF4444"),
  selected: {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTUiIGZpbGw9IiMyN0FFNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPgo8cGF0aCBkPSJNMTYgMjBMMTggMjJMMjQgMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
    scaledSize: { width: 40, height: 40 },
    anchor: { x: 20, y: 20 }
  }
};

// ===============================
// BUTTON ICONS
// ===============================
const ButtonIcons = {
  mapPin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#333333"/>
    </svg>
  ),
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#333333"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#333333"/>
    </svg>
  )
};

// ===============================
// LOCATION ZONES (VERIFIED FROM PDF)
// ===============================
const locationZones = {
  johannesburg: {
    zone1: [
      "Bedford Gardens", "Bedfordview", "Bellevue", "Benoni", "Bezuidenhout Valley",
      "Birch Acres", "Birchleigh", "Boksburg", "Bonaero Park", "Brentwood Park",
      "Bruma", "Cyrildene", "Dawn Park", "Dower Glen", "Eden Glen", "Edenvale",
      "Fairvale", "Fairwood", "Farrarmere", "Fellside", "Glen Marais", "Glenhazel",
      "Heriotdale", "Highlands", "Hurleyvale", "Isando", "Jet Park", "Kempton Park",
      "Kensington", "Killarney", "Lakefield", "Linksfield", "Lombardy East",
      "Lyndhurst", "Malvern", "Marais Steyn Park", "North Norwood", "Oaklands",
      "Observatory", "Orchards", "Raedene", "Riviera", "Rosherville", "Rouxville",
      "Rynfield", "Sandringham", "Senderwood", "Silvermont", "Spartan",
      "St. Andrews", "Sydenham", "Victoria"
    ],
    zone2: [
      "Abbotsford", "Alberton", "Albertville", "Athol", "Auckland Park", "Bassonia",
      "Benmore", "Berario", "Bergbon", "Birdhaven", "Blairgowrie", "Bordoux",
      "Braamfontein", "Brackenhurst", "Brakpan", "Bramley", "Bryanston", "Chiselhurston",
      "Craighill Park", "Darrenwood", "Dunkeld", "Duxberry", "Emmarentia", "Fairland",
      "Ferndale", "Fontainebleau", "Gallo Manor", "Germiston", "Greymont", "Hurlingham",
      "Hyde Park", "Illovo", "Inanda", "Johannesburg CBD", "Kelland", "Kelvin", "Kensington B",
      "Kew", "Kibler Park", "Kyalami", "Kyber Rock", "Linden", "Linmeyer", "Lyme Park",
      "Malanshof", "Melrose", "Melville", "Meredale", "Meyersdal", "Midrand", "Mondeor",
      "Montroux", "Morningside", "Mulbarton", "Noordwyk", "Northcliff", "Oakdene", "Ormonde",
      "Parkhurst", "Parkmore", "Parktown", "Parktown North", "Parkview", "Parkwood", "Paulshof",
      "Petervale", "Randburg CBD", "Randhart", "Randpark", "Richmond", "Ridgeway", "Risana",
      "Risidale", "River Club", "Rivonia", "Robindale", "Robinhills", "Rooseveldt Park",
      "Rosebank", "Rosettenville", "Rossmore", "Sandhurst", "Sandown", "Sandton CBD",
      "Savoy Estate", "Saxonwold", "Strathavon", "Strydom Park", "Sunninghill", "The Hill",
      "Triomf", "Turffontein", "Victoria Park", "Vorna Valley", "Waverley", "Wendywood",
      "Westcliff", "Westdene", "Windsor", "Woodmead"
    ],
    zone3: [
      "Alensnek", "Beverley", "Boskruin", "Broadacres", "Bromhof", "Bushill Estate",
      "Chartwell", "Craigavon", "Dainfern", "Douglasdale", "Farmhall", "Fourways",
      "Jukskei Park", "Lonehill", "Magaliessig", "Northriding", "Olivedale", "Pine Slopes",
      "Quellerina", "Randpark Ridge", "Sharonlea", "Sonneglans", "Sundowner",
      "Waterford Estate", "Weltevreden Park", "Witkoppen"
    ],
    zone4: [
      "Breunanda", "Constantia Kloof", "Discovery", "Featherbrook Estate", "Florida",
      "Georginia", "Helderkruin", "Honeydew", "Horison", "Kya Sands", "Lanseria",
      "Little Falls", "Maraisburg", "Mindalore", "Muldersdrift", "Princess", "Radiokop",
      "Rangeview", "Roodekraans", "Roodepoort CBD", "Ruimsig", "Selcourt", "Springs",
      "Strubens Valley", "Wilgeheuwel", "Wilro Park", "Witpoortjie", "Zandspruit"
    ],
    zone5: ["Kenmare", "Krugersdorp", "Monument", "Noordheuwel", "Rand En Dal"],
    zone6: [
      "Brits", "Broederstroom", "Magaliesburg", "Nigel", "Randfontein", "Sasolburg",
      "Vanderbijlpark", "Vereenigin", "Westonia", "Witbank"
    ]
  },
  pretoria: {
    zone1: [
      "Amberfield", "Arcadia", "Bronberrick", "Brooklyn", "Brumeria", "Capital Park",
      "Centurion North", "Centurion South", "Clubview", "Colbyn", "Constantia Park",
      "Cornwall Hill", "Die Hoewes", "Die Wilgers", "Dorinkloof", "Eldoraigne",
      "Equestria", "Faerie Glen", "Garsfontein", "Groenkloof", "Hatfield",
      "Hennopspark", "Highveld Park", "Irene", "Kloofsig", "La Montagne",
      "Lynnwood", "Lyttleton Manor", "Marrayfield", "Menlyn Park", "Meyerspark",
      "Monument Park", "Mooikloof", "Moreletta Park", "Muckleneuk", "Newlands",
      "Olifantsfontein", "Pierre van Ryneveld", "Pretoria CBD", "Pretoria Gardens",
      "Pretorius Park", "Queenswood", "Rietfontein", "Rietondale", "Rooihuiskraal",
      "Silverlakes", "Sterrewag", "Swartkops", "The Reeds", "Valhalla", "Valley Farm",
      "Wapadrand", "Waterkloof", "Waverley", "Wierda Park", "Willowglen",
      "Wingate Park", "Woodhill"
    ],
    zone2: [
      "Akasia", "Amandasig", "Annlin", "Dorandia", "Eldorette", "Karenpark",
      "Laudium Montana", "Mayville", "Onderstepoort", "Roodeplaat", "Silverton",
      "Sinoville", "The Orchards", "Theresapark", "Wonderboom"
    ],
    zone3: ["Brits", "Bronkhorstspruit", "Cullinan", "Delmas", "Hammanskraal", "Hartbeespoort Dam"],
    zone4: ["Soshanguve", "Mamelodi", "Mabopane"],
    zone5: ["Hammanskraal", "Letlhabile", "Brits"]
  }
};

// ===============================
// RATE TABLES
// ===============================
const johannesburgRates = {
  "4 Seater Sedan": { zone1: 695, zone2: 845, zone3: 856, zone4: 963, zone5: 1059, zone6: 1900 },
  "Mini Bus Mercedes Viano": { zone1: 963, zone2: 1123, zone3: 1357, zone4: 1357, zone5: 1487, zone6: 2354 },
  "15 Seater Quantum": { zone1: 1200, zone2: 1400, zone3: 1600, zone4: 1800, zone5: 2000, zone6: 2800 },
  "17 Seater Luxury Sprinter": { zone1: 1400, zone2: 1600, zone3: 1800, zone4: 2000, zone5: 2200, zone6: 3200 },
  "22 Seater Luxury Coach": { zone1: 1800, zone2: 2000, zone3: 2200, zone4: 2400, zone5: 2600, zone6: 3800 },
  "28 Seater Luxury Coach": { zone1: 2200, zone2: 2400, zone3: 2600, zone4: 2800, zone5: 3000, zone6: 4200 },
  "39 Seater Luxury Coach": { zone1: 2800, zone2: 3000, zone3: 3200, zone4: 3400, zone5: 3600, zone6: 5000 },
  "60 Seater Semi Luxury": { zone1: 3500, zone2: 3700, zone3: 3900, zone4: 4100, zone5: 4300, zone6: 5800 },
  "70 Seater Semi Luxury": { zone1: 4000, zone2: 4200, zone3: 4400, zone4: 4600, zone5: 4800, zone6: 6500 }
};

const pretoriaRates = {
  "4 Seater Sedan": { zone4: 856, zone5: 963, zone6: 1600 },
  "Mini Bus Mercedes Viano": { zone4: 1600, zone5: 1700, zone6: 2300 },
  "15 Seater Quantum": { zone4: 2000, zone5: 2100, zone6: 2800 },
  "17 Seater Luxury Sprinter": { zone4: 2200, zone5: 2300, zone6: 3200 },
  "22 Seater Luxury Coach": { zone4: 2600, zone5: 2700, zone6: 3800 },
  "28 Seater Luxury Coach": { zone4: 3000, zone5: 3100, zone6: 4200 },
  "39 Seater Luxury Coach": { zone4: 3600, zone5: 3700, zone6: 5000 },
  "60 Seater Semi Luxury": { zone4: 4300, zone5: 4400, zone6: 5800 },
  "70 Seater Semi Luxury": { zone4: 4800, zone5: 4900, zone6: 6500 }
};

// ===============================
// SPECIAL LOCATIONS
// ===============================
const specialLocations = {
  "or tambo": { city: "johannesburg", zone: "zone1" },
  "ortambo": { city: "johannesburg", zone: "zone1" },
  "johannesburg airport": { city: "johannesburg", zone: "zone1" },
  "lanseria": { city: "johannesburg", zone: "zone4" },
  "lanseria airport": { city: "johannesburg", zone: "zone4" },
  "iie msa": { city: "johannesburg", zone: "zone4" },
  "monash": { city: "johannesburg", zone: "zone4" },
  "university of johannesburg": { city: "johannesburg", zone: "zone2" },
  "uj": { city: "johannesburg", zone: "zone2" },
  "wits": { city: "johannesburg", zone: "zone2" },
  "university of witwatersrand": { city: "johannesburg", zone: "zone2" },
  "up": { city: "pretoria", zone: "zone1" },
  "university of pretoria": { city: "pretoria", zone: "zone1" },
  "tuks": { city: "pretoria", zone: "zone1" }
};

// ===============================
// MAIN COMPONENT
// ===============================
const Quote = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [searchParams] = useSearchParams();
  
  // Form states
  const [vehicleType, setVehicleType] = useState("");
  const [tripDirection, setTripDirection] = useState("one-way");
  const [destination, setDestination] = useState("");
  const [showCustomDestination, setShowCustomDestination] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [tripTime, setTripTime] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [tripPurpose, setTripPurpose] = useState("");
  const [tripType, setTripType] = useState("");
  const [customDestination, setCustomDestination] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Enhanced Map states
  const [pickupMarker, setPickupMarker] = useState(null);
  const [dropoffMarker, setDropoffMarker] = useState(null);
  const [activeMap, setActiveMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapError, setMapError] = useState("");

  // Refs
  const geocoderRef = useRef(null);
  const mapRef = useRef(null);
  const priceCalculationTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Google Maps API loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Check if Google Maps API key is available
  const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  useEffect(() => {
    if (!mapsApiKey) {
      setMapError("Google Maps API key is missing. Please check your environment configuration.");
      console.error("REACT_APP_GOOGLE_MAPS_API_KEY is not set");
    }
  }, [mapsApiKey]);

  // Initialize Google services
  const getGeocoder = useCallback(() => {
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    return geocoderRef.current;
  }, []);

  const getAutocompleteService = useCallback(() => {
    if (!autocompleteServiceRef.current && window.google && window.google.maps.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    return autocompleteServiceRef.current;
  }, []);

  const getPlacesService = useCallback(() => {
    if (!placesServiceRef.current && window.google && window.google.maps.places && mapRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
    }
    return placesServiceRef.current;
  }, []);

  // Enhanced address search with suggestions
  const handleAddressSearch = useCallback(async (searchTerm) => {
    if (!searchTerm.trim() || !isLoaded) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const service = getAutocompleteService();
      if (!service) {
        console.warn('Autocomplete service not available');
        return;
      }

      service.getPlacePredictions(
        {
          input: searchTerm,
          componentRestrictions: { country: 'za' },
          types: ['address', 'establishment', 'geocode']
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSearchSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isLoaded, getAutocompleteService]);

  // Get place details when a suggestion is selected
  const handleSuggestionSelect = useCallback(async (placeId) => {
    try {
      const service = getPlacesService();
      if (!service) {
        console.warn('Places service not available');
        return;
      }

      service.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'name', 'address_components']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };

            setMapCenter(location);
            setSelectedLocation(location);
            setAddress(place.formatted_address);
            
            if (activeMap === 'pickup') {
              setPickupLocation(place.formatted_address);
              setPickupMarker(location);
            } else if (activeMap === 'dropoff') {
              setDropoffLocation(place.formatted_address);
              setDropoffMarker(location);
            }

            setShowSuggestions(false);
            setSearchSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  }, [activeMap, getPlacesService]);

  // Optimized geocoding function
  const geocodeAddress = useCallback(async (address) => {
    if (!address.trim() || !isLoaded) return null;
    
    try {
      const geocoder = getGeocoder();
      if (!geocoder) {
        console.warn('Geocoder not available');
        return null;
      }

      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
      
      return {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, [isLoaded, getGeocoder]);

  // Optimized map click handler
  const onMapClick = useCallback(async (event) => {
    if (!isLoaded) return;
    
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const location = { lat, lng };
    
    setSelectedLocation(location);
    setMapCenter(location);
    
    try {
      const geocoder = getGeocoder();
      if (geocoder) {
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        const address = result.formatted_address;
        setAddress(address);
        
        if (activeMap === 'pickup') {
          setPickupLocation(address);
          setPickupMarker(location);
        } else if (activeMap === 'dropoff') {
          setDropoffLocation(address);
          setDropoffMarker(location);
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const coordAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(coordAddress);
      
      if (activeMap === 'pickup') {
        setPickupLocation(coordAddress);
        setPickupMarker(location);
      } else if (activeMap === 'dropoff') {
        setDropoffLocation(coordAddress);
        setDropoffMarker(location);
      }
    }
  }, [activeMap, getGeocoder, isLoaded]);

  // Optimized map load handler
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    console.log('Google Maps loaded successfully');
  }, []);

  // Fixed open map functions
  const openMapForPickup = useCallback(() => {
    console.log("Opening map for pickup");
    setActiveMap('pickup');
    setShowSuggestions(false);
    setMapError("");
    setAddress("");
    setSelectedLocation(null);
    
    if (pickupMarker) {
      setMapCenter(pickupMarker);
      setSelectedLocation(pickupMarker);
    } else {
      setMapCenter(defaultCenter);
    }
  }, [pickupMarker]);

  const openMapForDropoff = useCallback(() => {
    console.log("Opening map for dropoff");
    setActiveMap('dropoff');
    setShowSuggestions(false);
    setMapError("");
    setAddress("");
    setSelectedLocation(null);
    
    if (dropoffMarker) {
      setMapCenter(dropoffMarker);
      setSelectedLocation(dropoffMarker);
    } else {
      setMapCenter(defaultCenter);
    }
  }, [dropoffMarker]);

  const closeMap = useCallback(() => {
    console.log("Closing map");
    setActiveMap(null);
    setSelectedLocation(null);
    setAddress("");
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setMapError("");
  }, []);

  const handleSearchLocation = useCallback(async () => {
    if (!address.trim() || !isLoaded) return;
    
    const location = await geocodeAddress(address);
    if (location) {
      setMapCenter(location);
      setSelectedLocation(location);
      
      if (activeMap === 'pickup') {
        setPickupMarker(location);
      } else if (activeMap === 'dropoff') {
        setDropoffMarker(location);
      }
    }
  }, [address, activeMap, geocodeAddress, isLoaded]);

  // Zone detection functions (keep the same as before)
  const findZone = useCallback((location, city) => {
    if (!location || !city) return null;
    
    const locationLower = location.toLowerCase().trim();
    const cityZones = locationZones[city];
    
    if (!cityZones) return null;

    for (const [zone, suburbs] of Object.entries(cityZones)) {
      if (suburbs.some(suburb => locationLower.includes(suburb.toLowerCase()))) {
        return zone;
      }
    }

    return null;
  }, []);

  const detectCity = useCallback((location) => {
    if (!location) return null;
    
    const locationLower = location.toLowerCase();
    
    const johannesburgIndicators = [
      'johannesburg', 'jhb', 'sandton', 'randburg', 'roodepoort', 
      'kempton', 'midrand', 'fourways', 'rosebank'
    ];
    
    const pretoriaIndicators = [
      'pretoria', 'pta', 'centurion', 'hatfield', 'lynnwood', 
      'brooklyn', 'arcadia', 'queenswood'
    ];

    if (johannesburgIndicators.some(indicator => locationLower.includes(indicator))) {
      return 'johannesburg';
    }
    
    if (pretoriaIndicators.some(indicator => locationLower.includes(indicator))) {
      return 'pretoria';
    }

    return null;
  }, []);

  const detectZone = useCallback((location) => {
    if (!location) return { city: null, zone: null };
    
    const locationLower = location.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(specialLocations)) {
      if (locationLower.includes(key)) {
        return value;
      }
    }
    
    const city = detectCity(location);
    if (!city) return { city: null, zone: null };
    
    const zone = findZone(location, city);
    
    return { city, zone };
  }, [detectCity, findZone]);

  // Price calculation with debouncing
  const calculateEstimatedPrice = useCallback(() => {
    if (!vehicleType || !pickupLocation || !dropoffLocation) {
      setEstimatedPrice(0);
      return;
    }

    let basePrice = 0;
    
    const pickupInfo = detectZone(pickupLocation);
    const dropoffInfo = detectZone(dropoffLocation);

    const isJohannesburg = pickupInfo.city === 'johannesburg' || dropoffInfo.city === 'johannesburg';
    const isPretoria = pickupInfo.city === 'pretoria' || dropoffInfo.city === 'pretoria';

    const getHigherZone = (zone1, zone2) => {
      const zones = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6'];
      const index1 = zones.indexOf(zone1);
      const index2 = zones.indexOf(zone2);
      
      if (index1 !== -1 && index2 !== -1) {
        return zones[Math.max(index1, index2)];
      }
      
      if (index1 !== -1) return zone1;
      if (index2 !== -1) return zone2;
      
      return 'zone1';
    };

    const zone = getHigherZone(pickupInfo.zone, dropoffInfo.zone);

    if (isJohannesburg && johannesburgRates[vehicleType] && johannesburgRates[vehicleType][zone]) {
      basePrice = johannesburgRates[vehicleType][zone];
    } else if (isPretoria && pretoriaRates[vehicleType] && pretoriaRates[vehicleType][zone]) {
      basePrice = pretoriaRates[vehicleType][zone];
    } else {
      basePrice = calculateDefaultPrice(vehicleType, destination);
    }

    const finalPrice = tripDirection === "both-ways" ? Math.round(basePrice * 1.8) : basePrice;
    
    setEstimatedPrice(finalPrice);
  }, [vehicleType, tripDirection, destination, pickupLocation, dropoffLocation, detectZone]);

  const calculateDefaultPrice = useCallback((vehicle, dest) => {
    const defaultPrices = {
      '4 Seater Sedan': 1000,
      'Mini Bus Mercedes Viano': 1500,
      '15 Seater Quantum': 1800,
      '17 Seater Luxury Sprinter': 2200,
      '22 Seater Luxury Coach': 2800,
      '28 Seater Luxury Coach': 3200,
      '39 Seater Luxury Coach': 3800,
      '60 Seater Semi Luxury': 4500,
      '70 Seater Semi Luxury': 5000
    };

    let price = defaultPrices[vehicle] || 2000;
    
    if (dest === 'Cape Town' || dest === 'Durban') {
      price *= 2.5;
    } else if (dest === 'Port Elizabeth' || dest === 'Bloemfontein') {
      price *= 2.0;
    }

    return Math.round(price);
  }, []);

  // Form handlers (keep the same)
  const handleDestinationChange = useCallback((e) => {
    setDestination(e.target.value);
    setShowCustomDestination(e.target.value === "Other (Specify Below)");
  }, []);

  const getMinReturnDate = useCallback(() => {
    return tripDate || new Date().toISOString().split('T')[0];
  }, [tripDate]);

  const resetForm = useCallback(() => {
    setVehicleType("");
    setTripDirection("one-way");
    setDestination("");
    setShowCustomDestination(false);
    setEstimatedPrice(0);
    setPickupLocation("");
    setDropoffLocation("");
    setTripDate(new Date().toISOString().split('T')[0]);
    setTripTime("");
    setReturnDate("");
    setTripPurpose("");
    setTripType("");
    setCustomDestination("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerCompany("");
    setAcceptedTerms(false);
    setPickupMarker(null);
    setDropoffMarker(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = {
        tripPurpose: tripPurpose,
        tripType: tripType,
        destination: destination,
        customDestination: showCustomDestination ? customDestination : "",
        pickupLocation: pickupLocation,
        dropoffLocation: dropoffLocation,
        vehicleType: vehicleType,
        isOneWay: tripDirection === "one-way",
        tripDate: tripDate,
        returnDate: tripDirection === "both-ways" ? returnDate : null,
        tripTime: tripTime,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerCompany: customerCompany,
        estimatedPrice: estimatedPrice,
        userId: currentUser ? currentUser.id : null
      };

      const requiredFields = [
        { field: 'tripPurpose', value: tripPurpose, name: 'Purpose of Trip' },
        { field: 'tripType', value: tripType, name: 'Trip Type' },
        { field: 'destination', value: destination, name: 'Destination' },
        { field: 'pickupLocation', value: pickupLocation, name: 'Pickup Location' },
        { field: 'dropoffLocation', value: dropoffLocation, name: 'Drop-off Location' },
        { field: 'vehicleType', value: vehicleType, name: 'Vehicle Type' },
        { field: 'tripDate', value: tripDate, name: 'Trip Date' },
        { field: 'tripTime', value: tripTime, name: 'Trip Time' },
        { field: 'customerName', value: customerName, name: 'Name' },
        { field: 'customerEmail', value: customerEmail, name: 'Email' },
        { field: 'customerPhone', value: customerPhone, name: 'Phone' }
      ];

      if (tripDirection === "both-ways") {
        requiredFields.push({ field: 'returnDate', value: returnDate, name: 'Return Date' });
      }

      const missingFields = requiredFields.filter(field => !field.value.trim());
      
      if (missingFields.length > 0) {
        setMessageType("error");
        setMessage(`Please fill in all required fields: ${missingFields.map(f => f.name).join(', ')}`);
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessageType("success");
        setMessage(data.message || "Thank you for your quote request! We will contact you shortly.");
        resetForm();
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to submit quote. Please try again.");
      }
    } catch (error) {
      console.error('Quote submission error:', error);
      setMessageType("error");
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    const vehicleFromUrl = searchParams.get("vehicle");
    if (vehicleFromUrl) {
      setVehicleType(vehicleFromUrl);
    }

    const today = new Date().toISOString().split("T")[0];
    setTripDate(today);
  }, [searchParams]);

  // Debounced price calculation
  useEffect(() => {
    if (priceCalculationTimeoutRef.current) {
      clearTimeout(priceCalculationTimeoutRef.current);
    }

    priceCalculationTimeoutRef.current = setTimeout(() => {
      calculateEstimatedPrice();
    }, 300);

    return () => {
      if (priceCalculationTimeoutRef.current) {
        clearTimeout(priceCalculationTimeoutRef.current);
      }
    };
  }, [vehicleType, tripDirection, destination, pickupLocation, dropoffLocation, calculateEstimatedPrice]);

  // Handle Google Maps load error
  useEffect(() => {
    if (loadError) {
      setMapError("Failed to load Google Maps. Please check your API key and internet connection.");
      console.error('Google Maps load error:', loadError);
    }
  }, [loadError]);

  return (
    <>
      <Header 
        onAuthClick={onAuthClick} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
        onSignOut={onSignOut}
      />

      <main className="quote-page">
        <section className="quote-section" style={{ marginTop: "60px" }}>
          <h1>GET A QUOTE</h1>
          <p className="subtitle">
            Fast, tailored quotes for private coach charters and shuttle services.
            {vehicleType && (
              <>
                <br />
                <small style={{ color: "green", fontWeight: "600" }}>
                  ✓ {vehicleType} pre-selected
                </small>
              </>
            )}
          </p>

          {/* Important Note */}
          <div className="company-note">
            <strong>Important Note:</strong> Our company is based in <strong>Johannesburg and Pretoria</strong>. 
            All trips must originate from these areas. Rates for destinations outside Johannesburg and Pretoria 
            will be calculated differently and may vary.
          </div>

          {/* API Key Warning */}
          {!mapsApiKey && (
            <div className="message error">
              <strong>Google Maps Configuration Required:</strong> Please set up your REACT_APP_GOOGLE_MAPS_API_KEY environment variable.
            </div>
          )}

          {/* Price Estimate Display */}
          {estimatedPrice > 0 && (
            <div className="price-estimate">
              Estimated Price: <strong>R {estimatedPrice.toLocaleString()}</strong>
              <div className="price-estimate-details">
                {tripDirection === "both-ways" ? "Round trip" : "One way"} • Final price may vary
              </div>
            </div>
          )}

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form id="quoteForm" className="quote-form" onSubmit={handleSubmit} noValidate>
            {/* Trip Details */}
            <div className="form-section">
              <h3>Trip Details</h3>

              {/* Purpose of Trip */}
              <div className="input-group">
                <label htmlFor="tripPurpose">Purpose of Trip</label>
                <select 
                  id="tripPurpose" 
                  value={tripPurpose}
                  onChange={(e) => setTripPurpose(e.target.value)}
                  required
                >
                  <option value="">Select Purpose *</option>
                  <option value="Personal Use">Personal Use</option>
                  <option value="Business / Corporate">Business / Corporate</option>
                  <option value="School or University Trip">School or University Trip</option>
                  <option value="Event / Wedding">Event / Wedding</option>
                  <option value="Tourism or Sightseeing">Tourism or Sightseeing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Trip Type */}
              <div className="input-group">
                <label htmlFor="tripType">Trip Type</label>
                <select 
                  id="tripType" 
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  required
                >
                  <option value="">Select Trip Type *</option>
                  <option value="Airport Transfers">Airport Transfers</option>
                  <option value="Conference Shuttles">Conference Shuttles</option>
                  <option value="Sports Travel">Sports Travel</option>
                  <option value="Events & Leisure">Events & Leisure</option>
                  <option value="Custom Trip">Custom Trip</option>
                </select>
              </div>

              {/* Destination */}
              <div className="input-group">
                <label htmlFor="destination">Destination</label>
                <select
                  id="destination"
                  value={destination}
                  onChange={handleDestinationChange}
                  required
                >
                  <option value="">Select Destination *</option>
                  <option value="Johannesburg">Johannesburg</option>
                  <option value="Pretoria">Pretoria</option>
                  <option value="Cape Town">Cape Town</option>
                  <option value="Durban">Durban</option>
                  <option value="Bloemfontein">Bloemfontein</option>
                  <option value="Port Elizabeth">Port Elizabeth</option>
                  <option value="Other (Specify Below)">Other (Specify Below)</option>
                </select>
              </div>

              {/* Custom Destination */}
              {showCustomDestination && (
                <input
                  type="text"
                  id="customDestination"
                  placeholder="If 'Other', please specify your destination"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  className="custom-destination-input"
                />
              )}

              {/* Pickup & Drop-off with Map Integration */}
              <div className="input-group">
                <label>Pickup Location *</label>
                <div className="location-input-with-map">
                  <input 
                    type="text" 
                    placeholder="Pickup Location *" 
                    required 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="map-pin-btn"
                    onClick={openMapForPickup}
                    title="Select pickup location on map"
                    disabled={!isLoaded}
                  >
                    {ButtonIcons.mapPin}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Drop-off Location *</label>
                <div className="location-input-with-map">
                  <input 
                    type="text" 
                    placeholder="Drop-off Location *" 
                    required 
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="map-pin-btn"
                    onClick={openMapForDropoff}
                    title="Select drop-off location on map"
                    disabled={!isLoaded}
                  >
                    {ButtonIcons.mapPin}
                  </button>
                </div>
              </div>

              {/* Location Helper Text */}
              <div className="location-helper">
                <strong>Tip:</strong> Click the pin icon to select locations on the map, or type addresses manually.
                {!isLoaded && " (Google Maps is loading...)"}
              </div>

              {/* Vehicle Type */}
              <div className="input-group">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Select Vehicle Type *</option>
                  <option value="4 Seater Sedan">4 Seater Sedan</option>
                  <option value="Mini Bus Mercedes Viano">Mini Bus Mercedes Viano</option>
                  <option value="15 Seater Quantum">15 Seater Quantum</option>
                  <option value="17 Seater Luxury Sprinter">17 Seater Luxury Sprinter</option>
                  <option value="22 Seater Luxury Coach">22 Seater Luxury Coach</option>
                  <option value="28 Seater Luxury Coach">28 Seater Luxury Coach</option>
                  <option value="39 Seater Luxury Coach">39 Seater Luxury Coach</option>
                  <option value="60 Seater Semi Luxury">60 Seater Semi Luxury</option>
                  <option value="70 Seater Semi Luxury">70 Seater Semi Luxury</option>
                </select>
              </div>

              {/* Trip Direction Radio Buttons */}
              <div className="input-group">
                <label>Trip Direction</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="tripDirection"
                      value="one-way"
                      checked={tripDirection === "one-way"}
                      onChange={() => setTripDirection("one-way")}
                    />
                    One Way
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tripDirection"
                      value="both-ways"
                      checked={tripDirection === "both-ways"}
                      onChange={() => setTripDirection("both-ways")}
                    />
                    Both Ways
                  </label>
                </div>
              </div>

              {/* Date & Time */}
              <div className="row">
                <input 
                  type="date" 
                  id="tripDate" 
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
                <input 
                  type="time" 
                  id="tripTime" 
                  value={tripTime}
                  onChange={(e) => setTripTime(e.target.value)}
                  required 
                />
              </div>

              {/* Return Date for Both Ways */}
              {tripDirection === "both-ways" && (
                <div className="input-group">
                  <label htmlFor="returnDate">Return Date *</label>
                  <input 
                    type="date" 
                    id="returnDate" 
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={getMinReturnDate()}
                    required 
                  />
                </div>
              )}
            </div>

            {/* Enhanced Map Modal */}
            {activeMap && (
              <div className="map-modal-overlay">
                <div className="map-modal">
                  <div className="map-modal-header">
                    <h3>Select {activeMap === 'pickup' ? 'Pickup' : 'Drop-off'} Location</h3>
                    <button onClick={closeMap} className="close-map-btn">
                      {ButtonIcons.close}
                    </button>
                  </div>
                  <div className="map-modal-body">
                    <p>Click on the map to set your {activeMap} location, or search for an address:</p>
                    
                    {/* Map Error Display */}
                    {mapError && (
                      <div className="message error">
                        {mapError}
                      </div>
                    )}

                    {/* Enhanced Search Box with Suggestions */}
                    <div className="map-search-container">
                      <div className="map-search-box">
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search for an address..."
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            handleAddressSearch(e.target.value);
                          }}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                        />
                        <button onClick={handleSearchLocation} className="search-btn">
                          {ButtonIcons.search}
                        </button>
                      </div>
                      
                      {/* Search Suggestions Dropdown */}
                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="search-suggestions">
                          {searchSuggestions.map((prediction) => (
                            <div
                              key={prediction.place_id}
                              className="suggestion-item"
                              onClick={() => handleSuggestionSelect(prediction.place_id)}
                            >
                              <div className="suggestion-text">
                                <div className="suggestion-main">{prediction.structured_formatting.main_text}</div>
                                <div className="suggestion-secondary">{prediction.structured_formatting.secondary_text}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={mapCenter}
                        zoom={15}
                        onLoad={onMapLoad}
                        onClick={onMapClick}
                        options={{
                          disableDefaultUI: false,
                          zoomControl: true,
                          streetViewControl: true,
                          mapTypeControl: true,
                          fullscreenControl: true
                        }}
                      >
                        {/* Pickup Marker */}
                        {activeMap === 'pickup' && pickupMarker && (
                          <Marker
                            position={pickupMarker}
                            icon={mapIcons.pickup}
                          />
                        )}

                        {/* Dropoff Marker */}
                        {activeMap === 'dropoff' && dropoffMarker && (
                          <Marker
                            position={dropoffMarker}
                            icon={mapIcons.dropoff}
                          />
                        )}

                        {/* Selected Location Marker */}
                        {selectedLocation && (
                          <Marker
                            position={selectedLocation}
                            icon={mapIcons.selected}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="map-loading">
                        {loadError ? "Failed to load Google Maps" : "Loading Google Maps..."}
                      </div>
                    )}

                    {address && (
                      <div className="selected-address">
                        <strong>Selected Address:</strong> {address}
                      </div>
                    )}

                    <div className="map-actions">
                      <button 
                        type="button" 
                        onClick={closeMap}
                        className="confirm-location-btn"
                      >
                        Confirm Location
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <hr />

            {/* Contact Info */}
            <div className="form-section">
              <h3>Contact Info & Details</h3>
              <div className="row">
                <input 
                  type="text" 
                  id="customerName" 
                  placeholder="Name *" 
                  required 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input 
                  type="email" 
                  id="customerEmail" 
                  placeholder="Email *" 
                  required 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <input 
                  type="tel" 
                  id="customerPhone" 
                  placeholder="Phone *" 
                  required 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <input 
                  type="text" 
                  id="customerCompany" 
                  placeholder="Company" 
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                />
              </div>
            </div>

            {/* Terms and Conditions Acceptance */}
            <div className="terms-acceptance">
              <div className="terms-header">
                <button 
                  type="button"
                  className="terms-pdf-btn"
                  onClick={() => window.open('/documents/terms-and-conditions.pdf', '_blank')}
                >
                  📄 Read Terms and Conditions
                </button>
              </div>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                />
                <span>
                  I confirm that I have read and agree to the Terms and Conditions *
                </span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !acceptedTerms}>
              {loading ? "SUBMITTING..." : "REQUEST QUOTE"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
};

export default Quote;