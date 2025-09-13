import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import GoogleSheetsService, { DashboardMetrics } from '@/services/googleSheetsService';
import { MetricCard } from './MetricCard';
import { RevenueChart } from './RevenueChart';
import { ClientTable } from './ClientTable';
import dashboardBg from '@/assets/dashboard-bg.jpg';

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const sheetsService = new GoogleSheetsService(
    'https://docs.google.com/spreadsheets/d/11XmK-RiE3lVQEKAsHtv8_tOiYS4BVavV9VLxlRynxG0/export?format=csv'
  );

  const loadData = async () => {
    try {
      setConnectionStatus('connecting');
      const data = await sheetsService.getMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
      setConnectionStatus('connected');
      setLoading(false);
      
      toast({
        title: "Dashboard Connected",
        description: "Successfully loaded data from Google Sheets",
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setConnectionStatus('error');
      toast({
        title: "Connection Issue",
        description: "Using demo data. Check your Google Sheets URL and permissions.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up auto-refresh every minute
    const refreshInterval = sheetsService.startAutoRefresh((newMetrics) => {
      setMetrics(newMetrics);
      setLastUpdated(new Date());
      setConnectionStatus('connected');
      toast({
        title: "Data Refreshed",
        description: "Dashboard updated with latest Google Sheets data",
      });
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${dashboardBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="glass-card p-8 rounded-xl animate-glow">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xl font-medium neon-text">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8 rounded-xl">
          <p className="text-destructive">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div className="glass-card p-6 rounded-xl mb-8 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold neon-text mb-2">Business Intelligence Dashboard</h1>
            <p className="text-muted-foreground">Real-time analytics and performance metrics</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full animate-glow ${
                connectionStatus === 'connected' ? 'bg-success' : 
                connectionStatus === 'connecting' ? 'bg-warning' : 'bg-destructive'
              }`}></div>
              <span className={`text-sm font-medium ${
                connectionStatus === 'connected' ? 'text-success' : 
                connectionStatus === 'connecting' ? 'text-warning' : 'text-destructive'
              }`}>
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Demo Mode'}
              </span>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`₹${metrics.totalRevenue.toLocaleString('en-IN')}`}
          subtitle="All time earnings"
          icon={<span className="text-2xl">💰</span>}
          trend="up"
          trendValue={`+${metrics.revenueGrowth}%`}
          delay={100}
        />
        
        <MetricCard
          title="Total Clients"
          value={metrics.totalClients}
          subtitle="Active customers"
          icon={<span className="text-2xl">👥</span>}
          trend="up"
          trendValue="+15%"
          delay={200}
        />
        
        <MetricCard
          title="Average Revenue"
          value={`₹${Math.round(metrics.averageRevenue).toLocaleString('en-IN')}`}
          subtitle="Per client"
          icon={<span className="text-2xl">📊</span>}
          trend="neutral"
          trendValue="0%"
          delay={300}
        />
        
        <MetricCard
          title="Top Industry"
          value={metrics.topIndustry}
          subtitle="Highest revenue sector"
          icon={<span className="text-2xl">🏆</span>}
          trend="up"
          trendValue="+8%"
          delay={400}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RevenueChart data={metrics.revenueByIndustry} />
        
        <div className="chart-container animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-bold neon-text mb-6">Recent Clients</h3>
          <div className="space-y-4">
            {metrics.recentClients.map((client, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-glass/30 border border-glass-border hover-lift"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {client.client?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.client || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{client.industry || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">
                    ₹{(client.amountPaid || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Table */}
      <ClientTable clients={metrics.recentClients} />
    </div>
  );
};

export default Dashboard;