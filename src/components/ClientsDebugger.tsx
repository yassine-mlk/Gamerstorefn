import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ClientsDebugger() {
  const { clients, loading, error } = useClients();

  return (
    <Card className="bg-gray-900/50 border-gray-700 mb-4">
      <CardHeader>
        <CardTitle className="text-white text-sm">🔍 Débogage Clients</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-2">
          <p className="text-gray-300">
            <strong>Loading:</strong> {loading ? 'Oui' : 'Non'}
          </p>
          <p className="text-gray-300">
            <strong>Error:</strong> {error || 'Aucune'}
          </p>
          <p className="text-gray-300">
            <strong>Nombre de clients:</strong> {clients.length}
          </p>
          
          {clients.length > 0 && (
            <div>
              <p className="text-gaming-cyan font-medium">Clients trouvés:</p>
              <ul className="list-disc list-inside text-gray-400 ml-2">
                {clients.slice(0, 3).map((client) => (
                  <li key={client.id}>
                    {client.prenom} {client.nom} ({client.email})
                  </li>
                ))}
                {clients.length > 3 && (
                  <li>... et {clients.length - 3} autres</li>
                )}
              </ul>
            </div>
          )}
          
          {clients.length === 0 && !loading && (
            <p className="text-yellow-400">
              ⚠️ Aucun client trouvé. Allez dans la page "Clients" pour en ajouter.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 