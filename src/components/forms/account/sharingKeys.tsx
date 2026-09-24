'use client';

import { arrayBufferToPem, stringToUint8 } from '@/lib/crypto';
import { User } from '@/prisma/client';
import { Button, Card, Field, IconButton, Stack, Textarea } from '@chakra-ui/react';
import React from 'react';
import { TbCopy, TbCopyCheck, TbDownload, TbLockCheck, TbRefresh } from 'react-icons/tb';

export default function SharingKeysForm({ user }: { user: User }) {
  const [publicKey, setPublicKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (user && user.publicKey) {
      const getPublicKeyPem = () => {
        const buffer = stringToUint8(user.publicKey);
        const arrayBuffer = buffer.buffer as ArrayBuffer;
        const pem = arrayBufferToPem(
          arrayBuffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          'PUBLIC',
        );
        setPublicKey(pem);
      };
      getPublicKeyPem();
    }
  }, [user]);

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (publicKey) {
      const blob = new Blob([publicKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'public_key.pem';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Card.Body spaceY="4">
        <Field.Root>
          <Stack direction="row" w="full" alignItems="center" justifyContent="space-between">
            <Field.Label>Public Key</Field.Label>
            <IconButton aria-label="Copy Public Key" onClick={handleCopy} size="xs" variant="subtle">
              {copied ? <TbCopyCheck /> : <TbCopy />}
            </IconButton>
          </Stack>
          <Textarea value={publicKey ?? 'Loading...'} readOnly rows={10} whiteSpace="nowrap" overflowX="aitp" />
        </Field.Root>

        <Field.Root>
          <Field.Label>Private Key</Field.Label>
          <Stack
            direction="row"
            alignItems="center"
            p={4}
            bg="bg.muted"
            rounded="sm"
            fontSize="sm"
            color="fg.muted"
            w="full"
          >
            <TbLockCheck size={24} /> Private Key Stored Securely in Memory
          </Stack>
        </Field.Root>
      </Card.Body>
      <Card.Footer>
        <Button type="button" colorPalette="yellow" onClick={handleExport}>
          <TbDownload />
          Export Public Key
        </Button>
        <Button type="button" colorPalette="gray" variant="subtle">
          <TbRefresh /> Rotate Keys
        </Button>
      </Card.Footer>
    </form>
  );
}
