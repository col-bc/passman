'use client';

import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { useVaults } from '@/hooks/use-vaults';
import { User } from '@/prisma/client';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Circle,
  CloseButton,
  Drawer,
  EmptyState,
  Flex,
  Float,
  IconButton,
  Input,
  InputGroup,
  InputGroupProps,
  Link,
  Menu,
  Separator,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  TbBell,
  TbBellCheck,
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
  TbLockSquareRounded,
  TbPlus,
  TbSearch,
  TbShieldLock,
  TbUserCircle,
} from 'react-icons/tb';
import SignOutButton from './forms/auth/signOut';
import Logo from './logo';
import { ColorModeButton } from './ui/color-mode';
import { Toaster } from './ui/toaster';

export default function AppWrapper({ children, user }: { children: React.ReactNode; user: User }) {
  const [open, setOpen] = React.useState(true);
  return (
    <Flex direction="column" h="100vh" overflow="hidden" w="full" bg="bg">
      <Flex direction="row" align="stretch" h="full" w="full" flex={1} minH={0} bg="bg.muted">
        <Sidebar user={user} open={open} />

        <Box
          as="main"
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          minH={0}
          roundedLeft={open ? '2xl' : '0px'}
          bg="bg"
          shadow="lg"
        >
          <Flex w="full" direction="row" gap={4} align="center" py={2} px={[4, 6]} mb={[0, 4, 6]} maxW="5xl" mx="auto">
            <IconButton onClick={() => setOpen(!open)} aria-label="Toggle Sidebar" variant="ghost">
              {open ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarLeftExpand />}
            </IconButton>

            <IconButton colorPalette="yellow" aria-label="Create New Item" variant="surface" ml="auto">
              <TbPlus />
            </IconButton>
            <SearchBar query="" onQueryChange={() => {}} />
            <ColorModeButton />
            <NotificationDrawer />
          </Flex>
          {children}
        </Box>
      </Flex>
      <Toaster />
    </Flex>
  );
}

const Sidebar: React.FC<{ user: User; open: boolean }> = ({ user, open }) => {
  return (
    <Box
      as="aside"
      width={open ? '260px' : '0px'}
      overflow="hidden"
      transition="width 0.2s ease-in-out"
      borderRightWidth={open ? '1px' : '0px'}
      borderColor="border.muted"
    >
      <Flex direction="column" h="full" w="260px" pt={4} px={3}>
        <Box px={3} mb={6}>
          <Logo asLink href="/vaults" />
        </Box>
        <SidebarLinks user={user} />
      </Flex>
    </Box>
  );
};

const SidebarLinks: React.FC<{ user: User }> = ({ user }) => {
  const pathName = usePathname();
  const { vaults } = useVaults();
  const { totalIssues } = useSecurityAnalytics(vaults);

  return (
    <Flex direction="column" as="ul" flex={1} overflowY="auto" gap={1} w="full" h="full">
      <NextLink href="/vaults" passHref style={{ width: '100%' }}>
        <Button
          variant={pathName.startsWith('/vaults') ? 'subtle' : 'ghost'}
          colorPalette="gray"
          justifyContent="flex-start"
          gap={2}
          w="full"
        >
          <TbLockSquareRounded />
          Vaults
        </Button>
      </NextLink>
      <NextLink href="/security-center" passHref style={{ width: '100%' }}>
        <Button
          variant={pathName.startsWith('/security-center') ? 'subtle' : 'ghost'}
          colorPalette="gray"
          justifyContent="flex-start"
          gap={2}
          w="full"
        >
          <TbShieldLock />
          Security Center
          {totalIssues > 0 && (
            <Badge colorPalette="red" variant="subtle" rounded="full" ml="auto">
              {totalIssues}
            </Badge>
          )}
        </Button>
      </NextLink>

      <Separator orientation="horizontal" mt="auto" mb={2} />
      <Menu.Root positioning={{ placement: 'top-end' }}>
        <Menu.Trigger asChild>
          <Button variant="ghost" colorPalette="gray" w="full" h="auto" py={3} px={3}>
            <Flex direction="row" align="center" gap={3} w="full">
              <Avatar.Root variant="subtle" colorPalette="yellow" rounded="md">
                <Avatar.Fallback>{user?.name?.charAt(0) ?? 'U'}</Avatar.Fallback>
              </Avatar.Root>
              <Flex direction="column" align="start" gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="bold" lineHeight="short" color="fg.default">
                  {user?.name ?? 'User'}
                </Text>
                <Text fontSize="2xs" color="fg.muted" truncate>
                  {user?.email ?? ''}
                </Text>
              </Flex>
            </Flex>
          </Button>
        </Menu.Trigger>

        <Menu.Positioner>
          <Menu.Content w={48}>
            <Menu.Item asChild value="account">
              <Link href="/account">
                <TbUserCircle />
                Account Settings
              </Link>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item asChild value="logout">
              <SignOutButton size="xs" variant="ghost" colorPalette="red" justifyContent="flex-start" />
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      <Separator orientation="horizontal" display={{ base: 'block', md: 'none' }} />
      <SearchBar query="" onQueryChange={() => {}} display={{ base: 'block', md: 'none' }} />
    </Flex>
  );
};

