import { Header } from '@/components/Header';
import { CampaignsList } from '@/components/campaigns/CampaignsList';

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Senarai Kempen</h1>
            <p className="text-muted-foreground mt-2">
              Pantau dan urus kempen batch call anda
            </p>
          </div>

          <CampaignsList />
        </div>
      </main>
    </div>
  );
}