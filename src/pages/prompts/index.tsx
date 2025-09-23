import { Header } from '@/components/Header';
import { PromptsList } from '@/components/prompts/PromptsList';

export default function PromptsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Pengurusan Skrip Prompt</h1>
            <p className="text-muted-foreground mt-2">
              Cipta dan urus templat skrip untuk kempen panggilan AI anda
            </p>
          </div>

          <PromptsList />
        </div>
      </main>
    </div>
  );
}