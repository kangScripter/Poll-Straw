import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { VictoryBar, VictoryChart, VictoryPie, VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';
import { usePollStore } from '@/store/pollStore';
import { useRealTimeVotes } from '@/hooks/useRealTimeVotes';
import { Button } from '@/components/common/Button';
import { colors } from '@/theme/colors';
import { RootStackParamList, Poll } from '@/types';

type ResultsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 80;
const CHART_HEIGHT = 300;

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { pollId } = route.params;
  const { currentPoll, fetchPoll, getResults } = usePollStore();
  const { results: realTimeResults, isConnected } = useRealTimeVotes(pollId);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    fetchPoll(pollId);
  }, [pollId]);

  const displayPoll = realTimeResults || currentPoll;

  if (!displayPoll) {
    return null;
  }

  const chartData = displayPoll.options.map((option, index) => ({
    x: option.text.length > 15 ? option.text.substring(0, 15) + '...' : option.text,
    y: option.voteCount,
    label: `${option.voteCount} (${option.percentage}%)`,
    option: option,
  }));

  const pieData = displayPoll.options.map((option) => ({
    x: option.text.length > 10 ? option.text.substring(0, 10) + '...' : option.text,
    y: option.voteCount,
    option: option,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{displayPoll.title}</Text>
            {displayPoll.description && (
              <Text style={styles.description}>{displayPoll.description}</Text>
            )}
          </View>
          {isConnected && (
            <View style={styles.connectionBadge}>
              <View style={styles.connectionDot} />
              <Text style={styles.connectionText}>Live</Text>
            </View>
          )}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
            <Text style={styles.statValue}>{displayPoll.totalVotes}</Text>
            <Text style={styles.statLabel}>Total Votes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="options" size={24} color={colors.secondary[500]} />
            <Text style={styles.statValue}>{displayPoll.options.length}</Text>
            <Text style={styles.statLabel}>Options</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="eye" size={24} color={colors.success} />
            <Text style={styles.statValue}>{displayPoll.viewCount}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>

        {/* Chart Type Toggle */}
        <View style={styles.chartToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, chartType === 'bar' && styles.toggleButtonActive]}
            onPress={() => setChartType('bar')}
          >
            <Ionicons
              name="bar-chart"
              size={20}
              color={chartType === 'bar' ? colors.white : colors.gray[600]}
            />
            <Text
              style={[
                styles.toggleText,
                chartType === 'bar' && styles.toggleTextActive,
              ]}
            >
              Bar Chart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, chartType === 'pie' && styles.toggleButtonActive]}
            onPress={() => setChartType('pie')}
          >
            <Ionicons
              name="pie-chart"
              size={20}
              color={chartType === 'pie' ? colors.white : colors.gray[600]}
            />
            <Text
              style={[
                styles.toggleText,
                chartType === 'pie' && styles.toggleTextActive,
              ]}
            >
              Pie Chart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {chartType === 'bar' ? (
            <VictoryChart
              theme={VictoryTheme.material}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              domainPadding={{ x: 20, y: 10 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: colors.gray[300] },
                  tickLabels: { fill: colors.gray[600], fontSize: 10 },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: colors.gray[300] },
                  tickLabels: { fill: colors.gray[600], fontSize: 10 },
                }}
              />
              <VictoryBar
                data={chartData}
                x="x"
                y="y"
                style={{
                  data: {
                    fill: colors.primary[500],
                    width: 30,
                  },
                }}
                labels={({ datum }) => `${datum.y}`}
                labelComponent={<VictoryLabel dy={-10} style={{ fill: colors.gray[700], fontSize: 12 }} />}
              />
            </VictoryChart>
          ) : (
            <View style={styles.pieContainer}>
              <VictoryPie
                data={pieData}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                colorScale={[
                  colors.primary[500],
                  colors.secondary[500],
                  colors.success,
                  colors.warning,
                  colors.error,
                  colors.primary[300],
                  colors.secondary[300],
                  colors.gray[400],
                ]}
                labelRadius={({ innerRadius }) => innerRadius! + 40}
                style={{
                  labels: {
                    fill: colors.gray[700],
                    fontSize: 12,
                    fontWeight: '600',
                  },
                }}
                labelComponent={<VictoryLabel />}
              />
            </View>
          )}
        </View>

        {/* Results List */}
        <View style={styles.resultsList}>
          <Text style={styles.resultsTitle}>Detailed Results</Text>
          {displayPoll.options
            .sort((a, b) => b.voteCount - a.voteCount)
            .map((option, index) => (
              <View key={option.id} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultRank}>
                    <Text style={styles.resultRankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <View style={styles.resultTextContainer}>
                      {option.emoji && (
                        <Text style={styles.resultEmoji}>{option.emoji}</Text>
                      )}
                      <Text style={styles.resultText} numberOfLines={1}>
                        {option.text}
                      </Text>
                    </View>
                    <View style={styles.resultStats}>
                      <Text style={styles.resultVotes}>
                        {option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'}
                      </Text>
                      <Text style={styles.resultPercentage}>{option.percentage}%</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.resultBarContainer}>
                  <View
                    style={[
                      styles.resultBar,
                      {
                        width: `${option.percentage}%`,
                        backgroundColor:
                          index === 0
                            ? colors.primary[500]
                            : index === 1
                            ? colors.secondary[500]
                            : index === 2
                            ? colors.success
                            : colors.gray[400],
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Share Results"
            onPress={() =>
              navigation.navigate('Share', {
                pollId: displayPoll.id,
                shareUrl: displayPoll.shareUrl,
              })
            }
            variant="outline"
            size="lg"
            leftIcon={<Ionicons name="share-outline" size={20} color={colors.primary[500]} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.gray[600],
    lineHeight: 22,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 6,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  chartToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[500],
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
  },
  toggleTextActive: {
    color: colors.white,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  resultRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[600],
  },
  resultInfo: {
    flex: 1,
  },
  resultTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultEmoji: {
    fontSize: 18,
  },
  resultText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultVotes: {
    fontSize: 13,
    color: colors.gray[600],
  },
  resultPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary[500],
  },
  resultBarContainer: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  resultBar: {
    height: '100%',
    borderRadius: 4,
  },
  actions: {
    gap: 12,
  },
});
