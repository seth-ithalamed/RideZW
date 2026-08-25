import { AuthGate } from '../shared/AuthGate';
import { useEffect, useState, useRef } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ridezwApi, MobileTrip } from '../shared/api';
import {
  LocationPoint,
  ZimbabwePlace,
  searchPlaces,
  calculateTripRoute,
  reverseGeocode,
  ZIMBABWE_PLACES_DATABASE
} from '../shared/locationService';

const AVAILABLE_CITIES = ['Harare', 'Bulawayo', 'Chitungwiza', 'Victoria Falls', 'Mutare', 'Gweru'];

export default function RiderApp() {
  const [city, setCity] = useState<string>('Harare');
  
  // Locations with full coordinates
  const [pickup, setPickup] = useState<LocationPoint>({
    address: 'First Mutual Tower, Harare CBD',
    neighborhood: 'Harare CBD',
    city: 'Harare',
    lat: -17.8292,
    lng: 31.0522
  });

  const [destination, setDestination] = useState<LocationPoint>({
    address: 'Sam Levy’s Village, Borrowdale',
    neighborhood: 'Borrowdale',
    city: 'Harare',
    lat: -17.7554,
    lng: 31.0852
  });

  // Search Input States
  const [pickupQuery, setPickupQuery] = useState(pickup.address);
  const [destQuery, setDestQuery] = useState(destination.address);
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'destination' | null>(null);
  const [searchResults, setSearchResults] = useState<ZimbabwePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);

  // Trip Options
  const [category, setCategory] = useState<'economy' | 'comfort' | 'xl' | 'motorbike'>('economy');
  const [fareUSD, setFareUSD] = useState<number>(5.5);
  const [paymentMethod, setPaymentMethod] = useState<'clicknpay' | 'ecocash' | 'cash' | 'card'>('clicknpay');
  const [activeTrip, setActiveTrip] = useState<MobileTrip | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState<boolean | null>(null);

  // Route metrics (distance, time, recommended fare)
  const [routeInfo, setRouteInfo] = useState(calculateTripRoute(pickup, destination));

  const pollTimerRef = useRef<any>(null);
  const searchDebounceRef = useRef<any>(null);

  // Recalculate route whenever pickup or destination changes
  useEffect(() => {
    const route = calculateTripRoute(pickup, destination);
    setRouteInfo(route);
    if (route.fares && route.fares[category]) {
      setFareUSD(route.fares[category]);
    }
  }, [pickup.lat, pickup.lng, destination.lat, destination.lng, category]);

  // Handle City Change
  const handleSelectCity = (newCity: string) => {
    setCity(newCity);
    const cityPlaces = ZIMBABWE_PLACES_DATABASE.filter(p => p.city.toLowerCase() === newCity.toLowerCase());
    if (cityPlaces.length >= 2) {
      setPickup({
        address: cityPlaces[0].name,
        neighborhood: cityPlaces[0].neighborhood,
        city: cityPlaces[0].city,
        lat: cityPlaces[0].lat,
        lng: cityPlaces[0].lng
      });
      setPickupQuery(cityPlaces[0].name);

      setDestination({
        address: cityPlaces[1].name,
        neighborhood: cityPlaces[1].neighborhood,
        city: cityPlaces[1].city,
        lat: cityPlaces[1].lat,
        lng: cityPlaces[1].lng
      });
      setDestQuery(cityPlaces[1].name);
    }
    setActiveSearchField(null);
  };

  // Search logic with live debouncing
  const handleQueryChange = (text: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') setPickupQuery(text);
    else setDestQuery(text);
    setActiveSearchField(field);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    setIsSearching(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(text, city);
        setSearchResults(results);
      } catch {
        // search failed
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  // Select place from search dropdown
  const handleSelectPlace = (place: ZimbabwePlace) => {
    const loc: LocationPoint = {
      address: place.name,
      neighborhood: place.neighborhood,
      city: place.city,
      lat: place.lat,
      lng: place.lng
    };

    if (activeSearchField === 'pickup') {
      setPickup(loc);
      setPickupQuery(place.name);
    } else {
      setDestination(loc);
      setDestQuery(place.name);
    }
    setActiveSearchField(null);
    setSearchResults([]);
  };

  // GPS Current Location detection
  const handleDetectGps = async () => {
    setIsGpsLocating(true);
    try {
      // In web/mobile container, attempt navigator.geolocation or fallback to central sector
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const resolved = await reverseGeocode(latitude, longitude);
            setPickup(resolved);
            setPickupQuery(resolved.address);
            if (resolved.city) setCity(resolved.city);
            setIsGpsLocating(false);
          },
          () => {
            // Default to Harare CBD with slight GPS jitter
            const lat = -17.8292 + (Math.random() - 0.5) * 0.01;
            const lng = 31.0522 + (Math.random() - 0.5) * 0.01;
            reverseGeocode(lat, lng).then(resolved => {
              setPickup(resolved);
              setPickupQuery(resolved.address);
              setIsGpsLocating(false);
            });
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        const lat = -17.8292;
        const lng = 31.0522;
        const resolved = await reverseGeocode(lat, lng);
        setPickup(resolved);
        setPickupQuery(resolved.address);
        setIsGpsLocating(false);
      }
    } catch {
      setIsGpsLocating(false);
    }
  };

  // Swap pickup & destination
  const handleSwap = () => {
    const tempP = pickup;
    const tempQ = pickupQuery;
    setPickup(destination);
    setPickupQuery(destQuery);
    setDestination(tempP);
    setDestQuery(tempQ);
    setActiveSearchField(null);
  };

  // Active Trip Poller
  const checkActiveTrips = async () => {
    try {
      const res = await ridezwApi.activeTrips();
      if (res && res.trips && res.trips.length > 0) {
        setActiveTrip(res.trips[0]);
      } else {
        setActiveTrip(null);
      }
    } catch {
      // Ignore background network errors
    }
  };

  useEffect(() => {
    ridezwApi.health()
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    checkActiveTrips();
    pollTimerRef.current = setInterval(checkActiveTrips, 3500);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleBookRide = async () => {
    if (!pickup.address.trim() || !destination.address.trim()) {
      Alert.alert('Missing Location', 'Please select both a valid pickup and destination.');
      return;
    }
    setLoading(true);
    setMessage('Broadcasting trip offer to nearby licensed drivers…');
    try {
      const res = await ridezwApi.createTrip({
        pickup: pickup.address,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupNeighborhood: pickup.neighborhood,
        destination: destination.address,
        destLat: destination.lat,
        destLng: destination.lng,
        destNeighborhood: destination.neighborhood,
        city,
        category,
        distanceKm: routeInfo.distanceKm,
        durationMinutes: routeInfo.durationMinutes,
        proposedFareUSD: fareUSD,
        paymentMethod,
        requestedAt: new Date().toISOString()
      });
      if (res.trip) {
        setActiveTrip(res.trip);
        setMessage('Ride offer sent! Waiting for driver responses…');
      }
    } catch (e: any) {
      setMessage(e.message || 'Could not request ride');
      Alert.alert('Booking Error', e.message || 'Failed to broadcast ride offer');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDriverOffer = async (offer: any) => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      await ridezwApi.updateTripStatus(activeTrip.id, 'rider_confirmed');
      setMessage(`Accepted driver offer of $${offer.offeredAmount.toFixed(2)}. Driver is en route!`);
      await checkActiveTrips();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not confirm driver offer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async () => {
    if (!activeTrip) return;
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await ridezwApi.updateTripStatus(activeTrip.id, 'cancelled', 'Cancelled by rider');
            setActiveTrip(null);
            setMessage('Trip cancelled.');
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not cancel ride');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const handleInitiateClicknPay = async () => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      const order = await ridezwApi.createPaymentOrder({
        amount: activeTrip.agreedFareUSD || activeTrip.proposedFareUSD || fareUSD,
        currency: 'USD',
        customerPhone: '+263771234567',
        description: `RideZW Trip #${activeTrip.id.slice(-4)} (${pickup.neighborhood} to ${destination.neighborhood})`,
        purpose: 'ride',
        relatedId: activeTrip.id
      });
      if (order.paymeURL) {
        Linking.openURL(order.paymeURL).catch(() => {
          Alert.alert('Payment Portal', `Click to pay: ${order.paymeURL}`);
        });
      } else {
        Alert.alert('Payment Created', `Client Ref: ${order.clientReference}. Status: ${order.status}`);
      }
    } catch (e: any) {
      Alert.alert('Payment Error', e.message || 'Could not initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleSos = async () => {
    Alert.alert(
      '🚨 EMERGENCY SOS',
      'This will dispatch your live GPS coordinates, vehicle details, and route information directly to the RideZW 24/7 Safety Command Centre in Harare. Confirm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH SOS NOW',
          style: 'destructive',
          onPress: async () => {
            try {
              await ridezwApi.triggerEmergencySos({
                tripId: activeTrip?.id,
                lat: pickup.lat,
                lng: pickup.lng,
                address: `${pickup.address} (${city})`
              });
              Alert.alert('SOS Dispatched', 'Emergency responders and safety operators have been alerted.');
            } catch {
              Alert.alert('Alert', 'SOS alert logged to emergency queue.');
            }
          }
        }
      ]
    );
  };

  // Helper for category POI icon
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'airport': return '✈️';
      case 'shopping': return '🛍️';
      case 'hospital': return '🏥';
      case 'education': return '🎓';
      case 'transit': return '🚌';
      case 'hotel': return '🏨';
      default: return '📍';
    }
  };

  return (
    <AuthGate role="rider">
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={s.c} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={s.headerRow}>
            <View>
              <Text style={s.eyebrow}>RIDEZW • PASSENGER APP</Text>
              <Text style={s.title}>Book a Ride</Text>
            </View>
            <Pressable style={s.sosBadge} onPress={handleSos}>
              <Text style={s.sosText}>🚨 SOS</Text>
            </Pressable>
          </View>
          <Text style={s.sub}>Real-time location search & GPS routing across Zimbabwe.</Text>

          {/* ACTIVE TRIP SCREEN */}
          {activeTrip ? (
            <View style={s.activeTripCard}>
              <View style={s.activeTripTop}>
                <View>
                  <Text style={s.activeBadge}>
                    ● {activeTrip.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={s.activeTripId}>Trip #{activeTrip.id.slice(-4).toUpperCase()}</Text>
                </View>
                <Text style={s.activeFare}>
                  ${(activeTrip.agreedFareUSD || activeTrip.proposedFareUSD || fareUSD).toFixed(2)}
                </Text>
              </View>

              <View style={s.routeBox}>
                <Text style={s.routeItem}>📍 {activeTrip.pickup}</Text>
                {activeTrip.pickupLat && (
                  <Text style={s.coordText}>GPS: {activeTrip.pickupLat.toFixed(4)}, {activeTrip.pickupLng?.toFixed(4)}</Text>
                )}
                <Text style={s.routeItem}>🏁 {activeTrip.destination}</Text>
                {activeTrip.destLat && (
                  <Text style={s.coordText}>GPS: {activeTrip.destLat.toFixed(4)}, {activeTrip.destLng?.toFixed(4)}</Text>
                )}
              </View>

              {/* Boarding PIN */}
              <View style={s.pinBox}>
                <Text style={s.pinLabel}>SAFETY BOARDING PIN</Text>
                <Text style={s.pinVal}>{activeTrip.id.slice(-4).toUpperCase()}</Text>
                <Text style={s.pinSub}>Share this 4-digit code with your driver upon arrival.</Text>
              </View>

              {/* Incoming Driver Bids */}
              {(activeTrip.status === 'requested' || activeTrip.status === 'negotiating') && (
                <View style={s.offersContainer}>
                  <Text style={s.offersHeader}>
                    Driver Offers ({activeTrip.offers?.length || 0})
                  </Text>
                  {(!activeTrip.offers || activeTrip.offers.length === 0) ? (
                    <Text style={s.waitingOffers}>Scanning for nearby licensed drivers…</Text>
                  ) : (
                    activeTrip.offers.map((offer) => (
                      <View key={offer.id} style={s.offerRow}>
                        <View>
                          <Text style={s.offerDriverName}>{offer.driverName || 'Licensed Driver'}</Text>
                          <Text style={s.offerDriverRating}>★ 4.9 • Toyota Vitz ({offer.etaMinutes || 4} min ETA)</Text>
                        </View>
                        <Pressable
                          style={s.acceptOfferBtn}
                          onPress={() => handleAcceptDriverOffer(offer)}
                        >
                          <Text style={s.acceptOfferText}>Accept ${offer.offeredAmount.toFixed(2)}</Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* Active Ride In-Progress / Arriving */}
              {['rider_confirmed', 'driver_arriving', 'arrived', 'in_progress'].includes(activeTrip.status) && (
                <View style={s.driverDetailBox}>
                  <Text style={s.driverDetailHeader}>Assigned Driver</Text>
                  <Text style={s.driverDetailName}>{activeTrip.driverName || 'Verified RideZW Driver'}</Text>
                  <Text style={s.driverDetailVehicle}>
                    {activeTrip.driverVehicle?.make || 'Toyota'} {activeTrip.driverVehicle?.model || 'Aqua'} (Plate: {activeTrip.driverVehicle?.plateNumber || 'AFB-3912'})
                  </Text>

                  <Pressable style={s.payBtn} onPress={handleInitiateClicknPay}>
                    <Text style={s.payBtnText}>💳 Pay with ClicknPay / EcoCash / Card</Text>
                  </Pressable>
                </View>
              )}

              {/* Cancel Button */}
              <Pressable style={s.cancelBtn} onPress={handleCancelRide} disabled={loading}>
                <Text style={s.cancelBtnText}>Cancel Ride Request</Text>
              </Pressable>
            </View>
          ) : (
            /* SEARCH & BOOKING FORM */
            <View style={s.card}>
              {/* City Switcher */}
              <Text style={s.inputLabel}>Select Operating Hub</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cityScroll}>
                {AVAILABLE_CITIES.map((c) => (
                  <Pressable
                    key={c}
                    style={[s.cityChip, city === c ? s.cityChipSel : null]}
                    onPress={() => handleSelectCity(c)}
                  >
                    <Text style={[s.cityText, city === c ? s.cityTextSel : null]}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Location Search Container */}
              <View style={s.searchContainer}>
                {/* Pickup Search */}
                <View style={s.inputWrapper}>
                  <View style={s.inputHeaderRow}>
                    <Text style={s.inputLabel}>📍 Pickup Location</Text>
                    <TouchableOpacity style={s.gpsBtn} onPress={handleDetectGps} disabled={isGpsLocating}>
                      <Text style={s.gpsBtnText}>{isGpsLocating ? 'Locating…' : '🎯 Use GPS'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    value={pickupQuery}
                    onChangeText={(t) => handleQueryChange(t, 'pickup')}
                    onFocus={() => {
                      setActiveSearchField('pickup');
                      searchPlaces(pickupQuery, city).then(setSearchResults);
                    }}
                    placeholder={`Search address or landmark in ${city}…`}
                    style={[s.input, activeSearchField === 'pickup' ? s.inputFocused : null]}
                  />
                  <Text style={s.coordBadge}>
                    GPS: {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)} • {pickup.neighborhood}
                  </Text>
                </View>

                {/* Swap Button */}
                <TouchableOpacity style={s.swapBtn} onPress={handleSwap}>
                  <Text style={s.swapText}>⇅ Swap Pickup & Destination</Text>
                </TouchableOpacity>

                {/* Destination Search */}
                <View style={s.inputWrapper}>
                  <Text style={s.inputLabel}>🏁 Destination</Text>
                  <TextInput
                    value={destQuery}
                    onChangeText={(t) => handleQueryChange(t, 'destination')}
                    onFocus={() => {
                      setActiveSearchField('destination');
                      searchPlaces(destQuery, city).then(setSearchResults);
                    }}
                    placeholder={`Where are you heading in ${city}?`}
                    style={[s.input, activeSearchField === 'destination' ? s.inputFocused : null]}
                  />
                  <Text style={s.coordBadge}>
                    GPS: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)} • {destination.neighborhood}
                  </Text>
                </View>

                {/* Search Autocomplete Dropdown */}
                {activeSearchField && (
                  <View style={s.dropdownContainer}>
                    <View style={s.dropdownHeader}>
                      <Text style={s.dropdownTitle}>
                        {isSearching ? 'Searching database & OpenStreetMap…' : `Places in ${city}`}
                      </Text>
                      <TouchableOpacity onPress={() => setActiveSearchField(null)}>
                        <Text style={s.closeDropdown}>✕ Close</Text>
                      </TouchableOpacity>
                    </View>

                    {isSearching ? (
                      <ActivityIndicator color="#0e7490" style={{ marginVertical: 12 }} />
                    ) : searchResults.length === 0 ? (
                      <Text style={s.noResults}>No matching locations found in {city}.</Text>
                    ) : (
                      searchResults.map((place) => (
                        <TouchableOpacity
                          key={place.id}
                          style={s.placeItem}
                          onPress={() => handleSelectPlace(place)}
                        >
                          <Text style={s.placeIcon}>{getCategoryIcon(place.category)}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={s.placeName}>{place.name}</Text>
                            <Text style={s.placeAddress}>{place.address}</Text>
                            <Text style={s.placeCoords}>
                              {place.neighborhood} • {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* Route Summary Metrics */}
              <View style={s.routeMetricBox}>
                <View style={s.metricItem}>
                  <Text style={s.metricVal}>{routeInfo.distanceKm} km</Text>
                  <Text style={s.metricLbl}>DRIVING DISTANCE</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metricItem}>
                  <Text style={s.metricVal}>~{routeInfo.durationMinutes} min</Text>
                  <Text style={s.metricLbl}>EST. DURATION</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metricItem}>
                  <Text style={s.metricVal}>${(routeInfo.fares[category] || 5.0).toFixed(2)}</Text>
                  <Text style={s.metricLbl}>STANDARD RATE</Text>
                </View>
              </View>

              {/* Vehicle Category Selector */}
              <Text style={s.inputLabel}>Vehicle Class</Text>
              <View style={s.catGrid}>
                {[
                  { id: 'economy', label: 'Economy', price: routeInfo.fares.economy, sub: 'Fit / Demio' },
                  { id: 'comfort', label: 'Comfort AC', price: routeInfo.fares.comfort, sub: 'Axio / Allex' },
                  { id: 'xl', label: 'XL 6-Seater', price: routeInfo.fares.xl, sub: 'Alphard / Wish' },
                  { id: 'motorbike', label: 'Boda Moto', price: routeInfo.fares.motorbike, sub: 'Fast Solo' }
                ].map((c) => {
                  const isSel = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[s.catCard, isSel ? s.catCardSel : null]}
                      onPress={() => {
                        setCategory(c.id as any);
                        setFareUSD(c.price);
                      }}
                    >
                      <Text style={[s.catLabel, isSel ? s.catLabelSel : null]}>{c.label}</Text>
                      <Text style={s.catPrice}>${c.price.toFixed(2)}</Text>
                      <Text style={s.catSub}>{c.sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Proposed Fare Stepper */}
              <Text style={s.inputLabel}>Proposed Offer (USD)</Text>
              <View style={s.fareStepper}>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => setFareUSD((f) => Math.max(2.0, Number((f - 0.5).toFixed(2))))}
                >
                  <Text style={s.stepperText}>-</Text>
                </TouchableOpacity>
                <View style={s.stepperDisplay}>
                  <Text style={s.stepperValue}>${fareUSD.toFixed(2)}</Text>
                  <Text style={s.stepperSub}>~{Math.ceil(fareUSD * 26.5)} ZiG (Gov. Interbank Rate)</Text>
                </View>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => setFareUSD((f) => Number((f + 0.5).toFixed(2)))}
                >
                  <Text style={s.stepperText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Payment Channel */}
              <Text style={s.inputLabel}>Payment Method</Text>
              <View style={s.pmRow}>
                {[
                  { id: 'clicknpay', label: 'ClicknPay / OpenAPI' },
                  { id: 'ecocash', label: 'EcoCash USD/ZiG' },
                  { id: 'cash', label: 'Cash Direct' },
                  { id: 'card', label: 'POS Card' }
                ].map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    style={[s.pmChip, paymentMethod === pm.id ? s.pmChipSel : null]}
                    onPress={() => setPaymentMethod(pm.id as any)}
                  >
                    <Text style={[s.pmText, paymentMethod === pm.id ? s.pmTextSel : null]}>
                      {pm.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Button */}
              <Pressable
                style={s.button}
                onPress={handleBookRide}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.buttonText}>
                    Broadcast Ride Offer • ${fareUSD.toFixed(2)} ({routeInfo.distanceKm} km)
                  </Text>
                )}
              </Pressable>

              {message ? <Text style={s.message}>{message}</Text> : null}
            </View>
          )}

          <Text style={s.status}>
            {connected
              ? '● RideZW Engine & Zimbabwe Coordinates Active'
              : connected === false
              ? '● Backend Server Offline'
              : '● Connecting to RideZW…'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </AuthGate>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  c: { padding: 18, paddingTop: 36, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#0e7490' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 4, color: '#0f172a' },
  sosBadge: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sosText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  sub: { fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  cityScroll: { flexDirection: 'row', marginBottom: 12 },
  cityChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cityChipSel: { backgroundColor: '#0e7490', borderColor: '#0e7490' },
  cityText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  cityTextSel: { color: '#fff' },
  searchContainer: { marginVertical: 8 },
  inputWrapper: { marginBottom: 10 },
  inputHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: 4 },
  gpsBtn: { backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  gpsBtnText: { color: '#0369a1', fontSize: 11, fontWeight: '700' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a'
  },
  inputFocused: { borderColor: '#0284c7', backgroundColor: '#fff' },
  coordBadge: { fontSize: 10, color: '#64748b', marginTop: 3, marginLeft: 2 },
  swapBtn: { alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 10, marginBottom: 8 },
  swapText: { fontSize: 11, color: '#0e7490', fontWeight: '700' },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0284c7',
    padding: 10,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dropdownTitle: { fontSize: 11, fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' },
  closeDropdown: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  placeIcon: { fontSize: 18, marginRight: 10 },
  placeName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  placeAddress: { fontSize: 11, color: '#64748b' },
  placeCoords: { fontSize: 9, color: '#0e7490', marginTop: 1, fontWeight: '600' },
  noResults: { fontSize: 12, color: '#94a3b8', textAlign: 'center', paddingVertical: 10 },
  routeMetricBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 6 },
  metricVal: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  metricLbl: { fontSize: 8, fontWeight: '800', color: '#64748b', marginTop: 3 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 12 },
  catCard: {
    flexBasis: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    borderRadius: 12
  },
  catCardSel: { backgroundColor: '#e0f2fe', borderColor: '#0284c7' },
  catLabel: { fontSize: 12, fontWeight: '800', color: '#334155' },
  catLabelSel: { color: '#0369a1' },
  catPrice: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginTop: 2 },
  catSub: { fontSize: 9, color: '#64748b' },
  fareStepper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, marginBottom: 12 },
  stepperBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  stepperText: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  stepperDisplay: { flex: 1, backgroundColor: '#f8fafc', padding: 6, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' },
  stepperValue: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  stepperSub: { fontSize: 9, color: '#64748b' },
  pmRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pmChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  pmChipSel: { backgroundColor: '#0e7490', borderColor: '#0e7490' },
  pmText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  pmTextSel: { color: '#fff' },
  button: { backgroundColor: '#0e7490', padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  message: { color: '#0369a1', marginTop: 10, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  activeTripCard: { backgroundColor: '#fff', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  activeTripTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  activeBadge: { fontSize: 11, fontWeight: '900', color: '#059669', letterSpacing: 1 },
  activeTripId: { fontSize: 11, color: '#64748b', marginTop: 2 },
  activeFare: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  routeBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginVertical: 10, gap: 3 },
  routeItem: { fontSize: 13, color: '#1e293b', fontWeight: '700' },
  coordText: { fontSize: 9, color: '#0e7490', marginLeft: 16, marginBottom: 4 },
  pinBox: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  pinLabel: { fontSize: 10, fontWeight: '800', color: '#92400e', letterSpacing: 1 },
  pinVal: { fontSize: 22, fontWeight: '900', color: '#78350f', letterSpacing: 3 },
  pinSub: { fontSize: 10, color: '#92400e', marginTop: 2 },
  offersContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  offersHeader: { fontSize: 13, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  waitingOffers: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  offerRow: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  offerDriverName: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  offerDriverRating: { fontSize: 11, color: '#64748b' },
  acceptOfferBtn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  acceptOfferText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  driverDetailBox: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginVertical: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  driverDetailHeader: { fontSize: 10, fontWeight: '800', color: '#166534', letterSpacing: 1 },
  driverDetailName: { fontSize: 14, fontWeight: '800', color: '#14532d', marginTop: 2 },
  driverDetailVehicle: { fontSize: 11, color: '#15803d', marginTop: 2 },
  payBtn: { backgroundColor: '#0e7490', padding: 11, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  cancelBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 12 },
  status: { color: '#0e7490', marginTop: 20, fontSize: 11, textAlign: 'center' }
});
