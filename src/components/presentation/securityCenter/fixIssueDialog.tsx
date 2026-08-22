import { Button, Dialog } from '@chakra-ui/react';
import NextLink from 'next/link';
import { TbTool, TbX } from 'react-icons/tb';

export default function FixIssueDialog({
  children,
  descriptionChildren,
  href,
}: {
  children: React.ReactNode;
  descriptionChildren: React.ReactNode;
  href?: string;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Fix Issue</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          <Dialog.Body>
            <Dialog.Description whiteSpace="break-spaces">{descriptionChildren}</Dialog.Description>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray" size="sm">
                {href ? (
                  <>
                    <TbX />
                    Close
                  </>
                ) : (
                  <>Okay</>
                )}
              </Button>
            </Dialog.ActionTrigger>
            {href && (
              <Dialog.ActionTrigger asChild>
                <NextLink href={href} passHref>
                  <Button as="a" colorPalette="yellow" size="sm">
                    Fix Issue <TbTool />
                  </Button>
                </NextLink>
              </Dialog.ActionTrigger>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
