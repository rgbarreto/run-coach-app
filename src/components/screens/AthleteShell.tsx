import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal, TextInput, ActivityIndicator, useColorScheme } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { LineChart, BarChart } from '../TrendsCharts';
import { Colors, Spacing } from '@/constants/theme';
import { Heart, Activity, Calendar, Settings, Power, RefreshCw, Zap, Eye, CheckCircle2, AlertCircle } from 'lucide-react-native';

export const AthleteShell = () => {
  const { user, signOut } = useAuth();
  const {
    activities,
    healthMetrics,
    workouts,
    isGarminConnected,
    loading,
    syncing,
    error,
    refresh,
    connectGarmin,
    disconnectGarmin,
    syncGarmin,
    logWorkoutManual
  } = useDashboard(user?.id || 'athlete-1');

  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  // Navigation tabs for Athlete Shell
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trends' | 'workouts' | 'settings'>('dashboard');
  
  // Modal states for logging workout manually
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [athleteRpe, setAthleteRpe] = useState('5');
  const [athleteFeedback, setAthleteFeedback] = useState('');

  const handleOpenLogModal = (plan: any) => {
    setSelectedPlan(plan);
    setAthleteRpe('5');
    setAthleteFeedback('');
    setLogModalVisible(true);
  };

  const handleSaveWorkout = async () => {
    if (selectedPlan) {
      await logWorkoutManual(selectedPlan, parseInt(athleteRpe), athleteFeedback);
      setLogModalVisible(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color="#ff5722" />
        <ThemedText style={{ marginTop: 12 }}>Carregando dados da corrida...</ThemedText>
      </View>
    );
  }

  // Helper calculations for summary
  const totalWeeklyKm = activities
    .filter(a => a.type === 'run')
    .reduce((acc, curr) => acc + curr.distance / 1000, 0);

  const totalWeeklyDuration = activities.reduce((acc, curr) => acc + curr.duration, 0);
  const totalWeeklyDurationHours = Math.round(totalWeeklyDuration / 3600);

  // Render sub-views
  const renderDashboard = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={['#ff5722']} />}
    >
      {/* Welcome & Garmin Quick Status */}
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="title">Olá, {user?.name.split(' ')[0]}</ThemedText>
          <ThemedText style={{ color: themeColors.textSecondary }}>Acompanhe seus treinos integrados</ThemedText>
        </View>
        {isGarminConnected && (
          <TouchableOpacity style={styles.syncBtn} onPress={syncGarmin} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={18} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Health Overview Cards */}
      <View style={styles.metricsGrid}>
        <ThemedView type="backgroundElement" style={styles.metricCard}>
          <Heart size={20} color="#f44336" />
          <ThemedText type="small" style={{ color: themeColors.textSecondary, marginTop: 4 }}>FC Repouso</ThemedText>
          <ThemedText style={styles.metricVal}>
            {healthMetrics[healthMetrics.length - 1]?.restingHeartRate || '--'} <ThemedText type="small">BPM</ThemedText>
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.metricCard}>
          <Zap size={20} color="#ffeb3b" />
          <ThemedText type="small" style={{ color: themeColors.textSecondary, marginTop: 4 }}>VO2 Max</ThemedText>
          <ThemedText style={styles.metricVal}>
            {healthMetrics[healthMetrics.length - 1]?.vo2Max || '--'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.metricCard}>
          <Activity size={20} color="#4caf50" />
          <ThemedText type="small" style={{ color: themeColors.textSecondary, marginTop: 4 }}>Volume Semanal</ThemedText>
          <ThemedText style={styles.metricVal}>
            {totalWeeklyKm.toFixed(1)} <ThemedText type="small">KM</ThemedText>
          </ThemedText>
        </ThemedView>
      </View>

      {/* Garmin Status Alert */}
      {!isGarminConnected ? (
        <ThemedView type="backgroundElement" style={[styles.alertCard, { borderColor: '#ff9800', borderWidth: 1 }]}>
          <AlertCircle size={24} color="#ff9800" />
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: 'bold' }}>Garmin Desconectado</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Sincronize suas atividades conectando seu relógio nas configurações.</ThemedText>
          </View>
        </ThemedView>
      ) : (
        <ThemedView type="backgroundElement" style={[styles.alertCard, { borderColor: '#4caf50', borderWidth: 1 }]}>
          <CheckCircle2 size={24} color="#4caf50" />
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontWeight: 'bold' }}>Garmin Conectado</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Atividades e dados de saúde atualizados via Garmin Connect.</ThemedText>
          </View>
        </ThemedView>
      )}

      {/* Upcoming Workouts */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>Próximo Treino</ThemedText>
      {workouts.filter(w => w.status === 'pending').slice(0, 1).map(w => (
        <ThemedView key={w.id} type="backgroundElement" style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <View style={[styles.badge, { backgroundColor: w.type === 'run' ? '#ff5722' : '#2196f3' }]}>
              <ThemedText style={styles.badgeText}>{w.type === 'run' ? 'Corrida' : 'Academia'}</ThemedText>
            </View>
            <ThemedText type="small" style={{ color: themeColors.textSecondary }}>
              {new Date(w.scheduledDate).toLocaleDateString('pt-BR')}
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={{ marginTop: 8 }}>{w.title}</ThemedText>
          <ThemedText style={[styles.workoutDesc, { color: themeColors.textSecondary }]}>{w.description}</ThemedText>
          
          {w.type === 'run' ? (
            <View style={styles.targetRow}>
              <ThemedText type="small">Meta: {w.targetDistance ? `${w.targetDistance / 1000}km` : ''} @ {w.targetPace || ''}</ThemedText>
            </View>
          ) : (
            <View style={styles.targetRow}>
              <ThemedText type="small">Exercícios: {w.exercises?.length || 0} movimentos</ThemedText>
            </View>
          )}

          <TouchableOpacity style={styles.btnCompleteNow} onPress={() => handleOpenLogModal(w)}>
            <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Registrar Conclusão</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ))}

      {/* Activities Feed (Strava Style) */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>Histórico de Atividades</ThemedText>
      {activities.length === 0 ? (
        <ThemedText style={{ color: themeColors.textSecondary, fontStyle: 'italic', paddingHorizontal: 12 }}>Nenhuma atividade registrada.</ThemedText>
      ) : (
        activities.map(a => (
          <ThemedView key={a.id} type="backgroundElement" style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <View>
                <ThemedText style={{ fontWeight: 'bold' }}>{a.title}</ThemedText>
                <ThemedText type="small" style={{ color: themeColors.textSecondary }}>
                  {a.source === 'garmin' ? '⌚ Garmin Connect' : '📝 Registro Manual'}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: themeColors.textSecondary }}>
                {new Date(a.startTime).toLocaleDateString('pt-BR')}
              </ThemedText>
            </View>

            <View style={styles.feedStats}>
              {a.type === 'run' && (
                <>
                  <View style={styles.statCol}>
                    <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Distância</ThemedText>
                    <ThemedText style={styles.statVal}>{a.getFormattedDistance()}</ThemedText>
                  </View>
                  <View style={styles.statCol}>
                    <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Ritmo</ThemedText>
                    <ThemedText style={styles.statVal}>{a.getFormattedPace()}</ThemedText>
                  </View>
                </>
              )}
              <View style={styles.statCol}>
                <ThemedText type="small" style={{ color: themeColors.textSecondary }}>Tempo</ThemedText>
                <ThemedText style={styles.statVal}>{a.getFormattedDuration()}</ThemedText>
              </View>
              {a.averageHeartRate && (
                <View style={styles.statCol}>
                  <ThemedText type="small" style={{ color: themeColors.textSecondary }}>FC Média</ThemedText>
                  <ThemedText style={styles.statVal}>{a.averageHeartRate} <ThemedText type="small" style={{ fontSize: 8 }}>BPM</ThemedText></ThemedText>
                </View>
              )}
            </View>
          </ThemedView>
        ))
      )}
    </ScrollView>
  );

  const renderTrends = () => {
    // Map health data vectors for charts
    const rhrVals = healthMetrics.map(m => m.restingHeartRate).slice(-10);
    const vo2Vals = healthMetrics.filter(m => m.vo2Max !== undefined).map(m => m.vo2Max as number).slice(-10);
    const sleepVals = healthMetrics.filter(m => m.sleepDurationMinutes !== undefined).map(m => (m.sleepDurationMinutes as number) / 60).slice(-10);
    
    const chartLabels = healthMetrics.map(m => {
      const d = new Date(m.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }).slice(-10);

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title">Tendências & Saúde</ThemedText>
        <ThemedText style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Análise evolutiva de performance cardíaca e sono</ThemedText>

        <LineChart
          title="Frequência Cardíaca de Repouso (Tendência de Condicionamento)"
          data={rhrVals}
          labels={chartLabels}
          color="#f44336"
          unit=" bpm"
        />

        <LineChart
          title="Consumo Máximo de Oxigênio (VO2 Max)"
          data={vo2Vals}
          labels={chartLabels}
          color="#ff9800"
        />

        <BarChart
          title="Horas de Sono por Noite"
          data={sleepVals}
          labels={chartLabels}
          color="#9c27b0"
          unit="h"
        />
      </ScrollView>
    );
  };

  const renderWorkouts = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedText type="title">Planilha de Treinos</ThemedText>
      <ThemedText style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Cronograma de treinos enviado pelo seu treinador</ThemedText>

      {workouts.map(w => (
        <ThemedView key={w.id} type="backgroundElement" style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
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
          <ThemedText style={[styles.workoutDesc, { color: themeColors.textSecondary }]}>{w.description}</ThemedText>

          {w.type === 'run' ? (
            <View style={styles.targetRow}>
              <ThemedText type="small" style={{ fontWeight: 'bold' }}>Objetivo: {w.targetDistance ? `${w.targetDistance / 1000}km` : ''} @ {w.targetPace || ''}</ThemedText>
              {w.intervals && <ThemedText type="small" style={{ color: themeColors.textSecondary, marginTop: 4 }}>Estrutura: {w.intervals}</ThemedText>}
            </View>
          ) : (
            <View style={styles.targetRow}>
              <ThemedText type="small" style={{ fontWeight: 'bold', marginBottom: 6 }}>Rotina de Fortalecimento:</ThemedText>
              {w.exercises?.map((ex, idx) => (
                <ThemedText key={idx} type="small" style={{ color: themeColors.textSecondary }}>
                  • {ex.name}: {ex.sets} séries x {ex.reps} {ex.weight ? `(${ex.weight})` : ''}
                </ThemedText>
              ))}
            </View>
          )}

          {w.status !== 'completed' && (
            <TouchableOpacity style={styles.btnCompleteNow} onPress={() => handleOpenLogModal(w)}>
              <ThemedText style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Registrar Conclusão</ThemedText>
            </TouchableOpacity>
          )}

          {w.status === 'completed' && w.athleteFeedback && (
            <View style={styles.feedbackBox}>
              <ThemedText type="small" style={{ fontWeight: 'bold' }}>Seu Feedback (Esforço RPE: {w.athleteRpe}/10):</ThemedText>
              <ThemedText type="small" style={{ fontStyle: 'italic', color: themeColors.textSecondary }}>"{w.athleteFeedback}"</ThemedText>
            </View>
          )}
        </ThemedView>
      ))}
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedText type="title">Configurações</ThemedText>
      <ThemedText style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Integrações de dados e conta do atleta</ThemedText>

      <ThemedView type="backgroundElement" style={styles.settingsSection}>
        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Integração Garmin Connect</ThemedText>
        <ThemedText type="small" style={{ color: themeColors.textSecondary, marginBottom: 16 }}>
          Conecte sua conta do Garmin para receber atualizações automáticas sempre que você sincronizar o seu relógio.
        </ThemedText>

        {!isGarminConnected ? (
          <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: '#ff5722' }]} onPress={connectGarmin}>
            <ThemedText style={styles.btnText}>Vincular Conta Garmin Connect</ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 8 }}>
            <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: '#4caf50' }]} onPress={syncGarmin} disabled={syncing}>
              {syncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.btnText}>Sincronizar Relógio Agora</ThemedText>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#f44336' }]} onPress={disconnectGarmin}>
              <ThemedText style={[styles.btnText, { color: '#f44336' }]}>Desconectar Garmin</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>

      <ThemedView type="backgroundElement" style={[styles.settingsSection, { marginTop: 16 }]}>
        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Dados da Conta</ThemedText>
        <ThemedText type="small" style={{ color: themeColors.textSecondary, marginBottom: 8 }}>Identificação: {user?.name}</ThemedText>
        <ThemedText type="small" style={{ color: themeColors.textSecondary, marginBottom: 16 }}>Acesso: {user?.email}</ThemedText>
        
        <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: '#333' }]} onPress={signOut}>
          <Power size={18} color="#fff" style={{ marginRight: 8 }} />
          <ThemedText style={styles.btnText}>Sair do Aplicativo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );

  return (
    <View style={styles.shellContainer}>
      <View style={styles.viewPort}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'workouts' && renderWorkouts()}
        {activeTab === 'settings' && renderSettings()}
      </View>

      {/* Modal to log feedback */}
      <Modal visible={logModalVisible} transparent animationType="slide" onRequestClose={() => setLogModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Concluir Treino: {selectedPlan?.title}</ThemedText>
            
            <ThemedText type="small" style={{ marginBottom: 6 }}>Percepção de Esforço (RPE: 1 - Muito Leve, 10 - Esforço Máximo)</ThemedText>
            <TextInput
              style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected }]}
              keyboardType="number-pad"
              value={athleteRpe}
              onChangeText={setAthleteRpe}
            />

            <ThemedText type="small" style={{ marginBottom: 6, marginTop: 12 }}>Comentários / Feedback para o Treinador</ThemedText>
            <TextInput
              style={[styles.inputField, { color: themeColors.text, borderColor: themeColors.backgroundSelected, height: 80 }]}
              multiline
              value={athleteFeedback}
              onChangeText={setAthleteFeedback}
              placeholder="Como se sentiu durante o treino?"
              placeholderTextColor={themeColors.textSecondary}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#333' }]} onPress={() => setLogModalVisible(false)}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ff5722' }]} onPress={handleSaveWorkout}>
                <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Salvar Treino</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Tab bar navigation */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.backgroundElement, borderTopColor: themeColors.backgroundSelected }]}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('dashboard')}>
          <Activity size={20} color={activeTab === 'dashboard' ? '#ff5722' : themeColors.textSecondary} />
          <ThemedText style={[styles.tabLabel, { color: activeTab === 'dashboard' ? '#ff5722' : themeColors.textSecondary }]}>
            Feed
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('trends')}>
          <Heart size={20} color={activeTab === 'trends' ? '#ff5722' : themeColors.textSecondary} />
          <ThemedText style={[styles.tabLabel, { color: activeTab === 'trends' ? '#ff5722' : themeColors.textSecondary }]}>
            Saúde
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('workouts')}>
          <Calendar size={20} color={activeTab === 'workouts' ? '#ff5722' : themeColors.textSecondary} />
          <ThemedText style={[styles.tabLabel, { color: activeTab === 'workouts' ? '#ff5722' : themeColors.textSecondary }]}>
            Planilha
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('settings')}>
          <Settings size={20} color={activeTab === 'settings' ? '#ff5722' : themeColors.textSecondary} />
          <ThemedText style={[styles.tabLabel, { color: activeTab === 'settings' ? '#ff5722' : themeColors.textSecondary }]}>
            Ajustes
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four
  },
  syncBtn: {
    backgroundColor: '#ff5722',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'flex-start'
  },
  metricVal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: 14,
    borderRadius: 16,
    marginBottom: Spacing.four
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: Spacing.three
  },
  workoutCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#333'
  },
  workoutHeader: {
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
    marginTop: Spacing.one,
    lineHeight: 18
  },
  targetRow: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  btnCompleteNow: {
    backgroundColor: '#ff5722',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  feedbackBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50'
  },
  feedCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: Spacing.two
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  feedStats: {
    flexDirection: 'row',
    gap: Spacing.four
  },
  statCol: {
    flex: 1
  },
  statVal: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2
  },
  settingsSection: {
    padding: 16,
    borderRadius: 16
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
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
    borderRadius: 20
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
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
