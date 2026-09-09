import { useCallback, useEffect, useRef, useState } from 'react';

import { Alert, AlertContent, AlertDescription } from '@app/components/ui/alert';
import { Button } from '@app/components/ui/button';
import { Card, CardContent } from '@app/components/ui/card';
import { AddIcon, HistoryIcon, SecurityIcon } from '@app/components/ui/icons';
import { MODEL_AUDIT_ROUTES } from '@app/constants/routes';
import { callApi } from '@app/utils/api';
import { Link as RouterLink } from 'react-router-dom';
import { LatestScanSkeleton } from '../model-audit/components/ModelAuditSkeleton';
import ResultsTab from '../model-audit/components/ResultsTab';
import ScannedFilesDialog from '../model-audit/components/ScannedFilesDialog';
import ScanResultHeader from '../model-audit/components/ScanResultHeader';
import { useSeverityCounts } from '../model-audit/hooks';
import { useModelAuditConfigStore } from '../model-audit/stores';
import { hasModelAuditFindings } from '../model-audit/utils';

import type { HistoricalScan } from '../model-audit/stores';

export default function ModelAuditResultLatestPage() {
  const [latestScan, setLatestScan] = useState<HistoricalScan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const activeRequestRef = useRef<AbortController | null>(null);
  const startNewScan = useModelAuditConfigStore((state) => state.startNewScan);

  const fetchLatestScan = useCallback(async () => {
    activeRequestRef.current?.abort();
    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const response = await callApi('/model-audit/scans?limit=1&sort=createdAt&order=desc', {
        signal: abortController.signal,
      });

      if (abortController.signal.aborted) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch latest scan');
      }

      const data = await response.json();
      const scans = data.scans || [];

      if (scans.length > 0) {
        setLatestScan(scans[0]);
      } else {
        setLatestScan(null);
      }
    } catch (err) {
      if (abortController.signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to load latest scan';
      setError(errorMessage);
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
      if (activeRequestRef.current === abortController) {
        activeRequestRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    fetchLatestScan();
    return () => activeRequestRef.current?.abort();
  }, [fetchLatestScan]);

  const severityCounts = useSeverityCounts(latestScan?.results?.issues);
  const hasFindings = latestScan
    ? latestScan.hasErrors || hasModelAuditFindings(latestScan.results)
    : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <LatestScanSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold">Unable to load latest scan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We could not fetch the most recent result. Try again, or start a new scan from setup.
            </p>
          </div>
          <Alert variant="destructive" className="mb-6">
            <AlertContent>
              <AlertDescription>{error}</AlertDescription>
            </AlertContent>
          </Alert>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={fetchLatestScan}>
              Try Again
            </Button>
            <Button asChild>
              <RouterLink to={MODEL_AUDIT_ROUTES.SETUP} onClick={startNewScan}>
                Go to Setup
              </RouterLink>
            </Button>
            <Button variant="outline" asChild>
              <RouterLink to={MODEL_AUDIT_ROUTES.LIST}>View History</RouterLink>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no scans yet
  if (!latestScan) {
    return (
      <div className="min-h-screen bg-zinc-50 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_38%)] py-16 dark:bg-zinc-950">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="group relative overflow-hidden border-pink-200/70 bg-white/90 text-center shadow-xl shadow-pink-950/10 backdrop-blur-sm dark:border-pink-400/20 dark:bg-zinc-900/90 dark:shadow-pink-950/20">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-400 via-fuchsia-500 to-violet-500" />
            <CardContent className="relative py-14 sm:py-16">
              <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-3xl border border-pink-200 bg-pink-50 text-pink-500 shadow-lg shadow-pink-500/15 transition-transform duration-300 group-hover:-translate-y-1 dark:border-pink-400/20 dark:bg-pink-950/30 dark:text-pink-300">
                <SecurityIcon className="size-10" />
              </div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-pink-500 dark:text-pink-300">
                Model security workspace
              </p>
              <h1 className="text-2xl font-bold mb-2">No Model Scans Yet</h1>
              <p className="mx-auto mb-4 max-w-md text-base leading-7 text-muted-foreground">
                Start with a model scan to turn hidden artifact risks into clear, actionable
                findings.
              </p>
              <p className="mx-auto mb-8 max-w-lg text-sm leading-6 text-muted-foreground">
                ARTEF checks for pickle exploits, unsafe deserialization, and malicious code
                injection before a model reaches production.{' '}
                <a
                  href="https://github.com/NETIZEN-11/ARTF/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline"
                >
                  Learn more
                </a>
              </p>
              <Button
                className="bg-pink-500 text-white shadow-lg shadow-pink-500/25 hover:bg-pink-600 dark:bg-pink-500 dark:hover:bg-pink-400"
                size="lg"
                asChild
              >
                <RouterLink to={MODEL_AUDIT_ROUTES.SETUP} onClick={startNewScan}>
                  <AddIcon className="size-4 mr-2" />
                  Run Your First Scan
                </RouterLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ScanResultHeader
        name={latestScan.name || 'Latest Scan Results'}
        modelPath={latestScan.modelPath}
        createdAt={new Date(latestScan.createdAt).toISOString()}
        severityCounts={severityCounts}
        hasFindings={hasFindings}
        size="sm"
      />

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Action Toolbar */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" asChild>
            <RouterLink to={MODEL_AUDIT_ROUTES.LIST}>
              <HistoryIcon className="size-4 mr-2" />
              History
            </RouterLink>
          </Button>
          <Button size="sm" asChild>
            <RouterLink to={MODEL_AUDIT_ROUTES.SETUP} onClick={startNewScan}>
              <AddIcon className="size-4 mr-2" />
              New Scan
            </RouterLink>
          </Button>
        </div>

        <Card className="bg-white dark:bg-zinc-900">
          <CardContent className="pt-6">
            {latestScan.results && (
              <ResultsTab
                scanResults={latestScan.results}
                onShowFilesDialog={() => setShowFilesDialog(true)}
                totalChecks={latestScan.totalChecks}
                passedChecks={latestScan.passedChecks}
                failedChecks={latestScan.failedChecks}
              />
            )}
          </CardContent>
        </Card>

        {latestScan.results && (
          <ScannedFilesDialog
            open={showFilesDialog}
            onClose={() => setShowFilesDialog(false)}
            scanResults={latestScan.results}
            paths={((latestScan.metadata?.originalPaths as string[] | undefined) ?? []).map(
              (p: string) => ({
                path: p,
                type: p.endsWith('/') ? ('directory' as const) : ('file' as const),
                name: p.split('/').filter(Boolean).pop() || p,
              }),
            )}
          />
        )}
      </div>
    </div>
  );
}
