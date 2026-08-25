import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ridezwApi } from './api';

export function AuthGate({ role, children }: { role: 'rider' | 'driver'; children: ReactNode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [signup, setSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    ridezwApi.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const u = signup
        ? await ridezwApi.signUp(email, password, role, name)
        : await ridezwApi.signIn(email, password);

      if (u?.user_metadata?.role && u.user_metadata.role !== role) {
        throw new Error('This account is not registered for the ' + role + ' app.');
      }
      setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <View style={{ flex: 1 }}>
        {children}
        <Pressable
          style={a.signout}
          onPress={async () => {
            await ridezwApi.signOut();
            setUser(null);
          }}
        >
          <Text style={a.signoutText}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={a.screen}>
      <Text style={a.brand}>RIDEZW</Text>
      <Text style={a.title}>{role === 'rider' ? 'Rider sign in' : 'Driver cockpit sign in'}</Text>
      {signup && (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          style={a.input}
        />
      )}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={a.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={a.input}
      />
      <Pressable style={a.button} onPress={submit} disabled={loading}>
        <Text style={a.buttonText}>{loading ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</Text>
      </Pressable>
      {error ? <Text style={a.error}>{error}</Text> : null}
      <Pressable onPress={() => setSignup(!signup)}>
        <Text style={a.link}>{signup ? 'Already have an account? Sign in' : 'New to RideZW? Create an account'}</Text>
      </Pressable>
    </View>
  );
}

const a = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#f7fafc'
  },
  brand: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#0e7490'
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 28,
    color: '#0f172a'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  button: {
    backgroundColor: '#0e7490',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16
  },
  error: {
    color: '#dc2626',
    marginTop: 14,
    fontSize: 14
  },
  link: {
    color: '#0e7490',
    fontWeight: '700',
    marginTop: 22,
    textAlign: 'center'
  },
  signout: {
    position: 'absolute',
    right: 20,
    top: 45,
    padding: 8,
    zIndex: 99
  },
  signoutText: {
    color: '#0e7490',
    fontWeight: '700'
  }
});
