'use client';

import { useLocker } from '@/hooks/use-locker';
import { useSecurityAnalytics } from '@/hooks/use-security-analytics';
import { User } from '@/prisma/client';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Circle,
  CloseButton,
  Collapsible,
  Drawer,
  EmptyState,
  Flex,
  Float,
  IconButton,
  Input,
  InputGroup,
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
  TbKey,
  TbLockSquareRounded,
  TbMenu,
  TbPlus,
  TbSearch,
  TbSettings,
  TbShieldLock,
  TbUserCircle,
} from 'react-icons/tb';
import SignOutButton from './forms/signOut';
import Logo from './logo';
import { ColorModeButton } from './ui/color-mode';
import { Toaster } from './ui/toaster';
import { Tooltip } from './ui/tooltip';

export default function AppWrapper({ children, user }: { children: React.ReactNode; user: User }) {
  return (
    <Flex direction="column" h="100vh" overflow="hidden" w="full">
      {/* --- DESKTOP LAYOUT --- */}
      <Flex direction="column" display={{ base: 'none', md: 'flex' }} h="full" w="full">
        <Box borderBottom="1px solid" borderColor="border" bg="bg" w="full" flexShrink={0} px={6} py={2}>
          <Flex w="full" direction="row" gap={4} align="center">
            <Logo asLink href="/locker" />
            <Box flex={1} minW={0} />
            <Tooltip content="Create New Item" positioning={{ placement: 'bottom' }}>
              <IconButton colorPalette="yellow" aria-label="Create New Item" variant="surface">
                <TbPlus />
              </IconButton>
            </Tooltip>
            <InputGroup startElement={<TbSearch />} w="full" maxW={{ base: 'full', md: '2xs' }}>
              <Input placeholder="Search..." />
            </InputGroup>
            <ColorModeButton />
            <NotificationDrawer issueCount={3} />
          </Flex>
        </Box>

        <Flex direction="row" align="stretch" h="full" w="full" flex={1} minH={0}>
          <AppBar user={user} />

          {/* Scrollable Main Area */}
          <Box as="main" flex={1} overflowY="auto" minH={0}>
            {children}
          </Box>
        </Flex>
      </Flex>

      {/* --- MOBILE LAYOUT --- */}
      <Flex direction="column" display={{ base: 'flex', md: 'none' }} h="full" w="full">
        <Box borderBottom="1px solid" borderColor="border" bg="bg.subtle" w="full" flexShrink={0}>
          <Collapsible.Root>
            <Flex gap={1} px={4} py={3} align="center">
              <Logo asLink href="/locker" />
              <ColorModeButton ml="auto" />
              <NotificationDrawer issueCount={3} />
              <Collapsible.Trigger asChild>
                <IconButton aria-label="Open navigation menu" variant="ghost">
                  <TbMenu />
                </IconButton>
              </Collapsible.Trigger>
            </Flex>

            <Collapsible.Content asChild>
              <Box py={2} borderTop="1px solid" borderColor="border">
                <SidebarLinks user={user} />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </Box>

        {/* Scrollable Main Area (Mobile) */}
        <Box as="main" flex={1} bg="bg" color="fg" overflowY="auto" minH={0}>
          {children}
        </Box>
      </Flex>

      <Toaster />
    </Flex>
  );
}

const SidebarLinks: React.FC<{ user: User }> = ({ user }) => {
  const pathName = usePathname();
  const { lockers } = useLocker();
  const { totalIssues } = useSecurityAnalytics(lockers);

  return (
    <Flex direction="column" as="ul" flex={1} overflowY="auto" px={4} py={2} gap={2} w="full" h="full">
      <Button
        variant={pathName.startsWith('/locker') ? 'subtle' : 'ghost'}
        colorPalette="gray"
        justifyContent="flex-start"
        gap={2}
        asChild
      >
        <Link as={NextLink} href="/locker">
          <TbLockSquareRounded />
          Lockers
        </Link>
      </Button>
      <Button
        variant={pathName.startsWith('/security-center') ? 'subtle' : 'ghost'}
        colorPalette="gray"
        justifyContent="flex-start"
        gap={2}
        asChild
      >
        <Link as={NextLink} href="/security-center">
          <TbShieldLock />
          Security Center
          <Badge colorPalette="red" variant="subtle" rounded="full" ml="auto">
            {totalIssues}
          </Badge>
        </Link>
      </Button>
      <Button
        variant={pathName.startsWith('/password-generator') ? 'subtle' : 'ghost'}
        colorPalette="gray"
        justifyContent="flex-start"
        gap={2}
        asChild
      >
        <Link as={NextLink} href="/password-generator">
          <TbKey />
          Password Generator
        </Link>
      </Button>

      <Separator orientation="horizontal" mt="auto" />
      <Menu.Root positioning={{ placement: 'top-end' }}>
        <Menu.Trigger asChild>
          <Button variant="ghost" colorPalette="gray" w="full" h="auto" py={3} px={3}>
            <Flex direction="row" align="center" gap={3} w="full">
              <Avatar.Root variant="subtle" colorPalette="yellow">
                <Avatar.Fallback>{user?.name?.charAt(0) ?? 'U'}</Avatar.Fallback>
              </Avatar.Root>
              <Flex direction="column" align="start" gap={0} flex={1}>
                <Text fontSize="sm" fontWeight="bold" lineHeight="short" color="fg.default">
                  {user?.name ?? 'User'}
                </Text>
                <Text fontSize="xs" color="fg.muted">
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
                Account
              </Link>
            </Menu.Item>
            <Menu.Item asChild value="settings">
              <Link href="/settings">
                <TbSettings />
                Settings
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

const AppBar: React.FC<{ user: User }> = ({ user }) => {
  const [viewportWidth, setViewportWidth] = React.useState<number>(0);

  const handleResize = React.useCallback(() => {
    setViewportWidth(window.innerWidth);
  }, []);

  React.useEffect(() => {
    const handleEffect = () => {
      setViewportWidth(window.innerWidth);
    };
    handleEffect();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const isDesktop = viewportWidth >= 768;

  return (
    <Flex
      direction="column"
      as="nav"
      h="full"
      w={isDesktop ? '64' : 'full'}
      bg="bg"
      borderRight="1px solid"
      borderColor="border"
      justify="start"
    >
      <Box flex={1} overflowY="auto" w="full">
        <SidebarLinks user={user} />
      </Box>
    </Flex>
  );
};

const NotificationDrawer: React.FC<{ issueCount: number }> = ({ issueCount }) => {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Box position="relative">
          <IconButton aria-label="Open notifications" variant="ghost">
            <TbBell />
          </IconButton>
          <Float>
            <Circle size="5" bg="red" color="white">
              {issueCount}
            </Circle>
          </Float>
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
            <EmptyState.Root>
              <EmptyState.Indicator>
                <TbBellCheck />
              </EmptyState.Indicator>
              <EmptyState.Title textAlign="center">All Caught Up!</EmptyState.Title>
              <EmptyState.Description textAlign="center">
                You have no new notifications at this time. Check back later for updates.
              </EmptyState.Description>
            </EmptyState.Root>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
};
