import { useState } from 'react';
import { DashboardData } from '@/services/googleSheetsService';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ClientTableProps {
  clients: DashboardData[];
}

export const ClientTable = ({ clients }: ClientTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold neon-text">Client Overview</h3>
        <div className="w-64">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-glass border-glass-border text-glass-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/20 backdrop-blur-sm">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Industry
                </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Revenue
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr 
                  key={index}
                  className={cn(
                    "border-b border-glass-border hover:bg-glass/30 transition-colors cursor-pointer",
                    "animate-slide-up"
                  )}
                  style={{ animationDelay: `${700 + index * 50}ms` }}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {client.client?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">{client.client || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                      {client.industry || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-success">
                      ₹{(client.amountPaid || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{client.gmail || 'N/A'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No clients found matching your search.</p>
        </div>
      )}
    </div>
  );
};