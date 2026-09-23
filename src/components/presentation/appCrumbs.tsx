'use client';

import { useVaults } from '@/hooks/use-vaults';
import { Breadcrumb } from '@chakra-ui/react';
import { BreadcrumbRootProps } from '@chakra-ui/react/breadcrumb';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

type PathSegment = {
  depth: number;
  segmentType: 'vault' | 'item' | 'label';
  segmentValue: string;
  href: string;
  isCurrentPage: boolean;
};

export default function AppCrumbs(props: BreadcrumbRootProps) {
  const { vaults } = useVaults();
  const pathname = usePathname();
  const [pathSegments, setPathSegments] = React.useState<PathSegment[]>([]);

  React.useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const result: PathSegment[] = [];
    let currentVaultId = '';
    let currentItemId = '';

    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      let segmentType: 'vault' | 'item' | 'label' = 'label';
      let segmentValue = segment.charAt(0).toUpperCase() + segment.slice(1);

      const href = `/${segments.slice(0, index + 1).join('/')}`;

      if (index === 1) {
        segmentType = 'vault';
        currentVaultId = segment;
        const vault = vaults.find((v) => v.id === currentVaultId);
        if (vault) {
          segmentValue = vault.title;
        }
      } else if (index === 2) {
        // With the /item/ directory removed, the item ID is now the 3rd segment
        segmentType = 'item';
        currentItemId = segment;
        const item = vaults.find((v) => v.id === currentVaultId)?.vaultItems.find((i) => i.itemId === currentItemId);
        if (item) {
          segmentValue = item.item.title;
        }
      }

      result.push({
        depth: index,
        segmentType,
        segmentValue,
        href,
        isCurrentPage: index === segments.length - 1,
      });
    }

    const handleEffect = () => setPathSegments(result);
    handleEffect();
  }, [pathname, vaults]);

  return (
    <Breadcrumb.Root {...props}>
      <Breadcrumb.List>
        {pathSegments.map(({ depth, segmentValue, href, isCurrentPage }) => (
          <React.Fragment key={depth}>
            <Breadcrumb.Item>
              {isCurrentPage ? (
                <Breadcrumb.CurrentLink>{segmentValue}</Breadcrumb.CurrentLink>
              ) : (
                <Breadcrumb.Link asChild>
                  <NextLink href={href}>{segmentValue}</NextLink>
                </Breadcrumb.Link>
              )}
            </Breadcrumb.Item>
            {!isCurrentPage && <Breadcrumb.Separator />}
          </React.Fragment>
        ))}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
}
