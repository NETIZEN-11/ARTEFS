import { Alert, AlertContent, AlertDescription } from '@app/components/ui/alert';
import { Button } from '@app/components/ui/button';
import { PlayArrowIcon, SettingsIcon } from '@app/components/ui/icons';
import { Spinner } from '@app/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import { cn } from '@app/lib/utils';
import InstallationGuide from './InstallationGuide';
import PathSelector from './PathSelector';

import type { ScanPath } from '../ModelAudit.types';

interface ConfigurationTabProps {
  paths: ScanPath[];
  onAddPath: (path: ScanPath) => void;
  onRemovePath: (index: number) => void;
  onShowOptions: () => void;
  onScan: () => void;
  isScanning: boolean;
  error: string | null;
  onClearError: () => void;
  currentWorkingDir?: string;
  installationStatus?: {
    checking: boolean;
    installed: boolean | null;
    error?: string | null;
  };
  onRetryInstallationCheck?: () => void;
}

export default function ConfigurationTab({
  paths,
  onAddPath,
  onRemovePath,
  onShowOptions,
  onScan,
  isScanning,
  error,
  onClearError,
  currentWorkingDir,
  installationStatus,
  onRetryInstallationCheck,
}: ConfigurationTabProps) {
  const isCheckingInstallation = installationStatus?.checking ?? false;
  const isNotInstalled = installationStatus?.installed === false;
  const installationUnknown = installationStatus?.installed === null;
  const installationError = installationStatus?.error ?? null;

  const scanButtonDisabled =
    isScanning || paths.length === 0 || isCheckingInstallation || isNotInstalled;

  const getScanButtonText = () => {
    if (isScanning) {
      return 'Scanning...';
    }
    if (isCheckingInstallation) {
      return 'Checking Installation...';
    }
    if (isNotInstalled) {
      return 'ModelAudit Not Installed';
    }
    if (installationUnknown) {
      return 'Start Security Scan (Checking...)';
    }
    return 'Start Security Scan';
  };

  const getScanButtonTooltip = () => {
    if (paths.length === 0) {
      return 'Add at least one path to scan';
    }
    if (isCheckingInstallation) {
      return 'Checking if ModelAudit is installed...';
    }
    if (isNotInstalled) {
      return 'Install ModelAudit to start a scan';
    }
    if (installationUnknown) {
      return 'Installation status will be verified when you click';
    }
    return '';
  };

  const scanButtonTooltip = getScanButtonTooltip();

  return (
    <div className="space-y-6">
      {/* Installation Warning - Show prominently if not installed */}
      {isNotInstalled && onRetryInstallationCheck && (
        <InstallationGuide
          onRetryCheck={onRetryInstallationCheck}
          isChecking={isCheckingInstallation}
          error={installationError}
        />
      )}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-pink-500 dark:text-pink-300">
            Audit target
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Select Models</h2>
        </div>
        <Button variant="outline" onClick={onShowOptions}>
          <SettingsIcon className="size-4 mr-2" />
          Advanced Options
        </Button>
      </div>

      <PathSelector
        paths={paths}
        onAddPath={onAddPath}
        onRemovePath={onRemovePath}
        currentWorkingDir={currentWorkingDir}
      />

      <div className="mt-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                size="lg"
                className={cn(
                  'w-full rounded-xl py-6 text-lg font-semibold shadow-lg shadow-pink-500/20 transition-transform hover:-translate-y-0.5',
                  isNotInstalled
                    ? 'bg-destructive shadow-none hover:bg-destructive/90'
                    : 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-500 dark:hover:bg-pink-400',
                )}
                onClick={onScan}
                disabled={scanButtonDisabled}
              >
                {isScanning || isCheckingInstallation ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <PlayArrowIcon className="size-5 mr-2" />
                )}
                {getScanButtonText()}
              </Button>
            </div>
          </TooltipTrigger>
          {scanButtonTooltip && (
            <TooltipContent side="top">
              <p>{scanButtonTooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertContent>
              <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">{error}</span>
                <Button type="button" variant="destructive" onClick={onClearError}>
                  Dismiss
                </Button>
              </AlertDescription>
            </AlertContent>
          </Alert>
        )}
      </div>
    </div>
  );
}
