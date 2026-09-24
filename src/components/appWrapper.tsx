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
  Dialog,
  Drawer,
  EmptyState,
  Flex,
  Float,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputGroupProps,
  Link,
  Menu,
  Separator,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  TbBell,
  TbBellCheck,
  TbLayoutNavbarCollapseFilled,
  TbLayoutNavbarExpandFilled,
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftExpand,
  TbLockPassword,
  TbLockSquareRounded,
  TbPlus,
  TbSearch,
  TbShieldLock,
  TbUserCircle,
  TbX,
} from 'react-icons/tb';
import SignOutButton from './forms/auth/signOut';
import { VaultIconMap } from './forms/vault/iconPicker';
import Logo from './logo';
import AppCrumbs from './presentation/appCrumbs';
import { ColorModeButton } from './ui/color-mode';
import { Toaster } from './ui/toaster';

export default function AppWrapper({ children, user }: { children: React.ReactNode; user: User }) {
  const [open, setOpen] = React.useState(true);

  return (
    <Flex direction="column" h="100vh" overflowX="hidden" w="full" bg="bg">
      <Flex direction={{ base: 'column', md: 'row' }} align="stretch" h="full" w="full" flex={1} minH={0} bg="bg.muted">
        <Sidebar user={user} open={open} setOpen={setOpen} />

        <Box
          as="main"
          flex={1}
          overflowY="auto"
          overflowX="hidden"
          minH={0}
          roundedTopLeft={open ? '2xl' : '0px'}
          roundedTopRight={{ base: open ? '2xl' : '0px', md: '0px' }}
          transition="border-radius 0.2s ease-in-out"
          bg="bg"
          shadow="lg"
        >
          <Flex w="full" direction="row" gap={4} align="center" py={4} px={[4, 6]} maxW="5xl" mx="auto">
            <IconButton onClick={() => setOpen(!open)} aria-label="Toggle Sidebar" variant="ghost" mr="auto">
              <Box display={{ base: 'flex', md: 'none' }}>
                {open ? <TbLayoutNavbarCollapseFilled /> : <TbLayoutNavbarExpandFilled />}
              </Box>
              <Box display={{ base: 'none', md: 'flex' }}>
                {open ? <TbLayoutSidebarLeftCollapseFilled /> : <TbLayoutSidebarLeftExpand />}
              </Box>
            </IconButton>

            <NewItemButton />

            <Box>
              <SearchBar query="" onQueryChange={() => {}} />
            </Box>

            <ColorModeButton />
            <NotificationDrawer />
          </Flex>
          <Box maxW="5xl" py={2} px={[4, 6]} mx="auto">
            <AppCrumbs w="full" />
          </Box>
          {children}
        </Box>
      </Flex>
      <Toaster />
    </Flex>
  );
}

