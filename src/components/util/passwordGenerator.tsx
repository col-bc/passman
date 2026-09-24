'use client';

import { toaster } from '@/components/ui/toaster';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CheckboxCard,
  CheckboxGroup,
  CloseButton,
  Dialog,
  Flex,
  Float,
  Icon,
  IconButton,
  NumberInput,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { DialogOpenChangeDetails } from '@chakra-ui/react/dialog';
import React from 'react';
import {
  TbCheck,
  TbCopy,
  TbHash,
  TbLetterCaseLower,
  TbLetterCaseUpper,
  TbNumber123,
  TbRefresh,
  TbX,
} from 'react-icons/tb';
import { useColorModeValue } from '../ui/color-mode';

const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';
const numbers = '0123456789';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';

const modeOptions = [
  { label: 'Password', value: 'password' },
  { label: 'Passphrase', value: 'passphrase' },
  { label: 'PIN', value: 'pin' },
] as const;

const separatorOptions = [
  { label: 'Space', value: ' ' },
  { label: 'Hyphen', value: '-' },
  { label: 'Underscore', value: '_' },
  { label: 'Dot', value: '.' },
] as const;

const characterItems = [
  { value: 'lowercase', icon: <TbLetterCaseLower />, label: 'Lowercase', description: 'Include lowercase letters' },
  { value: 'uppercase', icon: <TbLetterCaseUpper />, label: 'Uppercase', description: 'Include uppercase letters' },
  { value: 'numbers', icon: <TbNumber123 />, label: 'Numbers', description: 'Include numbers' },
  { value: 'symbols', icon: <TbHash />, label: 'Symbols', description: 'Include symbols' },
];
export default function PasswordGenerator({ onSecretChange }: { onSecretChange?: (secret: string) => void }) {
  const lowerCaseColor = useColorModeValue('gray.600', 'gray.400');
  const upperCaseColor = useColorModeValue('green.600', 'green.400');
  const numberColor = useColorModeValue('blue.600', 'blue.400');
  const symbolColor = useColorModeValue('red.600', 'red.400');

  const [selectedCharacterTypes, setSelectedCharacterTypes] = React.useState<string[]>([
    'lowercase',
    'uppercase',
    'numbers',
    'symbols',
  ]);

  const [mode, setMode] = React.useState<'password' | 'passphrase' | 'pin'>('password');
  const [value, setValue] = React.useState('');
  const [length, setLength] = React.useState(12);
  const [separator, setSeparator] = React.useState<(typeof separatorOptions)[number]['value']>(
    separatorOptions[0].value,
  );
  const [error, setError] = React.useState('');

  const handleGeneratePassword = React.useCallback(() => {
    setError('');
    if (
      !selectedCharacterTypes.includes('symbols') &&
      !selectedCharacterTypes.includes('numbers') &&
      !selectedCharacterTypes.includes('uppercase') &&
      !selectedCharacterTypes.includes('lowercase')
    ) {
      setError('At least one character type must be selected.');
      return;
    }

    const charset = [
      selectedCharacterTypes.includes('symbols') ? symbols : '',
      selectedCharacterTypes.includes('numbers') ? numbers : '',
      selectedCharacterTypes.includes('uppercase') ? uppercase : '',
      selectedCharacterTypes.includes('lowercase') ? lowercase : '',
    ].join('');

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }

    setValue(generatedPassword);
    onSecretChange?.(generatedPassword);
  }, [selectedCharacterTypes, length, onSecretChange]);

  const handleGeneratePassphrase = React.useCallback(() => {
    const getWords = async () => {
      try {
        const response = await fetch(`/api/wordlist?count=${length}`, { method: 'GET' });

        if (!response.ok) {
          throw new Error('Failed to fetch word list');
        }
        const { words }: { words: string[] } = await response.json();

        if (selectedCharacterTypes.includes('symbols')) {
          const symbolArray = symbols.split('');
          const randomSymbol = symbolArray[Math.floor(Math.random() * symbolArray.length)];
          const randomIndex = Math.floor(Math.random() * words.length);
          words[randomIndex] += randomSymbol;
        }

        if (selectedCharacterTypes.includes('numbers')) {
          const randomNumber = Math.floor(Math.random() * 10).toString();
          const randomIndex = Math.floor(Math.random() * words.length);
          words[randomIndex] += randomNumber;
        }

        if (selectedCharacterTypes.includes('uppercase')) {
          const randomIndex = Math.floor(Math.random() * words.length);
          words[randomIndex] = words[randomIndex].charAt(0).toUpperCase() + words[randomIndex].slice(1);
        }

        return words;
      } catch (error) {
        console.error(error);
        return [];
      }
    };
    getWords().then((words) => {
      const generatedPassphrase = words.join(separator);
      setValue(generatedPassphrase);
      onSecretChange?.(generatedPassphrase);
    });
  }, [selectedCharacterTypes, length, separator, onSecretChange]);

  const handleGeneratePin = React.useCallback(() => {
    const generatedPin = Array.from({ length: length }, () => Math.floor(Math.random() * 10)).join('');
    setValue(generatedPin);
    onSecretChange?.(generatedPin);
  }, [length, onSecretChange]);

  const handleGenerate = React.useCallback(() => {
    if (mode === 'password') {
      handleGeneratePassword();
    } else if (mode === 'passphrase') {
      handleGeneratePassphrase();
    } else if (mode === 'pin') {
      handleGeneratePin();
    }
  }, [mode, handleGeneratePassword, handleGeneratePassphrase, handleGeneratePin]);

  React.useEffect(() => {
    if (mode === 'password') {
      const setPasswordDefaults = () => {
        setLength(12);
        setSelectedCharacterTypes(['symbols', 'numbers', 'uppercase', 'lowercase']);
      };
      setPasswordDefaults();
    } else if (mode === 'passphrase') {
      const setPassphraseDefaults = () => {
        setLength(6);
        setSelectedCharacterTypes(['lowercase']);
      };
      setPassphraseDefaults();
    } else if (mode === 'pin') {
      const setPinDefaults = () => {
        setLength(4);
        setSelectedCharacterTypes(['numbers']);
      };
      setPinDefaults();
    }
  }, [mode]);

  React.useEffect(() => {
    const doEffect = () => handleGenerate();
    doEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length, selectedCharacterTypes, separator]);

  const charColor = (char: string) => {
    if (symbols.includes(char)) return symbolColor;
    if (numbers.includes(char)) return numberColor;
    if (uppercase.includes(char)) return upperCaseColor;
    if (lowercase.includes(char)) return lowerCaseColor;
    return 'fg.muted';
  };

  return (
    <Flex direction="column" gap={8} w="full">
      {error && (
        <Alert.Root size="sm" status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to Generate Password</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Modernized Output Display */}
      <Flex
        align="center"
        justify="space-between"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.muted"
        rounded="xl"
        p={4}
        minH="5rem"
      >
        <Box
          flex="1"
          display="flex"
          overflowX="auto"
          userSelect="all"
          fontSize="2xl"
          letterSpacing="widest"
          fontWeight="medium"
        >
          {value.split('').map((char, index) => (
            <Box as="span" key={index} color={charColor(char)} fontFamily="monospace" whiteSpace="pre">
              {char}
            </Box>
          ))}
        </Box>
        <ButtonGroup attached ml={4}>
          <IconButton
            variant="surface"
            colorPalette="gray"
            aria-label="Copy password"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toaster.success({
                title: 'Copied to Clipboard',
                description: 'The password has been copied to your clipboard.',
                duration: 2000,
                closable: true,
              });
            }}
          >
            <TbCopy />
          </IconButton>
          <IconButton variant="surface" colorPalette="gray" aria-label="Refresh password" onClick={handleGenerate}>
            <TbRefresh />
          </IconButton>
        </ButtonGroup>
      </Flex>

      <VStack gap={6} align="stretch">
        {/* Mode & Separator Segmented Controls */}
        <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
          <VStack align="start" gap={1.5}>
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              Type
            </Text>
            <Flex bg="bg.muted" p={1} rounded="lg">
              {modeOptions.map((m) => (
                <Button
                  key={m.value}
                  variant={mode === m.value ? 'solid' : 'ghost'}
                  colorPalette={mode === m.value ? 'yellow' : 'gray'}
                  size="sm"
                  onClick={() => setMode(m.value)}
                >
                  {m.label}
                </Button>
              ))}
            </Flex>
          </VStack>

          {mode === 'passphrase' && (
            <VStack align="start" gap={1.5}>
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                Separator
              </Text>
              <Flex bg="bg.muted" p={1} rounded="lg">
                {separatorOptions.map((s) => (
                  <Button
                    key={s.value}
                    variant={separator === s.value ? 'solid' : 'ghost'}
                    colorPalette={separator === s.value ? 'yellow' : 'gray'}
                    size="sm"
                    onClick={() => setSeparator(s.value)}
                  >
                    {s.label}
                  </Button>
                ))}
              </Flex>
            </VStack>
          )}
        </Flex>

        {/* Interactive Length Slider */}
        <VStack align="start" gap={1.5} w="full">
          <Flex justify="space-between" w="full">
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              {mode === 'passphrase' ? 'Word Count' : 'Character Length'}
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="yellow.500">
              {length}
            </Text>
          </Flex>
          <Flex gap={4} w="full" align="center">
            <input
              type="range"
              min={1}
              max={mode === 'passphrase' ? 20 : 100}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--chakra-colors-yellow-500)', cursor: 'pointer' }}
            />
            <NumberInput.Root
              value={length.toString()}
              onValueChange={(val) => setLength(val.valueAsNumber)}
              min={1}
              max={mode === 'passphrase' ? 20 : 100}
              w="20"
              size="sm"
            >
              <NumberInput.Control />
              <NumberInput.Input textAlign="center" />
            </NumberInput.Root>
          </Flex>
        </VStack>

        {/* Visual Toggle Cards for Characters */}
        {['password', 'passphrase'].includes(mode) && (
          <VStack align="start" gap={1.5} w="full">
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              Characters
            </Text>
            <CheckboxGroup
              value={selectedCharacterTypes}
              onValueChange={(value) => setSelectedCharacterTypes(value)}
              colorPalette="yellow"
            >
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="2" w="full">
                {characterItems.map((item) => (
                  <CheckboxCard.Root value={item.value} align="center" key={item.value}>
                    <CheckboxCard.HiddenInput />
                    <CheckboxCard.Control>
                      <CheckboxCard.Content>
                        <Icon fontSize="2xl" mb="2">
                          {item.icon}
                        </Icon>
                        <CheckboxCard.Label>{item.label}</CheckboxCard.Label>
                        <CheckboxCard.Description>{item.description}</CheckboxCard.Description>
                      </CheckboxCard.Content>
                      <Float placement="top-end" offset="6">
                        <CheckboxCard.Indicator />
                      </Float>
                    </CheckboxCard.Control>
                  </CheckboxCard.Root>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          </VStack>
        )}
      </VStack>
    </Flex>
  );
}

export function PasswordGeneratorDialog({
  open,
  setOpen,
  onSetSecret,
}: {
  open: boolean;
  setOpen: (open: DialogOpenChangeDetails) => void;
  onSetSecret: (secret: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen} placement="center" motionPreset="slide-in-bottom">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content w="full" maxW="2xl" p={2}>
          <Dialog.Header>
            <Dialog.Title fontFamily="heading" fontSize="xl">
              Generate Password
            </Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <CloseButton colorPalette="gray" />
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body>
            <PasswordGenerator onSecretChange={onSetSecret} />
          </Dialog.Body>
          <Dialog.Footer mt={4}>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="gray" variant="subtle" onClick={() => setOpen({ open: false })}>
                <TbX />
                Cancel
              </Button>
            </Dialog.ActionTrigger>
            <Dialog.ActionTrigger asChild>
              <Button
                colorPalette="yellow"
                onClick={() => {
                  setOpen({ open: false });
                }}
              >
                <TbCheck />
                Use Password
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
