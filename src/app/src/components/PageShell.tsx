import Navigation from '@app/components/Navigation';
import { PostHogProvider } from '@app/components/PostHogProvider';
import UpdateBanner from '@app/components/UpdateBanner';
import { Outlet } from 'react-router-dom';
import { PostHogPageViewTracker } from './PostHogPageViewTracker';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell min-h-screen bg-gradient-to-b from-background via-background/95 to-background text-foreground selection:bg-primary/20 selection:text-primary">
      {children}
    </div>
  );
}

export default function PageShell() {
  return (
    <PostHogProvider>
      <Layout>
        <Navigation />
        <UpdateBanner />
        <main className="dashboard-main">
          <Outlet />
        </main>
        <PostHogPageViewTracker />
      </Layout>
    </PostHogProvider>
  );
}
