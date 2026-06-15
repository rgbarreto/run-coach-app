import React from 'react';
import { View, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import Svg, { Path, Rect, Text, Defs, LinearGradient, Stop, Circle, G, Line } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { Colors } from '@/constants/theme';

interface ChartProps {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  title: string;
  unit?: string;
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  labels,
  height = 180,
  color = '#ff5722',
  title,
  unit = ''
}) => {
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  
  if (data.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.backgroundElement, justifyContent: 'center', height }]}>
        <ThemedText style={{ textAlign: 'center' }}>Sem dados para exibir</ThemedText>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 48; // padding
  const chartWidth = Math.min(600, screenWidth);
  const chartHeight = height - 40;
  
  const minVal = Math.max(0, Math.min(...data) - 2);
  const maxVal = Math.max(...data) + 2;
  const valRange = maxVal - minVal;

  const points = data.map((val, idx) => {
    const x = 40 + (idx / (data.length - 1 || 1)) * (chartWidth - 60);
    const y = chartHeight - 20 - ((val - minVal) / (valRange || 1)) * (chartHeight - 40);
    return { x, y, val };
  });

  // Compile Path
  let d = '';
  points.forEach((pt, idx) => {
    if (idx === 0) {
      d += `M ${pt.x} ${pt.y}`;
    } else {
      // Smooth curve calculation or line
      d += ` L ${pt.x} ${pt.y}`;
    }
  });

  // Compile area path for gradient fill under the line
  const dArea = d + ` L ${points[points.length - 1].x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`;

  return (
    <View style={[styles.card, { backgroundColor: themeColors.backgroundElement }]}>
      <ThemedText type="subtitle" style={styles.chartTitle}>{title}</ThemedText>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="0.4" />
              <Stop offset="1" stopColor={color} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1="40" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke={themeColors.textSecondary} strokeWidth="1" opacity="0.2" />
          <Line x1="40" y1="20" x2={chartWidth - 20} y2="20" stroke={themeColors.textSecondary} strokeWidth="1" opacity="0.1" />

          {/* Y Axis Labels */}
          <Text x="10" y="24" fill={themeColors.textSecondary} fontSize="10">{maxVal.toFixed(0)}</Text>
          <Text x="10" y={chartHeight - 16} fill={themeColors.textSecondary} fontSize="10">{minVal.toFixed(0)}</Text>

          {/* Area fill */}
          {points.length > 1 && (
            <Path d={dArea} fill="url(#grad)" />
          )}

          {/* Line */}
          {points.length > 1 && (
            <Path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Data Circles & Tooltips */}
          {points.map((pt, idx) => (
            <G key={idx}>
              <Circle cx={pt.x} cy={pt.y} r="4" fill={color} stroke={themeColors.backgroundElement} strokeWidth="2" />
              {/* Show only every Nth label or first/last to avoid crowding */}
              {(idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2)) && (
                <Text
                  x={pt.x}
                  y={chartHeight - 4}
                  fill={themeColors.textSecondary}
                  fontSize="9"
                  textAnchor="middle"
                >
                  {labels[idx]}
                </Text>
              )}
              {/* Value above dot for highlights */}
              {(idx === points.length - 1) && (
                <Text
                  x={pt.x}
                  y={pt.y - 8}
                  fill={themeColors.text}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pt.val.toFixed(1)}{unit}
                </Text>
              )}
            </G>
          ))}
        </Svg>
      </View>
    </View>
  );
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  labels,
  height = 180,
  color = '#2196f3',
  title,
  unit = ''
}) => {
  const scheme = useColorScheme();
  const themeColors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (data.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: themeColors.backgroundElement, justifyContent: 'center', height }]}>
        <ThemedText style={{ textAlign: 'center' }}>Sem dados para exibir</ThemedText>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 48;
  const chartWidth = Math.min(600, screenWidth);
  const chartHeight = height - 40;

  const maxVal = Math.max(...data, 10);
  const minVal = 0; // Bars usually start from zero
  const valRange = maxVal - minVal;

  const barPadding = 12;
  const usableWidth = chartWidth - 60;
  const barWidth = Math.max(8, (usableWidth / data.length) - barPadding);

  return (
    <View style={[styles.card, { backgroundColor: themeColors.backgroundElement }]}>
      <ThemedText type="subtitle" style={styles.chartTitle}>{title}</ThemedText>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity="1" />
              <Stop offset="1" stopColor={color} stopOpacity="0.4" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1="40" y1={chartHeight - 20} x2={chartWidth - 20} y2={chartHeight - 20} stroke={themeColors.textSecondary} strokeWidth="1" opacity="0.2" />

          {/* Y Axis Labels */}
          <Text x="10" y="24" fill={themeColors.textSecondary} fontSize="10">{maxVal.toFixed(0)}</Text>
          <Text x="10" y={chartHeight - 16} fill={themeColors.textSecondary} fontSize="10">0</Text>

          {/* Bars */}
          {data.map((val, idx) => {
            const pct = val / (valRange || 1);
            const barHeight = pct * (chartHeight - 40);
            const x = 45 + idx * (usableWidth / data.length) + (barPadding / 2);
            const y = chartHeight - 20 - barHeight;

            return (
              <G key={idx}>
                {/* Rounded Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(4, barWidth / 2)}
                  ry={Math.min(4, barWidth / 2)}
                  fill="url(#barGrad)"
                />
                
                {/* Label (every 3rd or first/last to avoid overlap) */}
                {(idx === 0 || idx === data.length - 1 || idx === Math.floor(data.length / 2) || data.length < 8) && (
                  <Text
                    x={x + barWidth / 2}
                    y={chartHeight - 4}
                    fill={themeColors.textSecondary}
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {labels[idx]}
                  </Text>
                )}
                
                {/* Value above bar (only if there is space) */}
                {(idx === data.length - 1 || data.length < 8) && (
                  <Text
                    x={x + barWidth / 2}
                    y={y - 5}
                    fill={themeColors.text}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {val.toFixed(0)}{unit}
                  </Text>
                )}
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch'
  }
});
