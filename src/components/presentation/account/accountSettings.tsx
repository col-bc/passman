import AboutYouForm from '@/components/forms/account/aboutYou';
import ChangePasswordForm from '@/components/forms/account/changePasswordForm';
import TwoFactorForm from '@/components/forms/account/twoFactor';
import { User } from '@/prisma/client';
import { Badge, Card, Flex, Heading, Link, List, Stack } from '@chakra-ui/react';

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

        <Card.Root id="notifications" variant="elevated">
          <Card.Header>
            <Card.Title>Notifications</Card.Title>
          </Card.Header>
          <Card.Body>
            <Card.Description>There are not any notifications at this time.</Card.Description>
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
            <Link href="#notifications">Notifications</Link>
          </List.Item>
        </List.Root>
      </Flex>
    </Flex>
  );
}
