import React from 'react';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { BookOpen, Zap, Heart, ShieldAlert } from 'lucide-react-native';

export default function ExploreScreen() {
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title">Manual de Corrida & Saúde</ThemedText>
        <ThemedText style={{ color: themeColors.textSecondary, marginBottom: Spacing.four }}>
          Dicas técnicas e científicas para melhorar sua performance.
        </ThemedText>

        {/* Section 1 */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeader}>
            <Heart size={20} color="#f44336" />
            <ThemedText type="subtitle" style={styles.cardTitle}>Zonas de Frequência Cardíaca</ThemedText>
          </View>
          <ThemedText type="small" style={[styles.cardDesc, { color: themeColors.textSecondary }]}>
            Treinar nas zonas certas ajuda a otimizar sua queima de gordura e aumentar sua capacidade cardiovascular:
          </ThemedText>
          <View style={styles.list}>
            <ThemedText type="small" style={{ color: themeColors.text }}>• Z1 (Regenerativo): Até 60% FC Max. Foco em recuperação ativa.</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.text, marginTop: 4 }}>• Z2 (Aeróbico Leve): 60-70% FC Max. Base de resistência (Rodagem).</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.text, marginTop: 4 }}>• Z3 (Limiar de Lactato): 70-80% FC Max. Melhora o ritmo de prova.</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.text, marginTop: 4 }}>• Z4/Z5 (Anaeróbico): Acima de 80% FC Max. Velocidade e tiros curtos.</ThemedText>
          </View>
        </ThemedView>

        {/* Section 2 */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldAlert size={20} color="#ff9800" />
            <ThemedText type="subtitle" style={styles.cardTitle}>Entendendo a Escala de RPE</ThemedText>
          </View>
          <ThemedText type="small" style={[styles.cardDesc, { color: themeColors.textSecondary }]}>
            A Percepção Subjetiva de Esforço (RPE) vai de 1 a 10 e ajuda seu treinador a calibrar a intensidade do treino:
          </ThemedText>
          <View style={styles.list}>
            <ThemedText type="small" style={{ color: themeColors.text }}>• 1 a 2: Muito fácil, respiração tranquila, conversa fluída.</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.text, marginTop: 4 }}>• 3 a 5: Moderado. Respiração começa a acelerar ligeiramente.</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.text, marginTop: 4 }}>• 6 a 8: Difícil. Respiração forte, conversas limitadas a palavras soltas.</ThemedText>
            <ThemedText type="small" style={{ color: themeColors.text, marginTop: 4 }}>• 9 a 10: Esforço máximo. Exaustão rápida, impossível falar.</ThemedText>
          </View>
        </ThemedView>

        {/* Section 3 */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeader}>
            <Zap size={20} color="#ffeb3b" />
            <ThemedText type="subtitle" style={styles.cardTitle}>Por que treinar força?</ThemedText>
          </View>
          <ThemedText type="small" style={[styles.cardDesc, { color: themeColors.textSecondary }]}>
            O fortalecimento muscular em academia (musculação) previne lesões por impacto na corrida e melhora sua economia de corrida (gasto de energia por km). Não pule os treinos de perna prescritos pelo seu treinador!
          </ThemedText>
        </ThemedView>

        {/* Section 4 */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={20} color="#2196f3" />
            <ThemedText type="subtitle" style={styles.cardTitle}>Como funciona a conexão Garmin?</ThemedText>
          </View>
          <ThemedText type="small" style={[styles.cardDesc, { color: themeColors.textSecondary }]}>
            1. Vá na aba Ajustes do app e clique em "Vincular Garmin".
            {"\n"}2. Faça login na conta Garmin Connect para conceder autorização.
            {"\n"}3. Prontinho! Ao concluir treinos com o relógio, eles aparecerão automaticamente na sua aba Feed.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    padding: Spacing.three,
    paddingBottom: 100
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: Spacing.three
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  cardDesc: {
    lineHeight: 18
  },
  list: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)'
  }
});
