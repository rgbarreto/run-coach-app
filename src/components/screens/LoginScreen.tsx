import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing } from '@/constants/theme';
import { Shield, Mail, Lock, User as UserIcon, Activity } from 'lucide-react-native';

export const LoginScreen = () => {
  const { signIn, signUp } = useAuth();
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'athlete' | 'trainer'>('athlete');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('E-mail e senha são obrigatórios.');
      return;
    }
    if (isSignUp && !name) {
      setError('Nome é obrigatório para cadastro.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name, role);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: themeColors.background }]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.logoContainer}>
          <Activity size={48} color="#ff5722" strokeWidth={2.5} />
          <ThemedText type="title" style={styles.title}>
            RUNCOACH
          </ThemedText>
          <ThemedText style={{ color: themeColors.textSecondary, fontSize: 13 }}>
            Seu treinador inteligente de corrida e academia
          </ThemedText>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.form}>
          {isSignUp && (
            <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
              <UserIcon size={18} color={themeColors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Nome Completo"
                placeholderTextColor={themeColors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
            <Mail size={18} color={themeColors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              placeholder="Endereço de E-mail"
              placeholderTextColor={themeColors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
            <Lock size={18} color={themeColors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              placeholder="Senha de Acesso"
              placeholderTextColor={themeColors.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isSignUp && (
            <View style={styles.roleContainer}>
              <ThemedText style={styles.roleLabel}>Cadastrar como:</ThemedText>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'athlete' && { backgroundColor: '#ff5722' }
                  ]}
                  onPress={() => setRole('athlete')}
                >
                  <ThemedText style={[styles.roleOptionText, role === 'athlete' && { color: '#fff' }]}>
                    Atleta
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'trainer' && { backgroundColor: '#ff5722' }
                  ]}
                  onPress={() => setRole('trainer')}
                >
                  <ThemedText style={[styles.roleOptionText, role === 'trainer' && { color: '#fff' }]}>
                    Treinador
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnSubmit, loading && { opacity: 0.8 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.btnSubmitText}>
                {isSignUp ? 'Criar Conta' : 'Entrar na Plataforma'}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnToggle}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
          >
            <ThemedText style={{ color: '#ff5722', fontWeight: 'bold', textAlign: 'center' }}>
              {isSignUp ? 'Já possui uma conta? Faça Login' : 'Não tem conta? Cadastre-se grátis'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.devHints}>
          <Shield size={12} color={themeColors.textSecondary} />
          <ThemedText style={[styles.hintText, { color: themeColors.textSecondary }]}>
            Dica Dev: Digite e-mail com "coach" ou "admin" para testar outros papéis.
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: Spacing.two,
    color: '#ff5722',
  },
  form: {
    gap: Spacing.three,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  roleContainer: {
    marginVertical: Spacing.one,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  roleOption: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e2e2e',
  },
  roleOptionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnSubmit: {
    backgroundColor: '#ff5722',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
  },
  btnSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnToggle: {
    marginTop: Spacing.two,
    padding: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f44336',
    marginBottom: Spacing.three,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },
  devHints: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  hintText: {
    fontSize: 10,
  },
});
