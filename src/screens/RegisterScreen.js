import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import VideoBackground from '../components/VideoBackground';

const LOGIN_VIDEO_URL = '/assets/assets/login-bg-video.mp4';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await register(name, email, password); }
    catch (error) { Alert.alert('Error', error.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <VideoBackground videoUrl={LOGIN_VIDEO_URL} overlayColor="transparent" />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={s.logoArea}>
            <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} style={s.logoCircle}>
              <Ionicons name="code-slash" size={32} color="#fff" />
            </LinearGradient>
            <Text style={s.logoTitle}>Create Account</Text>
            <Text style={s.logoSub}>Start tracking your DSA journey</Text>
          </View>

          {/* Modal Card */}
          <View style={s.modal}>
            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#888" />
              <TextInput style={s.input} placeholder="Full Name" placeholderTextColor="#999" value={name} onChangeText={setName} />
            </View>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#888" />
              <TextInput style={s.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" />
              <TextInput style={s.input} placeholder="Password" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
              </TouchableOpacity>
            </View>
            <View style={s.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#888" />
              <TextInput style={s.input} placeholder="Confirm Password" placeholderTextColor="#999" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading}>
              <LinearGradient colors={['#3BA8D4', '#62c1e5', '#a0d9ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign Up</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={s.linkWrap}>
              <Text style={s.linkText}>Already have an account? <Text style={s.linkBold}>Login</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F4F8' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoArea: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  logoSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  modal: { width: '100%', maxWidth: 380, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F5', borderRadius: 12, paddingHorizontal: 14, height: 50, marginBottom: 14, gap: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkWrap: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#666', fontSize: 13 },
  linkBold: { color: '#3BA8D4', fontWeight: '700' },
});
