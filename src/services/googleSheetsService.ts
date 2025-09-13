import axios from 'axios';
import Papa from 'papaparse';

export interface DashboardData {
  client: string;
  amountPaid: number;
  industry: string;
  gmail: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalClients: number;
  averageRevenue: number;
  topIndustry: string;
  revenueByIndustry: { industry: string; revenue: number }[];
  recentClients: DashboardData[];
  revenueGrowth: number;
}

class GoogleSheetsService {
  private csvUrl: string;
  private cache: DashboardData[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor(csvUrl: string) {
    this.csvUrl = csvUrl;
  }

  async fetchData(): Promise<DashboardData[]> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.cache.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const response = await axios.get(this.csvUrl);
      
      const parsedData = Papa.parse(response.data, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize headers to match our interface
          const normalizedHeader = header.toLowerCase().trim();
          if (normalizedHeader.includes('client')) return 'client';
          if (normalizedHeader.includes('amount') || normalizedHeader.includes('paid') || normalizedHeader.includes('revenue')) return 'amountPaid';
          if (normalizedHeader.includes('industry')) return 'industry';
          if (normalizedHeader.includes('gmail') || normalizedHeader.includes('email')) return 'gmail';
          return header;
        },
        transform: (value: string, field: string) => {
          if (field === 'amountPaid') {
            // Parse amount, removing currency symbols and commas
            const numericValue = parseFloat(value.replace(/[₹,\s]/g, ''));
            return isNaN(numericValue) ? 0 : numericValue;
          }
          return value?.trim() || '';
        }
      });

      if (parsedData.errors.length > 0) {
        console.warn('CSV parsing errors:', parsedData.errors);
      }

      this.cache = parsedData.data as DashboardData[];
      this.lastFetch = now;
      
      return this.cache;
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw new Error('Failed to fetch data from Google Sheets');
    }
  }

  async getMetrics(): Promise<DashboardMetrics> {
    const data = await this.fetchData();
    
    const totalRevenue = data.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
    const totalClients = data.length;
    const averageRevenue = totalClients > 0 ? totalRevenue / totalClients : 0;

    // Calculate revenue by industry
    const industryRevenue = data.reduce((acc, item) => {
      const industry = item.industry || 'Unknown';
      acc[industry] = (acc[industry] || 0) + (item.amountPaid || 0);
      return acc;
    }, {} as Record<string, number>);

    const revenueByIndustry = Object.entries(industryRevenue)
      .map(([industry, revenue]) => ({ industry, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const topIndustry = revenueByIndustry[0]?.industry || 'N/A';
    
    // Get recent clients (last 5)
    const recentClients = data.slice(-5).reverse();

    // Calculate growth (mock calculation for demo)
    const revenueGrowth = 12.5; // This would be calculated based on historical data

    return {
      totalRevenue,
      totalClients,
      averageRevenue,
      topIndustry,
      revenueByIndustry,
      recentClients,
      revenueGrowth
    };
  }

  // Set up auto-refresh
  startAutoRefresh(callback: (metrics: DashboardMetrics) => void, interval: number = 60000) {
    const refresh = async () => {
      try {
        this.cache = []; // Clear cache to force refresh
        const metrics = await this.getMetrics();
        callback(metrics);
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    };

    return setInterval(refresh, interval);
  }
}

export default GoogleSheetsService;