import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis,
  ComposedChart, Area
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#be123c', '#0891b2', '#0f766e', '#b45309', '#4f46e5', '#be185d'];
const CHART_HEIGHT = 300;

const ChartLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[300px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        {label && <p className="font-semibold text-gray-900 mb-1">{`${label}`}</p>}
        {payload.map((pld, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: pld.fill || pld.color }}
            />
            <p className="text-gray-700">
              <span className="font-medium">{pld.name}: </span>
              {typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  if (percent < 0.05) return null; // Don't show labels for small segments

  return (
    <text
      x={x}
      y={y}
      fill="#4b5563"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState({
    intensity: true,
    region: true,
    likelihood: true,
    topic: true
  });
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    topic: '',
    sector: '',
    region: '',
    pestle: '',
    source: '',
    country: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/data');
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simulate chart loading when filters change
  useEffect(() => {
    if (!loading) {
      setChartsLoading({
        intensity: true,
        region: true,
        likelihood: true,
        topic: true
      });

      // Simulate API delay
      const timer = setTimeout(() => {
        setChartsLoading({
          intensity: false,
          region: false,
          likelihood: false,
          topic: false
        });
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [filters, loading]);

  const filterOptions = useMemo(() => {
    return {
      topics: [...new Set(data.map(item => item.topic))].filter(Boolean).sort(),
      sectors: [...new Set(data.map(item => item.sector))].filter(Boolean).sort(),
      regions: [...new Set(data.map(item => item.region))].filter(Boolean).sort(),
      pestles: [...new Set(data.map(item => item.pestle))].filter(Boolean).sort(),
      sources: [...new Set(data.map(item => item.source))].filter(Boolean).sort(),
      countries: [...new Set(data.map(item => item.country))].filter(Boolean).sort(),
    };
  }, [data]);


  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    return data.filter(item => {
      const topicMatch = !filters.topic || (item.topic && item.topic === filters.topic);
      const sectorMatch = !filters.sector || (item.sector && item.sector === filters.sector);
      const regionMatch = !filters.region || (item.region && item.region === filters.region);
      const pestleMatch = !filters.pestle || (item.pestle && item.pestle === filters.pestle);
      const sourceMatch = !filters.source || (item.source && item.source === filters.source);
      const countryMatch = !filters.country || (item.country && item.country === filters.country);

      return topicMatch && sectorMatch && regionMatch && pestleMatch && sourceMatch && countryMatch;
    });
  }, [data, filters]);

  // Updated aggregatedData calculation
  const aggregatedData = useMemo(() => {
    const byIntensity = filteredData.reduce((acc, item) => {
      if (item.intensity !== null && item.intensity !== undefined) {
        const intensity = Math.round(item.intensity);
        acc[intensity] = (acc[intensity] || 0) + 1;
      }
      return acc;
    }, {});

    const byRegion = Object.entries(
      filteredData.reduce((acc, item) => {
        if (item.region) {
          acc[item.region] = (acc[item.region] || 0) + 1;
        }
        return acc;
      }, {})
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const byTopic = Object.entries(
      filteredData.reduce((acc, item) => {
        if (item.topic) {
          acc[item.topic] = (acc[item.topic] || 0) + 1;
        }
        return acc;
      }, {})
    )
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      byIntensity: Object.entries(byIntensity)
        .map(([intensity, count]) => ({
          intensity: parseInt(intensity),
          count
        }))
        .sort((a, b) => a.intensity - b.intensity),
      byRegion: byRegion.length ? byRegion : [{ name: 'No Data', value: 0 }],
      byTopic: byTopic.length ? byTopic : [{ topic: 'No Data', count: 0 }]
    };
  }, [filteredData]);
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // Reset charts loading state when filter changes
    setChartsLoading({
      intensity: true,
      region: true,
      likelihood: true,
      topic: true
    });

    // Simulate API delay for chart updates
    setTimeout(() => {
      setChartsLoading({
        intensity: false,
        region: false,
        likelihood: false,
        topic: false
      });
    }, 500);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Visualization Dashboard</h1>
          <p className="text-gray-500">Interactive analytics and insights</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Topic Filter */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Topic</label>
              <select
                value={filters.topic}
                onChange={(e) => setFilters(prev => ({ ...prev, topic: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
              >
                <option value="">All topics</option>
                {filterOptions.topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {/* Sector Filter */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
              >
                <option value="">All sectors</option>
                {filterOptions.sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
              >
                <option value="">All regions</option>
                {filterOptions.regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* PESTLE Filter */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">PESTLE</label>
              <select
                value={filters.pestle}
                onChange={(e) => setFilters(prev => ({ ...prev, pestle: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
              >
                <option value="">All PESTLE</option>
                {filterOptions.pestles.map(pestle => (
                  <option key={pestle} value={pestle}>{pestle}</option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
              >
                <option value="">All sources</option>
                {filterOptions.sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <select
                value={filters.country}
                onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
              >
                <option value="">All countries</option>
                {filterOptions.countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

          {/* Summary Statistics Card */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Summary Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600 mb-1">Total Records</h3>
                <p className="text-2xl font-bold text-blue-900">{filteredData.length.toLocaleString()}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-600 mb-1">Average Intensity</h3>
                <p className="text-2xl font-bold text-green-900">
                  {(filteredData.reduce((acc, item) => acc + (item.intensity || 0), 0) / filteredData.length).toFixed(1)}
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600 mb-1">Average Relevance</h3>
                <p className="text-2xl font-bold text-purple-900">
                  {(filteredData.reduce((acc, item) => acc + (item.relevance || 0), 0) / filteredData.length).toFixed(1)}
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600 mb-1">Average Likelihood</h3>
                <p className="text-2xl font-bold text-orange-900">
                  {(filteredData.reduce((acc, item) => acc + (item.likelihood || 0), 0) / filteredData.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Filters</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <div 
                  key={key} 
                  className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  <span className="capitalize mr-1">{key}:</span>
                  <span className="font-medium">{value}</span>
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    aria-label={`Remove ${key} filter`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {!Object.values(filters).some(Boolean) && (
              <p className="text-gray-500 italic">No active filters</p>
            )}
          </div>
        </div>

        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        
          {/* Intensity Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">Intensity Distribution</h2>
    <div style={{ height: CHART_HEIGHT }}>
      {chartsLoading.intensity ? (
        <ChartLoader />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={aggregatedData.byIntensity}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="intensity" 
              stroke="#6b7280" 
              label={{ value: 'Intensity', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              stroke="#6b7280" 
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value, name) => [value, name === 'count' ? 'Count' : name]}
            />
            <Bar dataKey="count" name="Count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>

          {/* Region Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Regional Distribution</h2>
            <div style={{ height: CHART_HEIGHT * 1.2 }}>
              {chartsLoading.region ? (
                <ChartLoader />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aggregatedData.byRegion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {aggregatedData.byRegion.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Likelihood vs Relevance Scatter Plot */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Likelihood vs Relevance</h2>
            <div style={{ height: CHART_HEIGHT }}>
              {chartsLoading.likelihood ? (
                <ChartLoader />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="likelihood"
                      type="number"
                      name="Likelihood"
                      stroke="#6b7280"
                      domain={[0, 5]}
                      label={{ value: 'Likelihood', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      dataKey="relevance"
                      type="number"
                      name="Relevance"
                      stroke="#6b7280"
                      domain={[0, 5]}
                      label={{ value: 'Relevance', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis dataKey="intensity" range={[50, 400]} name="Intensity" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter data={filteredData} fill="#2563eb" />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Topics Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Topics Distribution</h2>
            <div style={{ height: CHART_HEIGHT }}>
              {chartsLoading.topic ? (
                <ChartLoader />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={aggregatedData.byTopic}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="topic"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      fill="#2563eb"
                      stroke="#2563eb"
                      fillOpacity={0.2}
                    />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                  </ResponsiveContainer>
              )}
            </div>
          </div>



        </div>


      </div>
    </div>
  );
};

export default Dashboard;