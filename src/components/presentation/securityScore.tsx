'use client';

import { calculateScore } from '@/lib/securityCenter';
import { DecryptedVault } from '@/types/client';
import { AbsoluteCenter, Box, BoxProps, ProgressCircle, ProgressCircleRootProps } from '@chakra-ui/react';
import React from 'react';

export default function SecurityScore({
  vaults,
  size = 'sm',
  labelPosition = 'center',
  ...props
}: {
  vaults: DecryptedVault[];
  size?: ProgressCircleRootProps['size'];
  labelPosition?: 'center' | 'right' | 'left';
} & BoxProps) {
  const score = React.useMemo(() => {
    let total = 0,
      max = 0;
    for (const vault of vaults) {
      const { maxScore, actualScore } = calculateScore(vault);
      total += actualScore;
      max += maxScore;
    }
    return max > 0 ? (total / max) * 100 : 0;
  }, [vaults]);

  const getColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 50) return 'orange';
    return 'red';
  };

  return (
    <Box position="relative" {...props}>
      <ProgressCircle.Root
        size={size}
        w="auto"
        value={score}
        position="relative"
        colorPalette={getColor(score)}
        display="flex"
        flexDir="row"
        alignItems="center"
        gap={size === 'sm' ? 2 : 4}
      >
        {labelPosition === 'right' && <ProgressCircle.ValueText fontSize={size === 'sm' ? 'sm' : 'md'} />}
        <ProgressCircle.Circle flexShrink={0}>
          <ProgressCircle.Track />
          <ProgressCircle.Range strokeLinecap="round" />
        </ProgressCircle.Circle>

        {labelPosition === 'center' && (
          <AbsoluteCenter>
            <ProgressCircle.ValueText />
          </AbsoluteCenter>
        )}

        {labelPosition === 'left' && <ProgressCircle.ValueText fontSize={size === 'sm' ? 'sm' : 'md'} />}
      </ProgressCircle.Root>
    </Box>
  );
}
