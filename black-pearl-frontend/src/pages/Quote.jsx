import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/quote.css";
import "../styles/style.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatWidget from "../chatbot/ChatWidget";

const Quote = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [searchParams] = useSearchParams();
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

  // Comprehensive location to zone mapping based on PDF
  const locationZones = {
    // Johannesburg Zones
    johannesburg: {
      zone1: [
        'bedford gardens', 'bedfordview', 'bafevan', 'benzul', 'beaufortnout valley', 
        'birch acree', 'birchleigh', 'boladburg', 'bonasno park', 'brentwood park', 
        'burma', 'cynldren', 'dawn park', 'down glen', 'eden glen', 'eromdale', 
        'farinade', 'fairwood', 'frantemes', 'feltside', 'glen marais', 'glenhazel', 
        'heriotdale', 'highlands', 'hurleyville', 'isanto', 'jet park', 'kempton park', 
        'kerrington', 'kilimrey', 'lakefield', 'linksfield', 'lombardy east', 
        'lyndhurst', 'malvern', 'marsh steyn park', 'north norwood', 'oakland', 
        'observatory', 'orchards', 'raedens', 'riviera', 'roshenville', 'ruxunlin', 
        'ryttfield', 'sandringham', 'sondawood', 'silvermont', 'spatham', 
        'st. andrews', 'sydenham', 'victoria'
      ],
      zone2: [
        'alboisidout', 'aberton', 'abendnie', 'alhol', 'auckland park', 'bassords', 
        'benmore', 'besato', 'bergbon', 'birdhaven', 'batigownie', 'bootour', 
        'basenfonden', 'backenhurst', 'badyon', 'bamley', 'brysenton', 'chislehurstton', 
        'cragghill park', 'danewood', 'dunfield', 'quickery', 'emmarstrids', 'fattand', 
        'fernolds', 'fontainebleau', 'gallo mauro', 'gemiskon', 'gwyndorf', 'hurtingham', 
        'hyde park', 'ilfovo', 'isonda', 'johannesburg cbd', 'kalacol', 'kelvin', 
        'kerrington ydf', 'kibler park', 'kyalami', 'kyber rock', 'linden', 'limmeyer', 
        'lyme park', 'maimahud', 'mercea', 'melville', 'mendela', 'mayersold', 'midland', 
        'mondoor', 'montroux', 'montropski', 'mulcainry', 'northcliff', 'northriding', 
        'omnova', 'parkmont', 'parkmore', 'petkoon', 'parktown north', 'parkview', 
        'parkwood', 'palacket', 'penovale', 'randburg cbd', 'randhart', 'rampage', 
        'richmond', 'ridgeway', 'ribana', 'risdells', 'river club', 'rhonda', 
        'robindale', 'robinthia', 'roosevelt park', 'rosebank', 'roskenhuth', 
        'rosarene', 'sandhurst', 'starbunch', 'sandton cbd', 'sevoy estate', 
        'saxonsolid', 'stethancon', 'strydom park', 'sunninghill', 'the town trunkman', 
        'victoria park', 'viona valley', 'waverley', 'wendyspool', 'westcliff', 
        'weedsboro', 'windsor', 'woodward'
      ],
      zone3: [
        'alemselle', 'beverley', 'bodwin', 'broadscene', 'blombock', 'bubill estate', 
        'charlevall', 'craigavon', 'daniilern', 'douglasdale', 'farmhall', 'foraways', 
        'jackal park', 'lowell', 'magalesegg', 'northriding', 'olivestale', 
        'piree slopes', 'quelferina', 'rangpark ridge', 'sharonites', 'someglans', 
        'sundowner', 'waterford estate', 'welterweden park', 'wilcoxpon'
      ],
      zone4: [
        'breunanda', 'constantia kloud', 'discovery', 'featherbrook estate', 
        'florida', 'georgina', 'helderburn', 'hongview', 'houston', 'kya sands', 
        'lamonta', 'little falls', 'meadalong', 'mindstone', 'middlesbitt', 
        'princess', 'radiology', 'rangview', 'roodekrans', 'roodepoort cbd', 
        'ruining', 'seixant', 'springs', 'southern valley', 'wigelhauser', 
        'who park', 'wipcooffs', 'zambgoroll'
      ],
      zone5: [
        'kermans', 'kingsmidorp', 'mountmart', 'noordhauser', 'rand el dal'
      ],
      zone6: [
        'brits', 'bondentroom', 'magaliesburg', 'nigel', 'randforthin', 
        'sandburg', 'vanderbiljank', 'vereinship', 'westonia', 'witbank'
      ]
    },
    // Pretoria Zones
    pretoria: {
      zone1: [
        'amherfield', 'arcadia', 'brotherrick', 'brooklyn', 'brunerda', 
        'capital park', 'centurion north', 'centurion south', 'clubview', 
        'colony', 'cordentia park', 'cornwall hill', 'dict-howes', 'de-wigura', 
        'durbiskot', 'eldersigne', 'enpastria', 'faerie giau', 'gastricnini', 
        'genevilliers', 'hatfield', 'hammarabizat', 'highland park', 'irene', 
        'la mustangra', 'lynnwood', 'lyttleton manvi', 'mirandjeld', 'merlin park', 
        'meyerspark', 'monument park', 'modokoot', 'morelena park', 'mukkhenak', 
        'nevalands', 'offershorten', 'pierre van ryeweld', 'pretoria cbd', 
        'pretoria gardens', 'pretoria park', 'queenswood', 'restriction', 
        'retorodale', 'rodmukkneal', 'silveriekes', 'stameway', 'swarthops', 
        'the reeds', 'vahalla', 'valley farm', 'wagadrand', 'waterloof', 
        'waverley', 'werela park', 'wilfonglen', 'wingale park', 'woodhill'
      ],
      zone2: [
        'akasia', 'amandaaga', 'amith', 'doranda', 'elbowite', 'karampark', 
        'landium montana', 'mayville', 'ordersexpoort', 'rooxleplaat', 
        'silveston', 'shoville', 'the orchards', 'theresepark', 'wonderboom'
      ],
      zone3: [
        'brits', 'bromhorstspunt', 'cuffman', 'damas', 'hammarabizat', 
        'harthesexpoort dam'
      ],
      zone4: [
        'soulangyue', 'mamiddol', 'makopane'
      ],
      zone5: [
        'hammarabizat', 'lethibelle', 'brits'
      ]
    }
  };

  // Rate structures based on the PDF
  const johannesburgRates = {
    '4 Seater Sedan': { zone1: 695, zone2: 845, zone3: 856, zone4: 963, zone5: 1059, zone6: 1900 },
    'Mini Bus Mercedes Viano': { zone1: 963, zone2: 1123, zone3: 1357, zone4: 1357, zone5: 1487, zone6: 2354 },
    '15 Seater Quantum': { zone1: 1200, zone2: 1400, zone3: 1600, zone4: 1800, zone5: 2000, zone6: 2800 },
    '17 Seater Luxury Sprinter': { zone1: 1400, zone2: 1600, zone3: 1800, zone4: 2000, zone5: 2200, zone6: 3200 },
    '22 Seater Luxury Coach': { zone1: 1800, zone2: 2000, zone3: 2200, zone4: 2400, zone5: 2600, zone6: 3800 },
    '28 Seater Luxury Coach': { zone1: 2200, zone2: 2400, zone3: 2600, zone4: 2800, zone5: 3000, zone6: 4200 },
    '39 Seater Luxury Coach': { zone1: 2800, zone2: 3000, zone3: 3200, zone4: 3400, zone5: 3600, zone6: 5000 },
    '60 Seater Semi Luxury': { zone1: 3500, zone2: 3700, zone3: 3900, zone4: 4100, zone5: 4300, zone6: 5800 },
    '70 Seater Semi Luxury': { zone1: 4000, zone2: 4200, zone3: 4400, zone4: 4600, zone5: 4800, zone6: 6500 }
  };

  const pretoriaRates = {
    '4 Seater Sedan': { zone4: 856, zone5: 963, zone6: 1800 },
    'Mini Bus Mercedes Viano': { zone4: 1800, zone5: 1700, zone6: 2300 },
    '15 Seater Quantum': { zone4: 2000, zone5: 2100, zone6: 2800 },
    '17 Seater Luxury Sprinter': { zone4: 2200, zone5: 2300, zone6: 3200 },
    '22 Seater Luxury Coach': { zone4: 2600, zone5: 2700, zone6: 3800 },
    '28 Seater Luxury Coach': { zone4: 3000, zone5: 3100, zone6: 4200 },
    '39 Seater Luxury Coach': { zone4: 3600, zone5: 3700, zone6: 5000 },
    '60 Seater Semi Luxury': { zone4: 4300, zone5: 4400, zone6: 5800 },
    '70 Seater Semi Luxury': { zone4: 4800, zone5: 4900, zone6: 6500 }
  };

  // Function to find zone for a location
  const findZone = (location, city) => {
    if (!location || !city) return null;
    
    const locationLower = location.toLowerCase().trim();
    const cityZones = locationZones[city];
    
    if (!cityZones) return null;

    // Check each zone for matching suburbs
    for (const [zone, suburbs] of Object.entries(cityZones)) {
      if (suburbs.some(suburb => locationLower.includes(suburb.toLowerCase()))) {
        return zone;
      }
    }

    return null;
  };

  // Function to detect city based on location
  const detectCity = (location) => {
    if (!location) return null;
    
    const locationLower = location.toLowerCase();
    
    // Check for Johannesburg areas
    const johannesburgIndicators = [
      'johannesburg', 'jhb', 'sandton', 'randburg', 'roodepoort', 
      'kempton', 'midrand', 'fourways', 'rosebank'
    ];
    
    // Check for Pretoria areas
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
  };

  // Special location mappings for common routes
  const specialLocations = {
    // Airports
    'or tambo': { city: 'johannesburg', zone: 'zone1' },
    'ortambo': { city: 'johannesburg', zone: 'zone1' },
    'johannesburg airport': { city: 'johannesburg', zone: 'zone1' },
    'lanseria': { city: 'johannesburg', zone: 'zone4' },
    'lanseria airport': { city: 'johannesburg', zone: 'zone4' },
    
    // Common landmarks
    'iie msa': { city: 'johannesburg', zone: 'zone4' },
    'monash': { city: 'johannesburg', zone: 'zone4' },
    'university of johannesburg': { city: 'johannesburg', zone: 'zone2' },
    'uj': { city: 'johannesburg', zone: 'zone2' },
    'wits': { city: 'johannesburg', zone: 'zone2' },
    'university of witwatersrand': { city: 'johannesburg', zone: 'zone2' },
    'up': { city: 'pretoria', zone: 'zone1' },
    'university of pretoria': { city: 'pretoria', zone: 'zone1' },
    'tuks': { city: 'pretoria', zone: 'zone1' },
  };

  // Enhanced zone detection with special locations
  const detectZone = (location) => {
    if (!location) return { city: null, zone: null };
    
    const locationLower = location.toLowerCase().trim();
    
    // Check special locations first
    for (const [key, value] of Object.entries(specialLocations)) {
      if (locationLower.includes(key)) {
        return value;
      }
    }
    
    // Try to detect city
    const city = detectCity(location);
    if (!city) return { city: null, zone: null };
    
    // Find zone within detected city
    const zone = findZone(location, city);
    
    return { city, zone };
  };

  useEffect(() => {
    const vehicleFromUrl = searchParams.get("vehicle");
    if (vehicleFromUrl) {
      setVehicleType(vehicleFromUrl);
    }

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0];
    setTripDate(today);
  }, [searchParams]);

  useEffect(() => {
    // Recalculate price when relevant fields change
    calculateEstimatedPrice();
  }, [vehicleType, tripDirection, destination, pickupLocation, dropoffLocation]);

  const handleDestinationChange = (e) => {
    setDestination(e.target.value);
    setShowCustomDestination(e.target.value === "Other (Specify Below)");
  };

  // Calculate minimum date for return date (should be after trip date)
  const getMinReturnDate = () => {
    return tripDate || new Date().toISOString().split('T')[0];
  };

  const calculateEstimatedPrice = () => {
    if (!vehicleType || !pickupLocation || !dropoffLocation) {
      setEstimatedPrice(0);
      return;
    }

    let basePrice = 0;
    
    // Detect zones for both locations
    const pickupInfo = detectZone(pickupLocation);
    const dropoffInfo = detectZone(dropoffLocation);
    
    console.log('Pickup Info:', pickupInfo);
    console.log('Dropoff Info:', dropoffInfo);

    // Determine if this is a Johannesburg or Pretoria trip
    const isJohannesburg = pickupInfo.city === 'johannesburg' || dropoffInfo.city === 'johannesburg';
    const isPretoria = pickupInfo.city === 'pretoria' || dropoffInfo.city === 'pretoria';

    // Use the higher zone for pricing
    const getHigherZone = (zone1, zone2) => {
      const zones = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6'];
      const index1 = zones.indexOf(zone1);
      const index2 = zones.indexOf(zone2);
      
      // If both zones found, return the higher one
      if (index1 !== -1 && index2 !== -1) {
        return zones[Math.max(index1, index2)];
      }
      
      // If only one zone found, return that one
      if (index1 !== -1) return zone1;
      if (index2 !== -1) return zone2;
      
      // Default to zone1 if no zones found
      return 'zone1';
    };

    const zone = getHigherZone(pickupInfo.zone, dropoffInfo.zone);

    console.log('Final Zone:', zone);
    console.log('Is Johannesburg:', isJohannesburg);
    console.log('Is Pretoria:', isPretoria);

    if (isJohannesburg && johannesburgRates[vehicleType] && johannesburgRates[vehicleType][zone]) {
      basePrice = johannesburgRates[vehicleType][zone];
      console.log('Using Johannesburg rates:', basePrice);
    } else if (isPretoria && pretoriaRates[vehicleType] && pretoriaRates[vehicleType][zone]) {
      basePrice = pretoriaRates[vehicleType][zone];
      console.log('Using Pretoria rates:', basePrice);
    } else {
      // For other destinations or unknown zones, use a default calculation
      basePrice = calculateDefaultPrice(vehicleType, destination);
      console.log('Using default rates:', basePrice);
    }

    // Apply both ways multiplier (1.8x for round trip as per your backend)
    const finalPrice = tripDirection === "both-ways" ? Math.round(basePrice * 1.8) : basePrice;
    
    setEstimatedPrice(finalPrice);
  };

  const calculateDefaultPrice = (vehicle, dest) => {
    // Default pricing for vehicles when outside Johannesburg/Pretoria
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
    
    // Adjust for long distance
    if (dest === 'Cape Town' || dest === 'Durban') {
      price *= 2.5;
    } else if (dest === 'Port Elizabeth' || dest === 'Bloemfontein') {
      price *= 2.0;
    }

    return Math.round(price);
  };

  const resetForm = () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Get form data - using state values
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

      // Validation
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

      // Submit to backend
      const response = await fetch('http://localhost:5000/api/quotes', {
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
        
        // Reset form
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

          {/* Price Estimate Display */}
          {estimatedPrice > 0 && (
            <div className="price-estimate" style={{
              backgroundColor: "#e7f3ff",
              border: "1px solid #b3d9ff",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "16px",
              color: "#0066cc",
              textAlign: "center",
              fontWeight: "600"
            }}>
              Estimated Price: <strong>R {estimatedPrice.toLocaleString()}</strong>
              <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                {tripDirection === "both-ways" ? "Round trip" : "One way"} • Final price may vary
              </div>
            </div>
          )}

          {message && (
            <div className={`message ${messageType}`} style={{
              padding: "1rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "600",
              backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
              color: messageType === "success" ? "#155724" : "#721c24",
              border: `1px solid ${messageType === "success" ? "#c3e6cb" : "#f5c6cb"}`
            }}>
              {message}
            </div>
          )}

          <form id="quoteForm" className="quote-form" onSubmit={handleSubmit} noValidate>
            {/* Trip Details */}
            <div className="form-section">
              <h3>Trip Details</h3>

              {/* Purpose of Trip */}
              <div className="input-group">
                <br />
                <label htmlFor="tripPurpose">Purpose of Trip</label>
                <select 
                  id="tripPurpose" 
                  name="tripPurpose" 
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
                <br />
                <label htmlFor="tripType">Trip Type</label>
                <select 
                  id="tripType" 
                  name="tripType" 
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
                <br />
                <label htmlFor="destination">Destination</label>
                <select
                  id="destination"
                  name="destination"
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
                  style={{ marginBottom: "14px" }}
                />
              )}

              {/* Pickup & Drop-off */}
              <div className="row">
                <input 
                  type="text" 
                  id="pickupLocation" 
                  placeholder="Pickup Location *" 
                  required 
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                />
                <input 
                  type="text" 
                  id="dropoffLocation" 
                  placeholder="Drop-off Location *" 
                  required 
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                />
              </div>

              {/* Location Helper Text */}
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
                <strong>Tip:</strong> Include suburb names for accurate pricing (e.g., "IIE MSA, Roodepoort" or "OR Tambo Airport, Kempton Park")
              </div>

              {/* Vehicle Type */}
              <div className="input-group">
                <br />
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
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
                <br />
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
                  <br />
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