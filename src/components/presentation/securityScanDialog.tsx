'use client';

import { Button, CheckboxCard, Dialog, DialogOpenChangeDetails, Flex, Float, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { TbDeviceFloppy, TbShieldSearch, TbX } from 'react-icons/tb';

export default function SecurityScanDialog({
  lockerId,
  open,
  onOpenChange,
}: {
  lockerId: string;
  open: boolean;
  onOpenChange: (open: DialogOpenChangeDetails) => void;
}) {
  const [enrolled, setEnrolled] = React.useState(false);

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
                    Locker &apos;{lockerId}&apos;{' '}
                    {enrolled ? 'is enrolled in security monitoring.' : 'is not enrolled in security monitoring.'}
                  </CheckboxCard.Description>
                </CheckboxCard.Content>
                <Float placement="top-end" offset="6">
                  <CheckboxCard.Indicator />
                </Float>
              </CheckboxCard.Control>
            </CheckboxCard.Root>
            <Dialog.Description>
              Enrolling in security monitoring, indicates your consent and agreement to the{' '}
              <NextLink href="/terms">
                <Link color="yellow.fg">terms and conditions</Link>
              </NextLink>{' '}
              of this service and understand that your data will be used in accordance with our{' '}
              <NextLink href="/privacy">
                <Link color="yellow.fg">privacy policy</Link>
              </NextLink>
              .
            </Dialog.Description>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="gray" variant="subtle" onClick={() => onOpenChange({ open: false })}>
                <TbX />
                Cancel
              </Button>
            </Dialog.ActionTrigger>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="yellow">
                <TbDeviceFloppy />
                Save Changes
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
