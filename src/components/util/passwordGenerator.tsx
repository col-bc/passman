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
  createListCollection,
  Dialog,
  Em,
  Field,
  Fieldset,
  Flex,
  Float,
  HStack,
  Icon,
  IconButton,
  Kbd,
  NumberInput,
  SegmentGroup,
  Select,
  SimpleGrid,
  Slider,
  Text,
  VStack,
} from '@chakra-ui/react';
import { DialogOpenChangeDetails } from '@chakra-ui/react/dialog';
import React from 'react';
import {
  TbBoltFilled,
  TbCheck,
  TbCopy,
  TbCurrencyDollar,
  TbLetterCaseLower,
  TbLetterCaseUpper,
  TbNumber123,
  TbRefresh,
  TbX,
} from 'react-icons/tb';
import zxcvbn from 'zxcvbn';
import { useColorModeValue } from '../ui/color-mode';

const GENERATOR_DEFAULTS: {
  password: {
    length: number;
    characterTypes: string[];
  };
  passphrase: {
    length: number;
    characterItems: string[];
    separator: string;
  };
  pin: {
    length: number;
    characterItems: string[];
  };
} = {
  password: {
    length: 20,
    characterTypes: ['lowercase', 'uppercase', 'numbers', 'symbols'],
  },
  passphrase: {
    length: 4,
    characterItems: ['lowercase'],
    separator: 'Space',
  },
  pin: {
    length: 4,
    characterItems: ['numbers'],
  },
};

const symbols = '\`!@#$%^&*()_+=-[]{}\'",<.>/?';
const numbers = '0123456789';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';

type ModeType = 'Password' | 'Passphrase' | 'PIN';
const modeOptions = ['Password', 'Passphrase', 'PIN'] as ModeType[];

const separatorCollection = createListCollection({
  items: [
    { value: ' ', label: 'Space' },
    { value: '-', label: 'Hyphen' },
    { value: '_', label: 'Underscore' },
    { value: '.', label: 'Period' },
    { value: '', label: 'None' },
    { value: '#', label: 'Random Special Character' },
  ],
});