const Sidebar: React.FC<{ user: User; open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({
  user,
  open,
  setOpen,
}) => {
  return (
    <Box
      as="aside"
      width={{ base: 'full', md: open ? '260px' : '0px' }}
      height={{ base: open ? '340px' : '0px', md: 'full' }}
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      borderRightWidth={{ base: '0px', md: open ? '1px' : '0px' }}
      borderBottomWidth={{ base: open ? '1px' : '0px', md: '0px' }}
      borderColor="border.muted"
    >
      <Flex direction="column" h={{ base: '340px', md: 'full' }} minW="260px" w="full" pt={4} px={3}>
        <Flex px={3} mb={6} justifyContent="space-between" alignItems="center">
          <Logo asLink href="/vaults" forceFull />
          <IconButton
            aria-label="Close Sidebar"
            variant="ghost"
            onClick={() => setOpen(false)}
            display={{ base: 'flex', md: 'none' }}
          >
            <TbX />
          </IconButton>
        </Flex>
        <SidebarLinks user={user} />
      </Flex>
    </Box>
  );
};

const SidebarLinks: React.FC<{ user: User }> = ({ user }) => {
  const pathName = usePathname();
  const { vaults } = useVaults();
  const { totalIssues } = useSecurityAnalytics(vaults);

  const isCurrentPath = (path: string) => pathName.startsWith(path);

  return (
    <Flex direction="column" as="ul" flex={1} overflowY="auto" gap={1} w="full" h="full" p="1px">
      <Button
        variant={isCurrentPath('/vaults') ? 'plain' : 'subtle'}
        colorPalette={isCurrentPath('/vaults') ? 'yellow' : 'transparent'}
        w="full"
        justifyContent="flex-start"
        gap={2}
        asChild
      >
        <NextLink href="/vaults">
          <TbLockSquareRounded />
          Vaults
        </NextLink>
      </Button>
      <Button
        variant={isCurrentPath('/security-center') ? 'plain' : 'subtle'}
        colorPalette={isCurrentPath('/security-center') ? 'yellow' : 'transparent'}
        justifyContent="flex-start"
        gap={2}
        w="full"
        asChild
      >
        <NextLink href="/security-center">
          <TbShieldLock />
          Security Center
          {totalIssues > 0 && (
            <Badge colorPalette="red" variant="subtle" rounded="full" ml="auto">
              {totalIssues}
            </Badge>
          )}
        </NextLink>
      </Button>
      <Button
        variant={isCurrentPath('/password-generator') ? 'plain' : 'subtle'}
        colorPalette={isCurrentPath('/password-generator') ? 'yellow' : 'transparent'}
        justifyContent="flex-start"
        gap={2}
        w="full"
        asChild
      >
        <NextLink href="/password-generator">
          <TbLockPassword />
          Password Generator
        </NextLink>
      </Button>

      <Separator orientation="horizontal" mt="auto" mb={2} />
      <Menu.Root positioning={{ placement: 'top-end' }}>
        <Menu.Trigger asChild>
          <Button variant="subtle" colorPalette="transparent" w="full" h="auto" py={3} px={3}>
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
            <CloseButton as={Drawer.CloseTrigger} aria-label="Close notifications" />
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
                        <Link
                          href={`/vaults/${item.occurrences[0].vaultId}/${item.occurrences[0].itemId}?mode=edit&highlightIndex=${item.occurrences[0].fieldIndex}`}
                        >
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
                        <Link
                          href={`/vaults/${item.vaultId}/${item.itemId}?mode=edit&highlightIndex=${item.fieldIndex}`}
                        >
                          Fix Problem
                        </Link>
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
                        <Link
                          href={`/vaults/${item.vaultId}/${item.itemId}?mode=edit&highlightIndex=${item.fieldIndex}`}
                        >
                          Fix Problem
                        </Link>
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
  const [mounted, setMounted] = React.useState(false);
  const [isMobile] = useMediaQuery(['(max-width: 767px)']);

  React.useEffect(() => {
    const handleMount = () => setMounted(true);
    handleMount();
  }, []);

  if (!mounted) {
    return <Box w="full" maxW={{ base: 'full', md: '2xs' }} h="10" />;
  }

  if (isMobile)
    return (
      <Dialog.Root>
        <IconButton as={Dialog.Trigger} variant="ghost">
          <TbSearch />
        </IconButton>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Input
                placeholder="Search..."
                variant="subtle"
                colorPalette="yellow"
                size="xl"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </Dialog.Header>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );

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

const NewItemButton: React.FC = () => {
  const { vaults } = useVaults();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant="surface" colorPalette="yellow" aria-label="New Item">
          <TbPlus />
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content w={52}>
          <Menu.ItemGroup>
            <Menu.ItemGroupLabel>Add Item to Vault</Menu.ItemGroupLabel>
            {vaults.map((vault) => (
              <Menu.Item key={vault.id} value={vault.id} asChild>
                <NextLink href={`/vaults/${vault.id}/new`}>
                  <TbPlus /> <Icon as={VaultIconMap[vault.icon]} aria-label={vault.title} /> {vault.title}
                </NextLink>
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};
