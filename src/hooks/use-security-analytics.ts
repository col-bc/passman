'use client';

import { checkForBreaches, findRepeatedPasswords, findWeakPasswords } from '@/lib/securityCenter';
import { BreachedPassword, DecryptedVault, DecryptedVaultItem, RepeatedPassword, WeakPassword } from '@/types/client';
import React from 'react';

export interface SecurityAnalytics {
  issues: {
    repeatPasswords: RepeatedPassword[];
    weakPasswords: WeakPassword[];
    breaches: BreachedPassword[];
  };
  totalIssues: number;
  hasSecurityIssues: (vaultItem: DecryptedVaultItem) => boolean;
  getIssuesByItem: (vaultItem: DecryptedVaultItem) => {
    repeatPasswords: RepeatedPassword[];
    weakPasswords: WeakPassword[];
    breaches: BreachedPassword[];
  };
}

export function useSecurityAnalytics(vaults: DecryptedVault[]) {
  const [breaches, setBreaches] = React.useState<BreachedPassword[]>([]);

  const vaultsToScan = React.useMemo(() => {
    return vaults.filter((vault) => vault.enableMonitoring);
  }, [vaults]);

  const repeatedPasswords = React.useMemo(() => findRepeatedPasswords(vaultsToScan), [vaultsToScan]);
  const weakPasswords = React.useMemo(() => findWeakPasswords(vaultsToScan), [vaultsToScan]);

  React.useEffect(() => {
    let cancelled = false;

    if (vaultsToScan.length > 0) {
      checkForBreaches(vaultsToScan)
        .then((breached) => {
          if (!cancelled) setBreaches(breached);
        })
        .catch((error) => {
          console.error('Error checking for breaches:', error);
          if (!cancelled) setBreaches([]);
        });
    } else {
      const handleClear = () => setBreaches([]);
      handleClear();
    }

    return () => {
      cancelled = true;
    };
  }, [vaultsToScan]);

  const hasSecurityIssues = React.useCallback(
    (vaultItem: DecryptedVaultItem) => {
      const parentVault = vaults.find((v) => v.vaultItems.some((item) => item.itemId === vaultItem.itemId));
      if (parentVault && !parentVault.enableMonitoring) return false;

      return (
        repeatedPasswords.some((item) =>
          item.occurrences.some((occurrence) => occurrence.itemId === vaultItem.itemId),
        ) ||
        weakPasswords.some((item) => item.itemId === vaultItem.itemId) ||
        breaches.some((item) => item.itemId === vaultItem.itemId)
      );
    },
    [repeatedPasswords, weakPasswords, breaches, vaults],
  );

  const getIssuesByItem = React.useCallback(
    (vaultItem: DecryptedVaultItem) => {
      const parentVault = vaults.find((v) => v.vaultItems.some((item) => item.itemId === vaultItem.itemId));

      if (parentVault && !parentVault.enableMonitoring) {
        return {
          repeatPasswords: [],
          weakPasswords: [],
          breaches: [],
        };
      }

      return {
        repeatPasswords: repeatedPasswords.filter((item) =>
          item.occurrences.some((occurrence) => occurrence.itemId === vaultItem.itemId),
        ),
        weakPasswords: weakPasswords.filter((item) => item.itemId === vaultItem.itemId),
        breaches: breaches.filter((item) => item.itemId === vaultItem.itemId),
      };
    },
    [repeatedPasswords, weakPasswords, breaches, vaults],
  );

  const totalIssues = repeatedPasswords.length + weakPasswords.length + breaches.length;

  return {
    issues: {
      repeatPasswords: repeatedPasswords,
      weakPasswords: weakPasswords,
      breaches: breaches,
    },
    totalIssues,
    hasSecurityIssues,
    getIssuesByItem,
  } as SecurityAnalytics;
}
