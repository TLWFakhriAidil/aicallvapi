import { Link } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { NumbersForm } from '@/components/numbers/NumbersForm';
import { NumbersList } from '@/components/numbers/NumbersList';

export default function NumbersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Phone className="mr-3 h-8 w-8" />
            Phone Numbers
          </h1>
          <p className="text-muted-foreground mt-2">
            Tambah dan urus nombor telefon untuk voice agent
          </p>
        </div>

        <div className="grid gap-8">
          <NumbersForm />
          <NumbersList />
        </div>
      </div>
    </div>
  );
}