import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal, useColorScheme } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useAuth } from '@/context/AuthContext';
import { useTrainer } from '@/presentation/hooks/useTrainer';
import { LineChart } from '../TrendsCharts';
import { Colors, Spacing } from '@/constants/theme';
import { User, Plus, Dumbbell, Calendar, Power, Heart, Activity as ActivityIcon, Settings, ChevronRight } from 'lucide-react-native';

export const TrainerShell = () => {
  const { user, signOut } = useAuth();
  const {
    athletes,
    selectedAthlete,
    athleteWorkouts,
    athleteActivities,
    athleteMetrics,
    loading,
    setSelectedAthlete,
    assignWorkout
  } = useTrainer(user?.id || 'coach-1');

  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Tab state for Coach Screen: athletes list vs. profile settings
  const [activeTab, setActiveTab] = useState<'athletes' | 'settings'>('athletes');
  const [athleteDetailView, setAthleteDetailView] = useState(false);

  // Form states to assign a new training plan
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [workoutType, setWorkoutType] = useState<'run' | 'gym'>('run');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Running fields
  const [targetDistance, setTargetDistance] = useState('5000');
  const [targetPace, setTargetPace] = useState('5:00');
  const [intervals, setIntervals] = useState('');
  
  // Gym fields
  const [exercises, setExercises] = useState<{ name: string; sets: number; reps: string; weight?: string }[]>([
    { name: 'Agachamento', sets: 4, reps: '10', weight: '40kg' }
  ]);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExWeight, setNewExWeight] = useState('');

  const handleAddExercise = () => {
    if (newExName) {
      setExercises([
        ...exercises,
        {
          name: newExName,
          sets: parseInt(newExSets) || 3,
          reps: newExReps || '10',
          weight: newExWeight || undefined
        }
      ]);
      setNewExName('');
      setNewExSets('3');
      setNewExReps('10');
      setNewExWeight('');
    }
  };

  const handleSaveWorkout = async () => {
    if (!title || !description) return;
    
    const details: any = {};
    if (workoutType === 'run') {
      details.targetDistance = parseFloat(targetDistance) || 0;
      details.targetPace = targetPace;
      details.intervals = intervals || undefined;
    } else {
      details.exercises = exercises;
    }

    await assignWorkout(title, description, workoutType, new Date(), details);
    
    // Reset form
    setTitle('');
    setDescription('');
    setExercises([{ name: 'Agachamento', sets: 4, reps: '10', weight: '40kg' }]);
    setAssignModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color="#ff5722" />
        <ThemedText style={{ marginTop: 12 }}>Carregando dados dos atletas...</ThemedText>
      </View>
    );
  }

  const renderAthletesTab = () => {
    if (athleteDetailView && selectedAthlete) {
      // Map health trends vectors
      const rhrVals = athleteMetrics.map(m => m.restingHeartRate).slice(-7);
      const vo2Vals = athleteMetrics.filter(m => m.vo2Max !== undefined).map(m => m.vo2Max as number).slice(-7);
      
      const chartLabels = athleteMetrics.map(m => {
        const d = new Date(m.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      }).slice(-7);

      return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.btnBack} onPress={() => setAthleteDetailView(false)}>
            <ThemedText style={{ color: '#ff5722', fontWeight: 'bold' }}>← Voltar para Atletas</ThemedText>
          </TouchableOpacity>

          <View style={styles.athleteHeader}>
            <View>
              <ThemedText type="title">{selectedAthlete.name}</ThemedText>
              <ThemedText style={{ color: themeColors.textSecondary }}>{selectedAthlete.email}</ThemedText>
            </View>
            <TouchableOpacity style={styles.btnAssign} onPress={() => setAssignModalVisible(true)}>
              <Plus size={16} color="#fff" style={{ marginRight: 4 }} />
              <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Enviar Treino</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Health Trends Summary */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>Métricas Garmin (Últimos dias)</ThemedText>
          {athleteMetrics.length > 0 ? (
            <View style={{ gap: 8 }}>
              <LineChart
                title="Evolução Frequência Cardíaca de Repouso"
                data={rhrVals}
                labels={chartLabels}
                color="#f44336"
                unit=" bpm"
              />
              <LineChart
                title="Consumo de Oxigênio (VO2 Max)"
                data={vo2Vals}
                labels={chartLabels}
                color="#ff9800"
              />
            </View>
          ) : (
            <ThemedText style={{ fontStyle: 'italic', color: themeColors.textSecondary }}>Sem histórico Garmin registrado.</ThemedText>
          )}

          {/* Athlete Workout Schedule */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>Treinos Atribuídos</ThemedText>
          {athleteWorkouts.map(w => (
            <ThemedView key={w.id} type="backgroundElement" style={styles.workoutCard}>
              <View style={styles.workoutHeaderRow}>
                <View style={[styles.badge, { backgroundColor: w.type === 'run' ? '#ff5722' : '#2196f3' }]}>
                  <ThemedText style={styles.badgeText}>{w.type === 'run' ? 'Corrida' : 'Academia'}</ThemedText>
                </View>
                <View style={[styles.statusBadge, w.status === 'completed' ? { backgroundColor: 'rgba(76,175,80,0.15)' } : { backgroundColor: 'rgba(255,152,0,0.15)' }]}>
                  <ThemedText style={[styles.statusBadgeText, w.status === 'completed' ? { color: '#4caf50' } : { color: '#ff9800' }]}>
                    {w.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="subtitle" style={{ marginTop: 8 }}>{w.title}</ThemedText>
              <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Agendado: {new Date(w.scheduledDate).toLocaleDateString('pt-BR')}</ThemedText>
              <ThemedText style={[styles.workoutDesc, { color: themeColors.textSecondary }]}>{w.description}</ThemedText>

              {w.status === 'completed' && w.athleteFeedback && (
                <View style={styles.feedbackBox}>
                  <ThemedText type="small" style={{ fontWeight: 'bold' }}>Feedback do Atleta (Esforço RPE: {w.athleteRpe}/10):</ThemedText>
                  <ThemedText type="small" style={{ fontStyle: 'italic', color: themeColors.textSecondary }}>"{w.athleteFeedback}"</ThemedText>
                </View>
              )}
            </ThemedView>
          ))}
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title">Seus Atletas</ThemedText>
        <ThemedText style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Selecione um atleta para ver métricas ou enviar planilhas</ThemedText>

        {athletes.map(ath => (
          <TouchableOpacity
            key={ath.id}
            onPress={() => {
              setSelectedAthlete(ath);
              setAthleteDetailView(true);
            }}
          >
            <ThemedView type="backgroundElement" style={styles.athleteItem}>
              <View style={styles.athleteAvatar}>
                <User size={20} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText style={{ fontWeight: 'bold' }}>{ath.name}</ThemedText>
                <ThemedText type="small" style={{ color: themeColors.textSecondary }}>{ath.email}</ThemedText>
              </View>
              <ChevronRight size={18} color={themeColors.textSecondary} />
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderSettingsTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedText type="title">Painel do Treinador</ThemedText>
      <ThemedText style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Configurações de acesso profissional</ThemedText>

      <ThemedView type="backgroundElement" style={styles.profileSection}>
        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Credencial de Coach</ThemedText>
        <ThemedText type="small" style={{ color: themeColors.textSecondary, marginBottom: 8 }}>Nome: {user?.name}</ThemedText>
        <ThemedText type="small" style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Acesso: {user?.email}</ThemedText>
        
        <TouchableOpacity style={styles.btnSignOut} onPress={signOut}>
          <Power size={18} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Sair do Aplicativo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );

  return (
    <View style={styles.shellContainer}>
      <View style={styles.viewPort}>
        {activeTab === 'athletes' && renderAthletesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </View>

      {/* Modal to Assign Workout */}
      <Modal visible={assignModalVisible} transparent animationType="slide" onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Atribuir Treino para {selectedAthlete?.name}</ThemedText>

              {/* Type Switch */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeOption, workoutType === 'run' && { backgroundColor: '#ff5722' }]}
                  onPress={() => setWorkoutType('run')}
                >
                  <ThemedText style={[styles.typeOptionText, workoutType === 'run' && { color: '#fff' }]}>Corrida</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, workoutType === 'gym' && { backgroundColor: '#ff5722' }]}
                  onPress={() => setWorkoutType('gym')}
                >
                  <ThemedText style={[styles.typeOptionText, workoutType === 'gym' && { color: '#fff' }]}>Fortalecimento</ThemedText>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected }]}
                placeholder="Título do Treino (ex: Longão de Sábado)"
                placeholderTextColor={themeColors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <TextInput
                style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected, height: 60, marginTop: 10 }]}
                placeholder="Descrição e Orientações"
                placeholderTextColor={themeColors.textSecondary}
                multiline
                value={description}
                onChangeText={setDescription}
              />

              {workoutType === 'run' ? (
                <View style={{ marginTop: 12 }}>
                  <ThemedText type="small">Pace Alvo (min/km)</ThemedText>
                  <TextInput
                    style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected, marginTop: 4 }]}
                    placeholder="ex: 5:15"
                    placeholderTextColor={themeColors.textSecondary}
                    value={targetPace}
                    onChangeText={setTargetPace}
                  />

                  <ThemedText type="small" style={{ marginTop: 8 }}>Distância Alvo (metros)</ThemedText>
                  <TextInput
                    style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected, marginTop: 4 }]}
                    placeholder="ex: 8000"
                    placeholderTextColor={themeColors.textSecondary}
                    value={targetDistance}
                    onChangeText={setTargetDistance}
                    keyboardType="numeric"
                  />

                  <ThemedText type="small" style={{ marginTop: 8 }}>Estrutura de Intervalos (Opcional)</ThemedText>
                  <TextInput
                    style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected, marginTop: 4 }]}
                    placeholder="ex: 4x 1km com 2m descanso"
                    placeholderTextColor={themeColors.textSecondary}
                    value={intervals}
                    onChangeText={setIntervals}
                  />
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <ThemedText type="subtitle" style={{ fontSize: 13, marginBottom: 6 }}>Rotina de Exercícios:</ThemedText>
                  
                  {exercises.map((ex, idx) => (
                    <ThemedText key={idx} type="small" style={{ color: themeColors.textSecondary }}>
                      {ex.name} - {ex.sets}x{ex.reps} {ex.weight ? `(${ex.weight})` : ''}
                    </ThemedText>
                  ))}

                  {/* Add exercise item */}
                  <View style={styles.addExerciseRow}>
                    <TextInput
                      style={[styles.inputField, { flex: 2, color: themeColors.text, borderColor: themeColors.backgroundSelected }]}
                      placeholder="Nome Ex."
                      placeholderTextColor={themeColors.textSecondary}
                      value={newExName}
                      onChangeText={setNewExName}
                    />
                    <TextInput
                      style={[styles.inputField, { flex: 1, color: themeColors.text, borderColor: themeColors.backgroundSelected }]}
                      placeholder="Séries"
                      placeholderTextColor={themeColors.textSecondary}
                      value={newExSets}
                      onChangeText={setNewExSets}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.inputField, { flex: 1, color: themeColors.text, borderColor: themeColors.backgroundSelected }]}
                      placeholder="Reps"
                      placeholderTextColor={themeColors.textSecondary}
                      value={newExReps}
                      onChangeText={setNewExReps}
                    />
                  </View>
                  <TouchableOpacity style={styles.btnAddEx} onPress={handleAddExercise}>
                    <ThemedText style={{ color: '#ff5722', fontWeight: 'bold', fontSize: 12 }}>+ Adicionar Exercício</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#333' }]} onPress={() => setAssignModalVisible(false)}>
                  <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ff5722' }]} onPress={handleSaveWorkout}>
                  <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Gravar e Enviar</ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      {/* Tab Nav for Coach */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.backgroundElement, borderTopColor: themeColors.backgroundSelected }]}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => { setActiveTab('athletes'); setAthleteDetailView(false); }}>
          <User size={20} color={activeTab === 'athletes' ? '#ff5722' : themeColors.textSecondary} />
          <ThemedText style={[styles.tabLabel, { color: activeTab === 'athletes' ? '#ff5722' : themeColors.textSecondary }]}>
            Atletas
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('settings')}>
          <Settings size={20} color={activeTab === 'settings' ? '#ff5722' : themeColors.textSecondary} />
          <ThemedText style={[styles.tabLabel, { color: activeTab === 'settings' ? '#ff5722' : themeColors.textSecondary }]}>
            Perfil
          </ThemedText>
        </TouchableOpacity>
      </View>
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
    flex: 1,
    flexDirection: 'column'
  },
  viewPort: {
    flex: 1
  },
  scrollContainer: {
    padding: Spacing.three,
    paddingBottom: 100
  },
  athleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: Spacing.two
  },
  athleteAvatar: {
    backgroundColor: '#ff5722',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnBack: {
    paddingVertical: 8,
    marginBottom: Spacing.three
  },
  athleteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four
  },
  btnAssign: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff5722',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: Spacing.three
  },
  workoutCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: Spacing.three
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  workoutDesc: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18
  },
  feedbackBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50'
  },
  profileSection: {
    padding: 16,
    borderRadius: 16
  },
  btnSignOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    backgroundColor: '#333'
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 8
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '500'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.four
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
    maxHeight: '85%'
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  typeOption: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e2e2e'
  },
  typeOptionText: {
    fontWeight: 'bold',
    fontSize: 13
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14
  },
  addExerciseRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8
  },
  btnAddEx: {
    paddingVertical: 10,
    alignItems: 'flex-start'
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
