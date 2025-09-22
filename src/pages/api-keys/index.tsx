import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ApiKeysForm } from '@/components/api-keys/ApiKeysForm';

export default function ApiKeysPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">API Keys Settings</h1>
          <p className="text-muted-foreground mt-2">
            Konfigurasikan kunci API untuk menggunakan perkhidmatan AI dan telefon
          </p>
        </div>

        <ApiKeysForm />
      </div>
    </div>
  );
}