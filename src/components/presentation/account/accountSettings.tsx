import AboutYouForm from '@/components/forms/account/aboutYou';
import ChangePasswordForm from '@/components/forms/account/changePasswordForm';
import SharingKeysForm from '@/components/forms/account/sharingKeys';
import TwoFactorForm from '@/components/forms/account/twoFactor';
import { User } from '@/prisma/client';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapsible,
  Flex,
  Heading,
  Link,
  List,
  Separator,
  Stack,
} from '@chakra-ui/react';
import { TbExclamationCircle, TbShredder, TbTrash, TbX } from 'react-icons/tb';

export default function AccountSettings({ user }: { user: User }) {
  return (
    <Flex gap={10} flexDirection={{ base: 'column-reverse', lg: 'row' }} h="full" maxH="full">
      <Flex direction="column" gap={{ base: 8, lg: 10 }} flex={1}>
        <Card.Root id="about-you" variant="elevated">
          <Card.Header>
            <Card.Title>About You</Card.Title>
          </Card.Header>
          <AboutYouForm user={user} />
        </Card.Root>

        <Card.Root id="change-password" variant="elevated">
          <Card.Header>
            <Card.Title>Change Master Password</Card.Title>
          </Card.Header>
          <ChangePasswordForm />
        </Card.Root>

        <Card.Root id="two-factor" variant="elevated">
          <Card.Header>
            <Stack direction="row" justify="space-between" gap={2}>
              <Card.Title>Two-Factor Authentication</Card.Title>
              <Badge colorPalette={user.enable2FA ? 'green' : 'yellow'} size="lg">
                {user.enable2FA ? 'Enabled' : 'Available'}
              </Badge>
            </Stack>
          </Card.Header>
          <TwoFactorForm user={user} />
        </Card.Root>

        <Card.Root id="billing" variant="elevated">
          <Card.Header>
            <Card.Title>Billing</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>There are no billable items at this time.</Card.Description>
          </Card.Body>
        </Card.Root>

        <Card.Root id="sharing-keys" variant="elevated">
          <Card.Header>
            <Card.Title>Sharing Keys</Card.Title>
            <Card.Description>
              These keys are used to securely share information with users you trust. Your data will be encrypted with
              asymmetric encryption using your public key and can only be decrypted with your private key stored
              securely in memory.
            </Card.Description>
          </Card.Header>
          <SharingKeysForm user={user} />
        </Card.Root>

        <Card.Root id="notifications" variant="elevated">
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>There are not any notifications at this time.</Card.Description>
          </Card.Body>
        </Card.Root>

        <Card.Root id="export-data" variant="elevated">
          <Card.Header>
            <Card.Title>Export Data</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>You can export your data at any time.</Card.Description>
          </Card.Body>
        </Card.Root>

        <Card.Root id="delete-account" variant="elevated">
          <Card.Header>
            <Card.Title>
              Delete Account{' '}
              <Badge colorPalette="red">
                <TbExclamationCircle />
                Danger
              </Badge>
            </Card.Title>
          </Card.Header>
          <Card.Body spaceY={4}>
            <Card.Description>
              Deleting your account is permanent and cannot be undone This will destroy all your data and associated
              vaults. Consider exporting your data before proceeding.
            </Card.Description>
            <Collapsible.Root>
              <Collapsible.Trigger asChild>
                <Button colorPalette="red" size="sm" variant="surface">
                  <TbTrash />
                  Delete Account
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Box p={4} border="1px solid" borderColor="border.error" mt={4} rounded="md">
                  <form>
                    <Checkbox.Root colorPalette="red">
                      <Checkbox.HiddenInput required />
                      <Checkbox.Control />
                      <Checkbox.Label>
                        I understand that I must export my data <em>before</em> deleting my account.
                      </Checkbox.Label>
                    </Checkbox.Root>
                    <Checkbox.Root colorPalette="red">
                      <Checkbox.HiddenInput required />
                      <Checkbox.Control />
                      <Checkbox.Label>
                        I understand that all my data will be permanently erased from Passman&apos;s servers.
                      </Checkbox.Label>
                    </Checkbox.Root>
                    <Checkbox.Root colorPalette="red">
                      <Checkbox.HiddenInput required />
                      <Checkbox.Control />
                      <Checkbox.Label>I understand that this action cannot be undone.</Checkbox.Label>
                    </Checkbox.Root>
                    <Separator my={4} />
                    <Box spaceX={4}>
                      <Button colorPalette="red" type="submit">
                        <TbShredder />
                        Delete Account
                      </Button>
                      <Collapsible.Trigger asChild>
                        <Button variant="subtle">
                          <TbX />
                          Cancel
                        </Button>
                      </Collapsible.Trigger>
                    </Box>
                  </form>
                </Box>
              </Collapsible.Content>
            </Collapsible.Root>
          </Card.Body>
        </Card.Root>
      </Flex>

      <Flex direction="column" as="nav" maxW="2xs" w="full" color="text.muted" position="sticky" top={4}>
        <Heading as="h6" size="sm" mb={2} px={2} pb={1} borderBottom="1px solid" borderColor="border.muted">
          ON THIS PAGE
        </Heading>
        <List.Root gap={1} listStyleType="none" px={2}>
          <List.Item>
            <Link href="#about-you">About You</Link>
          </List.Item>
          <List.Item>
            <Link href="#change-password">Change Master Password</Link>
          </List.Item>
          <List.Item>
            <Link href="#two-factor">Two-Factor Authentication</Link>
          </List.Item>
          <List.Item>
            <Link href="#billing">Billing</Link>
          </List.Item>
          <List.Item>
            <Link href="#sharing-keys">Sharing Keys</Link>
          </List.Item>
          <List.Item>
            <Link href="#notifications">Notifications</Link>
          </List.Item>
          <List.Item>
            <Link href="#export-data">Export Data</Link>
          </List.Item>
          <List.Item>
            <Link href="#delete-account">Delete Account</Link>
          </List.Item>
        </List.Root>
      </Flex>
    </Flex>
  );
}
