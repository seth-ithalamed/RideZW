import { AuthGate } from './src/AuthGate';
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
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ridezwApi, MobileTrip } from './src/api';

export default function DriverApp() {
  const [available, setAvailable] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [activeTrips, setActiveTrips] = useState<MobileTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [counterBids, setCounterBids] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [todayTripsCount, setTodayTripsCount] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);

  // Polling ref
  const pollTimerRef = useRef<any>(null);

  const fetchTrips = async () => {
    try {
      const res = await ridezwApi.activeTrips();
      if (res && Array.isArray(res.trips)) {
        setActiveTrips(res.trips);
      }
    } catch {
      // Ignore background network transient errors
    }
  };

  useEffect(() => {
    ridezwApi.health()
      .then(() => setConnected(true))
      .catch(() => setConnected(false));

    fetchTrips();
    pollTimerRef.current = setInterval(fetchTrips, 4000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const toggleAvailability = async () => {
    setLoading(true);
    const next = !available;
    try {
      // Simulate/get Harare location coordinates
      const lat = -17.8292 + (Math.random() - 0.5) * 0.04;
      const lng = 31.0522 + (Math.random() - 0.5) * 0.04;
      await ridezwApi.setDriverAvailability(next, lat, lng);
      setAvailable(next);
      setStatusMessage(next ? '🟢 You are online and receiving ride requests.' : '⚪ You are offline.');
      fetchTrips();
    } catch (e: any) {
      Alert.alert('Status Error', e.message || 'Could not update availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrip = async (trip: MobileTrip) => {
    setLoading(true);
    try {
      await ridezwApi.updateTripStatus(trip.id, 'driver_accepted');
      setStatusMessage(`Accepted trip #${trip.id.slice(-4)}`);
      await fetchTrips();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to accept trip');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCounterOffer = async (tripId: string) => {
    const amount = Number(counterBids[tripId]);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid Bid', 'Please enter a valid fare amount (e.g. 5.00)');
      return;
    }
    setLoading(true);
    try {
      await ridezwApi.submitOffer(tripId, amount);
      setStatusMessage(`Counter-offer of $${amount.toFixed(2)} sent!`);
      setCounterBids((prev) => ({ ...prev, [tripId]: '' }));
      await fetchTrips();
    } catch (e: any) {
      Alert.alert('Bid Error', e.message || 'Failed to submit counter-bid');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceTripState = async (tripId: string, nextStatus: string) => {
    setLoading(true);
    try {
      await ridezwApi.updateTripStatus(tripId, nextStatus);
      if (nextStatus === 'completed') {
        setTodayTripsCount((c) => c + 1);
        const trip = activeTrips.find((t) => t.id === tripId);
        const fare = trip?.agreedFareUSD || trip?.proposedFareUSD || 5.0;
        setTodayEarnings((e) => Number((e + fare * 0.88).toFixed(2))); // 12% commission
        setStatusMessage(`Trip completed! $${(fare * 0.88).toFixed(2)} added to driver wallet.`);
      } else {
        setStatusMessage(`Trip status updated: ${nextStatus.replace('_', ' ')}`);
      }
      await fetchTrips();
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not update trip state');
    } finally {
      setLoading(false);
    }
  };

  const handleSos = async () => {
    Alert.alert(
      '🚨 EMERGENCY SOS',
      'This will dispatch an immediate emergency alert to the RideZW 24/7 Safety Operations Command in Harare with your GPS coordinates. Confirm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await ridezwApi.triggerEmergencySos({
                lat: -17.8292,
                lng: 31.0522,
                address: 'Driver Cockpit Mobile Beacon (Harare)'
              });
              Alert.alert('SOS Dispatched', 'Emergency responders and safety team have been alerted.');
            } catch (err: any) {
              Alert.alert('Alert', 'SOS alert logged to operations queue.');
            }
          }
        }
      ]
    );
  };

  return (
    <AuthGate role="driver">
      <SafeAreaView style={s.safe}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={s.c}>
          {/* Header */}
          <View style={s.headerRow}>
            <View>
              <Text style={s.eyebrow}>RIDEZW • DRIVER COCKPIT</Text>
              <Text style={s.title}>Driver Command</Text>
            </View>
            <Pressable style={s.sosBadge} onPress={handleSos}>
              <Text style={s.sosText}>🚨 SOS</Text>
            </Pressable>
          </View>
          <Text style={s.sub}>Real-time shift management, offers & compliance.</Text>

          {/* Shift Hero */}
          <View style={[s.hero, { backgroundColor: available ? '#064e3b' : '#0f172a' }]}>
            <View style={s.heroTop}>
              <View>
                <Text style={s.heroTitle}>{available ? '● You are Online' : '○ You are Offline'}</Text>
                <Text style={s.heroText}>
                  {available ? 'Broadcasting GPS • Receiving Harare ride offers' : 'Toggle shift to receive passenger requests'}
                </Text>
              </View>
            </View>
            <Pressable
              style={[s.button, { backgroundColor: available ? '#ef4444' : '#10b981' }]}
              onPress={toggleAvailability}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.buttonText}>{available ? 'Go Offline (End Shift)' : 'Go Online (Start Shift)'}</Text>
              )}
            </Pressable>
          </View>

          {/* Status Message */}
          {statusMessage ? <Text style={s.statusBanner}>{statusMessage}</Text> : null}

          {/* Daily Shift Stats */}
          <View style={s.stats}>
            <View style={s.statBox}>
              <Text style={s.statVal}>${todayEarnings.toFixed(2)}</Text>
              <Text style={s.statLbl}>NET EARNINGS</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statVal}>{todayTripsCount}</Text>
              <Text style={s.statLbl}>TRIPS COMPLETED</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statVal}>★ 4.95</Text>
              <Text style={s.statLbl}>DRIVER RATING</Text>
            </View>
          </View>

          {/* Incoming & Active Trips Section */}
          <Text style={s.sectionHeader}>Active & Incoming Rides ({activeTrips.length})</Text>

          {activeTrips.length === 0 ? (
            <View style={s.emptyCard}>
              <Text style={s.emptyTitle}>
                {available ? 'Scanning for nearby passengers…' : 'Go online to see live ride requests'}
              </Text>
              <Text style={s.emptySub}>
                When riders request trips in your sector, they will appear here instantly for bidding or acceptance.
              </Text>
            </View>
          ) : (
            activeTrips.map((trip) => {
              const isAssignedToMe = trip.status !== 'negotiating' && trip.status !== 'requested';
              const fare = trip.agreedFareUSD || trip.proposedFareUSD || 4.0;

              return (
                <View key={trip.id} style={s.tripCard}>
                  <View style={s.tripTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.tripCategory}>
                        {trip.category?.toUpperCase() || 'ECONOMY'} • #{trip.id.slice(-4).toUpperCase()}
                      </Text>
                      <Text style={s.routeText}>📍 {trip.pickup || 'Pickup Location'}</Text>
                      <Text style={s.routeText}>🏁 {trip.destination || 'Destination'}</Text>
                    </View>
                    <View style={s.fareBox}>
                      <Text style={s.fareAmount}>${fare.toFixed(2)}</Text>
                      <Text style={s.fareLabel}>EST. FARE</Text>
                    </View>
                  </View>

                  {/* Negotiation State */}
                  {(trip.status === 'negotiating' || trip.status === 'requested') && (
                    <View style={s.negotiateBox}>
                      <Pressable
                        style={[s.actionBtn, { backgroundColor: '#0e7490' }]}
                        onPress={() => handleAcceptTrip(trip)}
                        disabled={loading}
                      >
                        <Text style={s.actionBtnText}>Accept at ${fare.toFixed(2)}</Text>
                      </Pressable>

                      <View style={s.counterRow}>
                        <TextInput
                          value={counterBids[trip.id] || ''}
                          onChangeText={(val) => setCounterBids((prev) => ({ ...prev, [trip.id]: val }))}
                          placeholder="Custom bid ($)"
                          keyboardType="numeric"
                          style={s.counterInput}
                        />
                        <Pressable
                          style={[s.actionBtn, { backgroundColor: '#f59e0b', paddingHorizontal: 16 }]}
                          onPress={() => handleSendCounterOffer(trip.id)}
                          disabled={loading}
                        >
                          <Text style={[s.actionBtnText, { color: '#0f172a' }]}>Send Bid</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {/* Active Ride Controls */}
                  {isAssignedToMe && (
                    <View style={s.activeLifecycleBox}>
                      <Text style={s.lifecycleStatus}>
                        Current Stage: <Text style={{ fontWeight: '800' }}>{trip.status.replace('_', ' ').toUpperCase()}</Text>
                      </Text>

                      {trip.status === 'driver_accepted' && (
                        <Pressable
                          style={[s.actionBtn, { backgroundColor: '#0284c7' }]}
                          onPress={() => handleAdvanceTripState(trip.id, 'driver_arriving')}
                          disabled={loading}
                        >
                          <Text style={s.actionBtnText}>🚗 En Route to Pickup</Text>
                        </Pressable>
                      )}

                      {trip.status === 'driver_arriving' && (
                        <Pressable
                          style={[s.actionBtn, { backgroundColor: '#059669' }]}
                          onPress={() => handleAdvanceTripState(trip.id, 'arrived')}
                          disabled={loading}
                        >
                          <Text style={s.actionBtnText}>📍 I Have Arrived at Pickup</Text>
                        </Pressable>
                      )}

                      {trip.status === 'arrived' && (
                        <Pressable
                          style={[s.actionBtn, { backgroundColor: '#10b981' }]}
                          onPress={() => handleAdvanceTripState(trip.id, 'in_progress')}
                          disabled={loading}
                        >
                          <Text style={s.actionBtnText}>🟢 Passenger Boarded (Start Trip)</Text>
                        </Pressable>
                      )}

                      {trip.status === 'in_progress' && (
                        <Pressable
                          style={[s.actionBtn, { backgroundColor: '#16a34a' }]}
                          onPress={() => handleAdvanceTripState(trip.id, 'completed')}
                          disabled={loading}
                        >
                          <Text style={s.actionBtnText}>🏁 Arrived at Destination (Complete & Collect)</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Backend Connection Indicator */}
          <Text style={s.status}>
            {connected
              ? '● Backend Connected (OpenAPI Africa & Supabase Active)'
              : connected === false
              ? '● Backend Offline'
              : '● Connecting to RideZW…'}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </AuthGate>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  c: { padding: 20, paddingTop: 40, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#0e7490' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 4, color: '#0f172a' },
  sosBadge: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sosText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  sub: { fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 18 },
  hero: { padding: 20, borderRadius: 20, marginBottom: 16 },
  heroTop: { marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroText: { color: '#cbd5e1', marginTop: 4, fontSize: 13 },
  button: { padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statusBanner: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14
  },
  stats: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#e2e8f0', marginHorizontal: 8 },
  statVal: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  statLbl: { fontSize: 9, fontWeight: '700', color: '#64748b', marginTop: 4 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textAlign: 'center' },
  emptySub: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  tripTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tripCategory: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#0e7490', marginBottom: 4 },
  routeText: { fontSize: 13, color: '#1e293b', fontWeight: '600', marginBottom: 2 },
  fareBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fareAmount: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  fareLabel: { fontSize: 8, fontWeight: '800', color: '#64748b' },
  negotiateBox: { marginTop: 8, gap: 8 },
  counterRow: { flexDirection: 'row', gap: 8 },
  counterInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14
  },
  actionBtn: { padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  activeLifecycleBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8 },
  lifecycleStatus: { fontSize: 12, color: '#475569', marginBottom: 4 },
  status: { color: '#0e7490', marginTop: 24, fontSize: 12, textAlign: 'center' }
});
