import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, useColorScheme } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/presentation/hooks/useAdmin';
import { Colors, Spacing } from '@/constants/theme';
import { Users, Shield, Plus, Power, Mail, User as UserIcon, ShieldAlert } from 'lucide-react-native';

export const AdminShell = () => {
  const { user, signOut } = useAuth();
  const { users, loading, error, changeUserRole, createTrainer } = useAdmin();
  
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Form states to register coach
  const [modalVisible, setModalVisible] = useState(false);
  const [coachName, setCoachName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');

  const handleCreateTrainer = async () => {
    if (coachName && coachEmail) {
      await createTrainer(coachName, coachEmail);
      setCoachName('');
      setCoachEmail('');
      setModalVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color="#ff5722" />
        <ThemedText style={{ marginTop: 12 }}>Carregando dados administrativos...</ThemedText>
      </View>
    );
  }

  // Count metrics
  const totalUsers = users.length;
  const trainersCount = users.filter(u => u.role === 'trainer').length;
  const athletesCount = users.filter(u => u.role === 'athlete').length;

  return (
    <View style={styles.shellContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <ThemedText type="title">Painel Admin</ThemedText>
            <ThemedText style={{ color: themeColors.textSecondary }}>Gerencie treinadores e acessos de atletas</ThemedText>
          </View>
          <TouchableOpacity style={styles.btnAddTrainer} onPress={() => setModalVisible(true)}>
            <Plus size={16} color="#fff" style={{ marginRight: 4 }} />
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Cadastrar Coach</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Platform stats */}
        <View style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={styles.statBox}>
            <Users size={20} color="#ff5722" />
            <ThemedText type="subtitle" style={styles.statVal}>{totalUsers}</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Usuários</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statBox}>
            <Shield size={20} color="#2196f3" />
            <ThemedText type="subtitle" style={styles.statVal}>{trainersCount}</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Treinadores</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ShieldAlert size={20} color="#4caf50" />
            <ThemedText type="subtitle" style={styles.statVal}>{athletesCount}</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Atletas</ThemedText>
          </ThemedView>
        </View>

        {/* Users list */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Controle de Usuários</ThemedText>
        {users.map(u => (
          <ThemedView key={u.id} type="backgroundElement" style={styles.userItem}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: 'bold' }}>{u.name}</ThemedText>
              <ThemedText type="small" style={{ color: themeColors.textSecondary }}>{u.email}</ThemedText>
              <View style={[styles.roleBadge, { backgroundColor: u.role === 'admin' ? '#f44336' : u.role === 'trainer' ? '#2196f3' : '#4caf50' }]}>
                <ThemedText style={styles.roleBadgeText}>{u.role.toUpperCase()}</ThemedText>
              </View>
            </View>

            {/* Actions to promote/demote */}
            {u.id !== user?.id && (
              <View style={styles.actionRow}>
                {u.role !== 'trainer' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196f3' }]} onPress={() => changeUserRole(u.id, 'trainer')}>
                    <ThemedText style={styles.actionBtnText}>Tornar Coach</ThemedText>
                  </TouchableOpacity>
                )}
                {u.role !== 'athlete' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4caf50' }]} onPress={() => changeUserRole(u.id, 'athlete')}>
                    <ThemedText style={styles.actionBtnText}>Tornar Atleta</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.btnSignOut} onPress={signOut}>
          <Power size={18} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Sair da Administração</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal to register trainer */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>Registrar Novo Treinador</ThemedText>
            
            <View style={[styles.inputWrapper, { borderColor: themeColors.backgroundSelected }]}>
              <UserIcon size={18} color={themeColors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Nome do Treinador"
                placeholderTextColor={themeColors.textSecondary}
                value={coachName}
                onChangeText={setCoachName}
              />
            </View>

            <View style={[styles.inputWrapper, { borderColor: themeColors.backgroundSelected, marginTop: 12 }]}>
              <Mail size={18} color={themeColors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="E-mail"
                placeholderTextColor={themeColors.textSecondary}
                value={coachEmail}
                onChangeText={setCoachEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#333' }]} onPress={() => setModalVisible(false)}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ff5722' }]} onPress={handleCreateTrainer}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Cadastrar</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shellContainer: {
    flex: 1
  },
  scrollContainer: {
    padding: Spacing.three,
    paddingBottom: 60
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four
  },
  btnAddTrainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff5722',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statVal: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.two
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: Spacing.two
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start'
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold'
  },
  actionRow: {
    flexDirection: 'column',
    gap: 6
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  btnSignOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#333',
    marginTop: Spacing.five
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.four
  },
  modalContent: {
    padding: 20,
    borderRadius: 20
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
