import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fitnessTheme } from '../constants/Colors';
import { ProgressEntry } from '../hooks/useProgress';

interface ProgressChartProps {
  data: ProgressEntry[];
  title: string;
  color?: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, title, color = fitnessTheme.primary }) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Calculate dynamic chart dimensions
  const screenWidth = Dimensions.get('window').width;
  const minChartWidth = screenWidth - 40; // Minimum width for small datasets
  const pointSpacing = 80; // Minimum spacing between data points
  const dynamicWidth = Math.max(minChartWidth, sortedData.length * pointSpacing);
  
  // Extract dates and scores with smart labeling
  const dates = sortedData.map((entry, index) => {
    const date = new Date(entry.date);
    
    // For many data points, show only every few labels to avoid crowding
    if (sortedData.length > 8) {
      // Show first, last, and every 3rd point
      if (index === 0 || index === sortedData.length - 1 || index % 3 === 0) {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
      return ''; // Empty string for hidden labels
    } else {
      // Show all labels for smaller datasets
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    }
  });
  
  const scores = sortedData.map(entry => entry.score);
  
  // Calculate statistics
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;
  
  const maxScore = scores.length > 0 
    ? Math.max(...scores) 
    : 0;
    
  const minScore = scores.length > 0 
    ? Math.min(...scores) 
    : 0;
    
  const latestScore = scores.length > 0 
    ? scores[scores.length - 1] 
    : 0;
    
  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for this exercise</Text>
          <Text style={styles.noDataSubtext}>Complete a workout to see your progress</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        {dynamicWidth > minChartWidth ? (
          // Scrollable chart for large datasets
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <LineChart
              data={{
                labels: dates,
                datasets: [
                  {
                    data: scores,
                    color: () => color,
                    strokeWidth: 3
                  }
                ],
                legend: ['Form Score']
              }}
              width={dynamicWidth}
              height={220}
              chartConfig={{
                backgroundColor: fitnessTheme.surface,
                backgroundGradientFrom: fitnessTheme.surface,
                backgroundGradientTo: fitnessTheme.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: color
                },
                formatXLabel: (value) => value, // Show the label as is (including empty ones)
                formatYLabel: (value) => Math.round(Number(value)).toString(), // Format Y-axis labels
              }}
              style={{...styles.chart, marginLeft: 25}}
              bezier
            />
          </ScrollView>
        ) : (
          // Static chart for smaller datasets
          <LineChart
            data={{
              labels: dates,
              datasets: [
                {
                  data: scores,
                  color: () => color,
                  strokeWidth: 3
                }
              ],
              legend: ['Form Score']
            }}
            width={minChartWidth}
            height={220}
            chartConfig={{
              backgroundColor: fitnessTheme.surface,
              backgroundGradientFrom: fitnessTheme.surface,
              backgroundGradientTo: fitnessTheme.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: color
              },
              formatYLabel: (value) => Math.round(Number(value)).toString(), // Format Y-axis labels
            }}
            style={{...styles.chart, marginLeft: 25}}
            bezier
          />
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Sessions</Text>
          <Text style={styles.statValue}>{data.length}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>{averageScore !== undefined && averageScore !== null ? averageScore.toFixed(1) : '0.0'}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{maxScore !== undefined && maxScore !== null ? maxScore.toFixed(1) : '0.0'}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Latest</Text>
          <Text style={[styles.statValue, styles.latestValue]}>{latestScore !== undefined && latestScore !== null ? latestScore.toFixed(1) : '0.0'}</Text>
        </View>
      </View>
      
      {data.length > 8 && (
        <Text style={styles.scrollHint}>← Scroll chart to see all data points →</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: fitnessTheme.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: fitnessTheme.text,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    paddingLeft: 10,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    paddingLeft: 15,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: fitnessTheme.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: fitnessTheme.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  latestValue: {
    color: fitnessTheme.primary,
  },
  scrollHint: {
    fontSize: 12,
    color: fitnessTheme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: fitnessTheme.text,
    fontSize: 18,
    marginBottom: 8,
  },
  noDataSubtext: {
    color: fitnessTheme.textMuted,
    fontSize: 14,
  }
});

export default ProgressChart; 