const NotificationDrawer: React.FC = () => {
  const { vaults } = useVaults();
  const { totalIssues, issues } = useSecurityAnalytics(vaults);
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Box position="relative">
          <IconButton aria-label="Open notifications" variant="ghost">
            <TbBell />
          </IconButton>
          {totalIssues > 0 && (
            <Float zIndex={999}>
              <Circle size="5" bg="red" color="white">
                {totalIssues}
              </Circle>
            </Float>
          )}
        </Box>
      </Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Notifications</Drawer.Title>
            <Drawer.CloseTrigger>
              <CloseButton aria-label="Close notifications" />
            </Drawer.CloseTrigger>
          </Drawer.Header>
          <Drawer.Body>
            {totalIssues === 0 ? (
              <EmptyState.Root>
                <EmptyState.Indicator>
                  <TbBellCheck />
                </EmptyState.Indicator>
                <EmptyState.Title textAlign="center">All Caught Up!</EmptyState.Title>
                <EmptyState.Description textAlign="center">
                  You have no new notifications at this time. Check back later for updates.
                </EmptyState.Description>
              </EmptyState.Root>
            ) : (
              <Flex direction="column" gap="4">
                {issues.repeatPasswords.map((item) => (
                  <Card.Root key={item.occurrences[0].itemId} variant="subtle" size="sm">
                    <Card.Header>
                      <Card.Title>Repeated Password</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Description>
                        <strong>{item.occurrences[0].itemName}</strong> has a password that is repeated{' '}
                        {item.occurrences.length} times.
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                      <Button size="sm" colorPalette="yellow" asChild>
                        <Link href={`/vaults/${item.occurrences[0].vaultId}/item/${item.occurrences[0].itemId}`}>
                          Fix Problem
                        </Link>
                      </Button>
                    </Card.Footer>
                  </Card.Root>
                ))}
                {issues.weakPasswords.map((item) => (
                  <Card.Root key={item.itemId} variant="subtle" size="sm">
                    <Card.Header>
                      <Card.Title>Weak Password</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Description>
                        <strong>{item.itemName}</strong> has a password that does not meet modern security standards.
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                      <Button size="sm" colorPalette="yellow" asChild>
                        <Link href={`/vaults/${item.vaultId}/item/${item.itemId}`}>Fix Problem</Link>
                      </Button>
                    </Card.Footer>
                  </Card.Root>
                ))}
                {issues.breaches.map((item) => (
                  <Card.Root key={item.itemId} variant="subtle" size="sm">
                    <Card.Header>
                      <Card.Title>Breached Password</Card.Title>
                    </Card.Header>
                    <Card.Body>
                      <Card.Description>
                        <strong>{item.itemName}</strong> has a password that has been found in {item.breachCount}{' '}
                        breache{item.breachCount === 1 ? '' : 's'}.
                      </Card.Description>
                    </Card.Body>
                    <Card.Footer>
                      <Button size="sm" colorPalette="yellow" asChild>
                        <Link href={`/vaults/${item.vaultId}/item/${item.itemId}`}>Fix Problem</Link>
                      </Button>
                    </Card.Footer>
                  </Card.Root>
                ))}
              </Flex>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};

const SearchBar: React.FC<
  { query: string; onQueryChange: (query: string) => void } & Omit<InputGroupProps, 'children'>
> = ({ query, onQueryChange, ...props }) => {
  return (
    <InputGroup
      startElement={<TbSearch />}
      w="full"
      maxW={{ base: 'full', md: '2xs' }}
      colorPalette="yellow"
      {...props}
    >
      <Input placeholder="Search..." variant="subtle" value={query} onChange={(e) => onQueryChange(e.target.value)} />
    </InputGroup>
  );
};
