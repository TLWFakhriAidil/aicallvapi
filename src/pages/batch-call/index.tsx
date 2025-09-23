import { Header } from '@/components/Header';
import { BatchCallForm } from '@/components/campaigns/BatchCallForm';

export default function BatchCallPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Batch Call System</h1>
            <p className="text-muted-foreground mt-2">
              Mulakan kempen panggilan pukal dengan AI menggunakan skrip dan senarai nombor telefon
            </p>
          </div>

          <BatchCallForm />
        </div>
      </main>
    </div>
  );
}