const characterItems = [
  { value: 'lowercase', icon: <TbLetterCaseLower />, label: 'Lowercase', description: 'Include lowercase letters' },
  { value: 'uppercase', icon: <TbLetterCaseUpper />, label: 'Uppercase', description: 'Include uppercase letters' },
  { value: 'numbers', icon: <TbNumber123 />, label: 'Numbers', description: 'Include numbers' },
  {
    value: 'symbols',
    icon: <TbCurrencyDollar />,
    label: 'Symbols',
    description: 'Include symbols',
  },
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

  const [mode, setMode] = React.useState<ModeType>('Password');
  const [value, setValue] = React.useState('');
  const [length, setLength] = React.useState(12);
  const [separator, setSeparator] = React.useState(separatorCollection.items[0].value);
  const [timeToBreak, setTimeToBreak] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ title: string; message?: string } | null>(null);

  const handleGeneratePassword = React.useCallback(() => {
    setError(null);
    if (selectedCharacterTypes.length === 0) {
      setError({ title: 'Cannot Generate', message: 'At least one character type must be selected.' });
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
      setError(null);
      try {
        const response = await fetch(`/api/wordlist?count=${length}`, { method: 'GET' });

        if (!response.ok) {
          throw new Error('An error occurred while communicating with the server. Please try again.');
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
        setError({
          title: 'Failed to Generate Passphrase',
          message:
            (error as Error).message ||
            'An unknown error occurred. If you continue to get this error. Please contact support.',
        });
        return [];
      }
    };
    getWords()
      .then((words) => {
        let generatedPassphrase = '';

        if (separator === '#') {
          const validSeparators = symbols.split('').map((s) => ({ value: s }));
          generatedPassphrase = words.reduce((passphrase, word, index) => {
            if (index === 0) return word;
            const randomSep = validSeparators[Math.floor(Math.random() * validSeparators.length)].value;
            return passphrase + randomSep + word;
          }, '');
        } else {
          generatedPassphrase = words.join(separator);
        }

        setValue(generatedPassphrase);
        onSecretChange?.(generatedPassphrase);
      })
      .catch((err0r) =>
        setError({
          title: 'Failed to Generate Passphrase',
          message:
            (err0r as Error).message ||
            'An unknown error occurred. If you continue to get this error. Please contact support.',
        }),
      );
  }, [selectedCharacterTypes, length, separator, onSecretChange]);

  const handleGeneratePin = React.useCallback(() => {
    const generatedPin = Array.from({ length: length }, () => Math.floor(Math.random() * 10)).join('');
    setValue(generatedPin);
    onSecretChange?.(generatedPin);
  }, [length, onSecretChange]);

  const handleGenerate = React.useCallback(() => {
    if (mode === 'Password') {
      handleGeneratePassword();
    } else if (mode === 'Passphrase') {
      handleGeneratePassphrase();
    } else if (mode === 'PIN') {
      handleGeneratePin();
    }
  }, [mode, handleGeneratePassword, handleGeneratePassphrase, handleGeneratePin]);

  // Set default values by GENERATOR_DEFAULTS
  React.useEffect(() => {
    if (mode === 'Password') {
      const setPasswordDefaults = () => {
        setLength(GENERATOR_DEFAULTS.password.length);
        setSelectedCharacterTypes(GENERATOR_DEFAULTS.password.characterTypes);
      };
      setPasswordDefaults();
    } else if (mode === 'Passphrase') {
      const setPassphraseDefaults = () => {
        setLength(GENERATOR_DEFAULTS.passphrase.length);
        setSelectedCharacterTypes(GENERATOR_DEFAULTS.passphrase.characterItems);
      };
      setPassphraseDefaults();
    } else if (mode === 'PIN') {
      const setPinDefaults = () => {
        setLength(GENERATOR_DEFAULTS.pin.length);
        setSelectedCharacterTypes(GENERATOR_DEFAULTS.pin.characterItems);
      };
      setPinDefaults();
    }
  }, [mode]);

  // Generate a new secret
  React.useEffect(() => {
    const doEffect = () => handleGenerate();
    doEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, length, selectedCharacterTypes, separator]);

  // Calculate time to break for the current value using zxcvbn
  React.useEffect(() => {
    const calculateTimeToBreak = () => {
      if (value) {
        const result = zxcvbn(value);

        setTimeToBreak(result.crack_times_display.offline_fast_hashing_1e10_per_second.toString());
      }
    };
    calculateTimeToBreak();
  }, [value, mode]);

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
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error?.title}</Alert.Title>
            <Alert.Description>{error?.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <VStack gap={1} w="full">
        <HStack
          align="center"
          justify="space-between"
          bg="bg.subtle"
          borderWidth="1px"
          borderColor="border.muted"
          rounded="xl"
          p={4}
          minH="5rem"
          w="full"
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
        </HStack>
        {timeToBreak !== null && (
          <HStack gap={2} color="fg.muted" w="full">
            <TbBoltFilled size={18} />
            <Text fontSize="sm">
              It would take <strong>{timeToBreak}</strong> to break this password with <Em>ten billion</Em> attempts per
              second.
            </Text>
          </HStack>
        )}
      </VStack>

      <VStack gap={6} align="stretch">
        {/* Type and Separator */}
        <HStack justify="space-between" align="flex-start" gap={4}>
          <Field.Root flex={1} required>
            <VStack align="start" gap={1.5}>
              <Field.Label>
                Type <Field.RequiredIndicator />
              </Field.Label>
              <SegmentGroup.Root
                value={mode}
                onValueChange={(e) => setMode(e.value as ModeType)}
                colorPalette="yellow"
                required
              >
                <SegmentGroup.Indicator
                  _checked={{ color: 'colorPalette.fg', bg: 'colorPalette.subtle', fontWeight: 'medium' }}
                />
                <SegmentGroup.Items items={modeOptions} />
              </SegmentGroup.Root>
            </VStack>
          </Field.Root>

          {mode === 'Passphrase' && (
            <Select.Root
              collection={separatorCollection}
              value={[separator]}
              onValueChange={(val) => setSeparator(val.value[0])}
              colorPalette="yellow"
              maxW="xs"
              flex={1}
              required
            >
              <Select.Label>Separator</Select.Label>
              <Select.Trigger>
                <Select.ValueText placeholder="Select member">
                  {separatorCollection.items.find((item) => item.value === separator)?.label}{' '}
                  <Kbd size="sm">&quot;{separator}&quot;</Kbd>
                </Select.ValueText>
                <Select.Indicator />
              </Select.Trigger>
              <Select.Positioner>
                <Select.Content>
                  {separatorCollection.items.map((item) => (
                    <Select.Item key={`separator-item-${item.label}`} item={item}>
                      <Select.ItemText>
                        {item.label} <Kbd size="sm">&quot;{item.value}&quot;</Kbd>
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          )}
        </HStack>

        {/* Length Slider */}
        <VStack align="start" gap={1.5} w="full">
          <Field.Root>
            <Field.Label>{mode === 'Passphrase' ? 'Word Count' : 'Character Length'}</Field.Label>
            <Flex gap={4} w="full" align="center">
              <Slider.Root
                value={[length]}
                onValueChange={(e) => setLength(e.value[0])}
                min={1}
                max={mode === 'Passphrase' ? 20 : 100}
                w="full"
                colorPalette="yellow"
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Control>
              </Slider.Root>
              <NumberInput.Root
                value={length.toString()}
                onValueChange={(val) => setLength(val.valueAsNumber)}
                min={1}
                max={mode === 'Passphrase' ? 20 : 100}
                w="20"
                size="sm"
              >
                <NumberInput.Control />
                <NumberInput.Input textAlign="center" />
              </NumberInput.Root>
            </Flex>
          </Field.Root>
        </VStack>

        {/* Character Toggle Cards  */}
        {['Password', 'Passphrase'].includes(mode) && (
          <Fieldset.Root>
            <VStack align="start" gap={1.5} w="full">
              <Text textStyle="sm" fontWeight="medium">
                Character Set
              </Text>
              <CheckboxGroup
                value={selectedCharacterTypes}
                onValueChange={(e) => setSelectedCharacterTypes(e)}
                colorPalette="yellow"
              >
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="2" w="full">
                  {characterItems.map((item) => (
                    <CheckboxCard.Root
                      value={item.value}
                      align="center"
                      variant="surface"
                      key={`characters-checkCard-${item.value}`}
                    >
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
          </Fieldset.Root>
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
