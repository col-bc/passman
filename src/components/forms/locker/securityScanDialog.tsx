'use client';

import { toaster } from '@/components/ui/toaster';
import { handleUpdateLocker } from '@/lib/locker/lockerActions';
import { DecryptedLocker } from '@/types/client';
import { Button, CheckboxCard, Dialog, DialogOpenChangeDetails, Flex, Float, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { TbDeviceFloppy, TbShieldSearch } from 'react-icons/tb';

export default function SecurityMonitoringForm({ locker }: { locker: DecryptedLocker }) {
  const [enrolled, setEnrolled] = React.useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const status = await handleUpdateLocker(locker.id, { enableMonitoring: enrolled });
    if (status.success) {
      toaster.success({
        title: 'Locker Updated Successfully',
        description: 'Security monitoring settings have been updated for ' + locker.title,
      });
    } else {
      console.error('Failed to update locker:', status);
      toaster.error({
        title: 'Failed to Update Locker',
        description: 'There was an error updating security monitoring settings for ' + locker.title + '.',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Flex direction="column" gap={4}>
        <CheckboxCard.Root
          colorPalette="yellow"
          variant="surface"
          checked={enrolled}
          onCheckedChange={(val) => setEnrolled(!!val.checked)}
        >
          <CheckboxCard.HiddenInput />
          <CheckboxCard.Control>
            <CheckboxCard.Content>
              <CheckboxCard.Label>Enable Security Monitoring</CheckboxCard.Label>
              <CheckboxCard.Description>
                Locker &apos;{locker.title}&apos;{' '}
                {enrolled ? 'is enrolled in security monitoring.' : 'is not enrolled in security monitoring.'}
              </CheckboxCard.Description>
            </CheckboxCard.Content>
            <Float placement="top-end" offset="6">
              <CheckboxCard.Indicator />
            </Float>
          </CheckboxCard.Control>
        </CheckboxCard.Root>
        <Text>
          Enrolling in security monitoring, indicates your consent and agreement to the{' '}
          <Link as={NextLink} href="/terms" colorPalette="yellow">
            terms and conditions
          </Link>{' '}
          of this service and understand that your data will be used in accordance with our{' '}
          <Link as={NextLink} href="/privacy" colorPalette="yellow">
            privacy policy
          </Link>
          .
        </Text>

        <Button colorPalette="yellow" type="submit">
          <TbDeviceFloppy />
          Save Changes
        </Button>
      </Flex>
    </form>
  );
}

export function SecurityMonitoringDialog({
  locker,
  open,
  onOpenChange,
}: {
  locker: DecryptedLocker;
  open: boolean;
  onOpenChange: (open: DialogOpenChangeDetails) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Flex
              w={16}
              h={16}
              align="center"
              justify="center"
              rounded="lg"
              bg="yellow.subtle"
              color="yellow.fg"
              fontSize="5xl"
            >
              <TbShieldSearch />
            </Flex>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          <Dialog.Body spaceY={4}>
            <Dialog.Title fontFamily="heading" letterSpacing="tighter">
              Manage Security Monitoring
            </Dialog.Title>
            <Dialog.Description>
              Security monitoring alerts you to potential security threats by scanning your password records in the
              background. Your data stays private and secure and you remain in control at all times.
            </Dialog.Description>
            <SecurityMonitoringForm locker={locker} />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
