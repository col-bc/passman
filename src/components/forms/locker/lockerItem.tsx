'use client';

import DeleteLockerItemDialog from '@/components/presentation/locker/deleteLockerItemDialog';
import LockerItemRead from '@/components/presentation/locker/lockerItemRead';
import { PasswordInput, PasswordStrengthMeter } from '@/components/ui/password-input';
import { toaster } from '@/components/ui/toaster';
import { Tooltip } from '@/components/ui/tooltip';
import { PasswordGeneratorDialog } from '@/components/util/passwordGenerator';
import { useLocker } from '@/hooks/use-locker';
import { encryptPayload } from '@/lib/crypto';
import { handleCreateLockerItem, handleUpdateLockerItem } from '@/lib/locker/lockerActions';
import formatDate from '@/lib/util/formats';
import {
  BankAccountTemplate,
  CredentialsTemplate,
  CreditCardTemplate,
  IdentityTemplate,
  SecureNoteTemplate,
  templateIcon,
} from '@/lib/util/itemTemplates';
import { DecryptedLockerItem, ItemContent } from '@/types/client';
import {
  Alert,
  AlertContent,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Collapsible,
  createListCollection,
  DataList,
  Editable,
  EmptyState,
  Field,
  Flex,
  Float,
  Group,
  Heading,
  IconButton,
  Input,
  List,
  Menu,
  NumberInput,
  Portal,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import {
  TbAlignJustified,
  TbAsteriskSimple,
  TbAt,
  TbBuildingBank,
  TbCalendarEvent,
  TbCircleMinus,
  TbClock,
  TbCopy,
  TbCreditCard,
  TbCube,
  TbDeviceFloppy,
  TbDotsVertical,
  TbEyeOff,
  TbFileTypography,
  TbId,
  TbLayoutList,
  TbLink,
  TbLock,
  TbNumber123,
  TbPasswordUser,
  TbPencil,
  TbPencilOff,
  TbPlus,
  TbRefresh,
  TbRosetteDiscountCheck,
  TbShare,
  TbTrash,
  TbTypography,
  TbX,
} from 'react-icons/tb';
import zxcvbn from 'zxcvbn';

const highlightPulse = keyframes`
  0% { background-color: transparent; }
  10% { background-color: var(--chakra-colors-yellow-subtle); }
  100% { background-color: transparent; }
`;

const templateOptions = createListCollection({
  items: [
    { value: 'credentials', label: 'Credentials', icon: <TbPasswordUser /> },
    { value: 'secureNote', label: 'Secure Note', icon: <TbFileTypography /> },
    { value: 'bankAccount', label: 'Bank Account', icon: <TbBuildingBank /> },
    { value: 'creditCard', label: 'Credit Card', icon: <TbCreditCard /> },
    { value: 'identity', label: 'Identity', icon: <TbId /> },
    { value: 'custom', label: 'Custom', icon: <TbCube /> },
  ],
});

const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toaster.success({
        title: 'Copied to clipboard',
        description: 'The value has been copied to your clipboard.',
        duration: 2000,
        closable: true,
      });
    })
    .catch((err) => {
      console.error('Failed to copy text: ', err);
      toaster.error({
        title: 'Copy Failed',
        description: 'Failed to copy the value to clipboard. Please try again.',
        duration: 2000,
        closable: true,
      });
    });
};

function LockerItemForm({
  lockerItem,
  lockerId,
  lockerName,
  defaultMode = 'read',
}: {
  lockerItem?: DecryptedLockerItem;
  lockerId?: string;
  lockerName?: string;
  defaultMode?: 'read' | 'edit';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lockers, mek } = useLocker();

  const highlightIndex = searchParams.get('highlightIndex')
    ? parseInt(searchParams.get('highlightIndex') as string, 10)
    : null;

  const templateSelectRef = React.useRef<HTMLDivElement>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState(lockerItem?.item.title || '');
  const [template, setTemplate] = React.useState(lockerItem?.item.category || '');
  const [locker, setLocker] = React.useState(lockerId || lockerItem?.lockerId || '');
  const [itemContent, setItemContent] = React.useState<ItemContent[]>([]);
  const [mode, setMode] = React.useState<'read' | 'edit'>(defaultMode);

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showPasswordGeneratorDialog, setShowPasswordGeneratorDialog] = React.useState(false);
  const [passwordFieldIndex, setPasswordFieldIndex] = React.useState<number | null>(null);

  const openPasswordGeneratorDialog = (index: number) => {
    setPasswordFieldIndex(index);
    setShowPasswordGeneratorDialog(true);
  };

  const initializeLockerItemContent = React.useCallback(() => {
    if (lockerItem && lockerItem.item.decryptedData) {
      try {
        const parsedContent: ItemContent[] = Array.isArray(lockerItem.item.decryptedData)
          ? lockerItem.item.decryptedData
          : (Object.values(lockerItem.item.decryptedData) as unknown as ItemContent[]);
        setTemplate(lockerItem.item.category);
        setItemContent(parsedContent);
      } catch (err) {
        console.error('Failed to load decrypted item content:', err);
        setError('Failed to load item content. Please try again.');
      }
    }
  }, [lockerItem]);

  React.useEffect(() => {
    const load = () => {
      initializeLockerItemContent();
    };
    load();
  }, [initializeLockerItemContent]);

  const lockerOptions = React.useMemo(() => {
    return createListCollection({
      items: lockers.map((locker) => ({
        value: locker.id,
        label: locker.title,
      })),
    });
  }, [lockers]);

  const handleTemplateChange = (selectedTemplate: string) => {
    setTemplate(selectedTemplate);
    setItemContent([]);
    switch (selectedTemplate) {
      case 'credentials':
        setItemContent([...CredentialsTemplate]);
        break;
      case 'secureNote':
        setItemContent([...SecureNoteTemplate]);
        break;
      case 'bankAccount':
        setItemContent([...BankAccountTemplate]);
        break;
      case 'creditCard':
        setItemContent([...CreditCardTemplate]);
        break;
      case 'identity':
        setItemContent([...IdentityTemplate]);
        break;
      default:
        setItemContent([]);
        break;
    }
  };

  const handleValueChange = React.useCallback((index: number, value: string) => {
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, value } : item)));
  }, []);

  const handleLabelChange = React.useCallback((index: number, label: string) => {
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, label } : item)));
  }, []);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!mek) {
      setError('Master encryption key is not available. Please unlock your account.');
      return;
    }

    if (!title || !locker || !template) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = JSON.stringify(itemContent);
    const encryptedData = await encryptPayload(payload, mek);

    if (lockerItem) {
      // Update existing locker item
      const status = await handleUpdateLockerItem(locker, lockerItem.item.id, encryptedData, {
        category: template,
        title,
      });
      if (!status.success) {
        setError(status.error || 'Failed to update locker item.');
        return;
      } else {
        toaster.success({
          title: 'Locker Item Saved',
          description: `The item "${title}" has been successfully saved in the locker.`,
          type: 'success',
        });
        setMode('read');
        router.push(`/locker/${locker}/item/${status.data.itemId}`);
      }
    } else {
      // Create a new locker item
      const status = await handleCreateLockerItem(locker, encryptedData, { category: template, title });
      if (!status.success) {
        setError(status.error || 'Failed to create locker item.');
        return;
      }
      toaster.success({
        title: 'Locker Item Created',
        description: `The item "${title}" has been successfully created in the locker.`,
        action: {
          label: 'View Item',
          onClick: () => router.push(`/locker/${locker}/item/${status.data.itemId}`),
        },
        type: 'success',
      });
      router.push(`/locker/${locker}/item/${status.data.itemId}`);
    }
  }

  React.useEffect(() => {
    if (highlightIndex === null || mode !== 'edit' || itemContent.length === 0) return;
    const timeoutId = setTimeout(() => {
      const element = document.getElementById(`field-row-${highlightIndex}`);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.warn(`Could not find field-row-${highlightIndex} to scroll to.`);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [highlightIndex, itemContent.length, mode]);

  return (
    <Card.Root variant="elevated" border="none" w="full" mx="auto" mb={8} position="relative">
      <form onSubmit={handleSubmit}>
        <Card.Header>
          <Flex gap={4} align="center">
            <Avatar.Root variant="subtle" rounded="sm" colorPalette="yellow" size="lg">
              <Avatar.Fallback fontSize="xl">{templateIcon(lockerItem?.item.category || 'new')}</Avatar.Fallback>
            </Avatar.Root>
            <Heading as="h1" size="2xl" fontFamily="heading" fontWeight="bolder" letterSpacing="tighter" flex={1}>
              {lockerItem?.item.title ?? 'Create New Item'}
            </Heading>
            {!!lockerItem?.id && (
              <Flex align="center" gap={2}>
                {mode === 'read' && (
                  <Button variant="outline" size="xs" colorPalette="yellow" onClick={() => setMode('edit')}>
                    <TbPencil />
                    Edit
                  </Button>
                )}
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <IconButton as="button" variant="ghost" aria-label="Menu" size="xs">
                      <TbDotsVertical />
                    </IconButton>
                  </Menu.Trigger>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value="edit" onClick={() => setMode(mode === 'edit' ? 'read' : 'edit')}>
                        {mode === 'read' ? (
                          <>
                            <TbPencil />
                            Enable Edits
                          </>
                        ) : (
                          <>
                            <TbPencilOff />
                            Disable Edits
                          </>
                        )}
                      </Menu.Item>

                      <Menu.Item value="share">
                        <TbShare />
                        Share
                      </Menu.Item>
                      <Menu.Separator />
                      <Menu.Item
                        value="delete"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeleteDialog(true);
                        }}
                        color="red.fg"
                        _hover={{ bg: 'red.subtle' }}
                      >
                        <TbTrash />
                        Delete
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
              </Flex>
            )}
          </Flex>
        </Card.Header>

        <Card.Body display="flex" flexDirection="column" gap={4}>
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <AlertContent>
                <Alert.Title>Problem Submitting Form</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </AlertContent>
            </Alert.Root>
          )}

          {mode === 'edit' ? (
            // Metadata
            <>
              <Field.Root required colorPalette="yellow">
                <Field.Label>
                  Title
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="text"
                  size="sm"
                  placeholder="Enter item name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />{' '}
              </Field.Root>

              <Field.Root required colorPalette="yellow">
                <Field.Label>
                  Locker
                  <Field.RequiredIndicator />
                </Field.Label>
                <Select.Root
                  ref={templateSelectRef}
                  multiple={false}
                  size="sm"
                  collection={lockerOptions}
                  value={lockerId ? [lockerId] : locker ? [locker] : []}
                  onValueChange={(e) => setLocker(e.value[0])}
                >
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select a locker" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                      <Select.ClearTrigger />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {lockerOptions.items.length === 0 && (
                        <Select.Item key="no-lockers" item={{ value: 'no-lockers', label: 'No lockers available' }}>
                          <Select.ItemText>No lockers available</Select.ItemText>
                        </Select.Item>
                      )}
                      {lockerOptions.items.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText>{option.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Field.Root>

              <Field.Root required colorPalette="yellow">
                <Field.Label>
                  Template
                  <Field.RequiredIndicator />
                </Field.Label>
                <Select.Root
                  size="sm"
                  collection={templateOptions}
                  value={template ? [template] : []}
                  onValueChange={(e) => {
                    handleTemplateChange(e.value[0]);
                  }}
                >
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select a template" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                      <Select.ClearTrigger />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      <Select.ItemGroup>
                        <Select.ItemGroupLabel>Choose a template</Select.ItemGroupLabel>
                        {templateOptions.items.map((option) => (
                          <Select.Item key={option.value} item={option}>
                            <Select.Indicator color="fg">{option.icon}</Select.Indicator>
                            <Select.ItemText>{option.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.ItemGroup>
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Field.Root>

              {/* Item Content */}
              <Box my={2}>
                <Flex align="center" justify="space-between" my={2}>
                  <Heading
                    as="h2"
                    size="md"
                    fontFamily="heading"
                    fontWeight="bold"
                    letterSpacing="tighter"
                    borderBottom="2px solid"
                    borderColor="yellow.muted"
                    pb={1}
                  >
                    Item Content
                  </Heading>
                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <IconButton variant="subtle" size="sm" colorPalette="yellow">
                        <TbPlus />
                      </IconButton>
                    </Menu.Trigger>

                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item
                          value="add-text-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'text' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbTypography />
                          Text Field
                        </Menu.Item>
                        <Menu.Item
                          value="add-password-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'password' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbPasswordUser />
                          Password Field
                        </Menu.Item>
                        <Menu.Item
                          value="add-number-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'number' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbNumber123 />
                          Number Field
                        </Menu.Item>
                        <Menu.Item
                          value="add-email-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'email' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbAt />
                          Email Field
                        </Menu.Item>
                        <Menu.Item
                          value="add-url-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'url' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbLink />
                          URL Field
                        </Menu.Item>
                        <Menu.Item
                          value="add-date-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'date' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbCalendarEvent />
                          Date Field
                        </Menu.Item>
                        <Menu.Item
                          value="add-time-field"
                          onClick={() => {
                            setItemContent([...itemContent, { label: 'New Field', value: '', type: 'time' }]);
                            setTemplate('custom');
                          }}
                        >
                          <TbClock />
                          Time Field
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Menu.Root>
                </Flex>

                <Text fontSize="sm" color="fg.muted">
                  Add fields to your item. Click the label above to edit the field label. Change the value settings with
                  the options menus.
                </Text>
              </Box>

              {/* Empty State */}
              {itemContent.length === 0 && (
                <EmptyState.Root border="1px dashed" borderColor="border" rounded="sm">
                  <VStack align="flex-start" gap={2}>
                    <EmptyState.Indicator justifyContent="flex-start">
                      <TbLayoutList />
                    </EmptyState.Indicator>
                    <EmptyState.Title>No Fields</EmptyState.Title>
                    <EmptyState.Description>
                      Add some fields to your item by clicking the plus button above or using the template options.
                    </EmptyState.Description>
                  </VStack>
                </EmptyState.Root>
              )}

              {itemContent.map((content, index) => (
                <Box
                  key={index}
                  id={`field-row-${index}`}
                  animation={highlightIndex === index ? `${highlightPulse} 3s ease-out` : 'none'}
                >
                  <Field.Root required={content.isRequired} colorPalette="yellow" rounded="sm">
                    <Field.Label>
                      <Editable.Root
                        value={content.label}
                        onValueChange={(v) => handleLabelChange(index, v.value)}
                        size="sm"
                        gap={0}
                      >
                        <Editable.Preview fontWeight="500" lineHeight="1.25rem" />
                        <Editable.Input placeholder="Click to Edit" />
                      </Editable.Root>
                      {content.isRequired && <Field.RequiredIndicator />}
                    </Field.Label>

                    {content.isMultiline ? (
                      <Group w="full" gap={2}>
                        <Textarea
                          placeholder="Field Value"
                          value={content.value}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                        />
                        <FieldMenu content={content} index={index} setItemContent={setItemContent} />
                      </Group>
                    ) : content.type === 'password' ? (
                      <PasswordField
                        content={content}
                        index={index}
                        setItemContent={setItemContent}
                        onChange={(value) => handleValueChange(index, value)}
                        onGeneratePassword={() => openPasswordGeneratorDialog(index)}
                      />
                    ) : content.type === 'number' ? (
                      <Group w="full" attached>
                        <NumberInput.Root
                          size="sm"
                          w="full"
                          flex={1}
                          value={content.value}
                          onValueChange={(value) => handleValueChange(index, value.value)}
                        >
                          <NumberInput.Control />
                          <NumberInput.Input placeholder="Enter a number" roundedRight="none" />
                        </NumberInput.Root>
                        <FieldMenu content={content} index={index} setItemContent={setItemContent} />
                      </Group>
                    ) : (
                      <Group w="full" attached>
                        <Input
                          size="sm"
                          placeholder="Field Value"
                          value={content.value}
                          type={content.type}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                        />
                        <FieldMenu content={content} index={index} setItemContent={setItemContent} />
                      </Group>
                    )}
                    {highlightIndex === index && (
                      <Field.HelperText fontSize="sm">
                        This is the field that was flagged by the Security Center.
                      </Field.HelperText>
                    )}
                  </Field.Root>
                </Box>
              ))}

              {lockerItem && (
                <DataList.Root orientation="horizontal" size="sm" mt={4}>
                  <DataList.Item display="flex" gap={2}>
                    <DataList.ItemLabel flex={1}>Integrity:</DataList.ItemLabel>
                    <DataList.ItemValue flex={1}>
                      <Badge colorPalette="green" variant="surface">
                        <TbRosetteDiscountCheck />
                        Verified
                      </Badge>
                      <Badge colorPalette="gray" variant="surface">
                        <TbLock />
                        AES-256-GCM
                      </Badge>
                    </DataList.ItemValue>
                  </DataList.Item>
                  <DataList.Item display="flex" gap={2}>
                    <DataList.ItemLabel flex={1}>Created At:</DataList.ItemLabel>
                    <DataList.ItemValue flex={1}>
                      {lockerItem.item.createdAt ? formatDate(lockerItem.item.createdAt) : 'N/A'}
                    </DataList.ItemValue>
                  </DataList.Item>
                  <DataList.Item display="flex" gap={2}>
                    <DataList.ItemLabel flex={1}>Last Updated:</DataList.ItemLabel>
                    <DataList.ItemValue flex={1}>
                      {lockerItem.item.updatedAt ? formatDate(lockerItem.item.updatedAt) : 'N/A'}
                    </DataList.ItemValue>
                  </DataList.Item>
                </DataList.Root>
              )}
            </>
          ) : (
            <LockerItemRead lockerItem={lockerItem} lockerName={lockerName} itemContent={itemContent} />
          )}
        </Card.Body>

        {mode === 'edit' && (
          <Card.Footer pt={4} zIndex={10}>
            <SimpleGrid w="full" columns={{ base: 1, md: 2 }} gap={{ base: 2, md: 4 }}>
              <Button type="button" variant="subtle" mr={2} onClick={() => router.back()}>
                <TbX />
                Cancel
              </Button>

              <Button type="submit" colorPalette="yellow" variant="solid">
                <TbDeviceFloppy />
                Save Item
              </Button>
            </SimpleGrid>
          </Card.Footer>
        )}
      </form>

      {lockerItem && (
        <DeleteLockerItemDialog
          open={showDeleteDialog}
          onOpenChange={(e) => setShowDeleteDialog(e.open ?? false)}
          lockerId={lockerId!}
          itemId={lockerItem!.item.id}
        />
      )}

      {passwordFieldIndex !== null && (
        <PasswordGeneratorDialog
          open={showPasswordGeneratorDialog}
          setOpen={(details) => setShowPasswordGeneratorDialog(!!details.open)}
          onSetSecret={(secret) => {
            console.log('Generated password:', passwordFieldIndex, secret);
            handleValueChange(passwordFieldIndex!, secret);
          }}
        />
      )}
    </Card.Root>
  );
}

const FieldMenu: React.FC<{
  content: ItemContent;
  index: number;
  setItemContent: React.Dispatch<React.SetStateAction<ItemContent[]>>;
}> = ({ content, index, setItemContent }) => {
  const toggleRequired = (index: number) => {
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, isRequired: !item.isRequired } : item)));
  };

  const toggleMultiline = (index: number) => {
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, isMultiline: !item.isMultiline } : item)));
  };

  const updateFieldType = (index: number, type: string) => {
    setItemContent((prev) => prev.map((item, i) => (i === index ? { ...item, type } : item)));
  };

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant="outline" colorPalette="gray" roundedLeft={0} size="sm" zIndex={0}>
          <TbDotsVertical />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner zIndex={100}>
          <Menu.Content zIndex={100} h="full" maxH="sm" overflowY="auto">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Field Options</Menu.ItemGroupLabel>
              <Menu.CheckboxItem
                checked={content.isRequired ?? false}
                value="required"
                onCheckedChange={() => toggleRequired(index)}
              >
                <TbAsteriskSimple />
                Required
                <Menu.ItemIndicator />
              </Menu.CheckboxItem>
              <Menu.CheckboxItem
                checked={content.isMultiline ?? false}
                value="multiline"
                onCheckedChange={() => toggleMultiline(index)}
              >
                <TbAlignJustified />
                Multiline
                <Menu.ItemIndicator />
              </Menu.CheckboxItem>
            </Menu.ItemGroup>
            <Menu.Separator />
            <Menu.RadioItemGroup
              value={content.type}
              onValueChange={(v) => {
                updateFieldType(index, v.value);
              }}
            >
              <Menu.ItemGroupLabel>Field Type</Menu.ItemGroupLabel>
              <Menu.RadioItem value="password">
                <TbEyeOff />
                Password
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              <Menu.RadioItem value="text">
                <TbTypography />
                Text
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              <Menu.RadioItem value="number">
                <TbNumber123 />
                Number
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              <Menu.RadioItem value="email">
                <TbAt />
                Email
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              <Menu.RadioItem value="url">
                <TbLink />
                URL
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              <Menu.RadioItem value="date">
                <TbCalendarEvent />
                Date
                <Menu.ItemIndicator />
              </Menu.RadioItem>
              <Menu.RadioItem value="time">
                <TbClock />
                Time
                <Menu.ItemIndicator />
              </Menu.RadioItem>
            </Menu.RadioItemGroup>
            <Menu.Separator />
            <Menu.Item value="copy" onClick={() => copyToClipboard(content.value)}>
              <TbCopy />
              Copy Value
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item
              value="delete"
              colorPalette="red"
              onClick={() => setItemContent((prev) => prev.filter((_, i) => i !== index))}
              _hover={{ bg: 'red.subtle' }}
            >
              <TbCircleMinus />
              Remove Field
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

const PasswordField: React.FC<{
  content: ItemContent;
  index: number;
  setItemContent: React.Dispatch<React.SetStateAction<ItemContent[]>>;
  onChange: (value: string) => void;
  onGeneratePassword: () => void;
}> = ({ content, index, setItemContent, onChange, onGeneratePassword }) => {
  const [show, setShow] = React.useState(false);
  const { score: strength, feedback } = React.useMemo(() => {
    return zxcvbn(content.value || '');
  }, [content.value]);

  const warning = feedback.warning;
  const suggestions = feedback.suggestions;

  return (
    <Collapsible.Root w="full" flex={1} open={show} onOpenChange={(v) => setShow(v.open)}>
      <Group attached w="full" alignItems="flex-start">
        <PasswordInput
          flex={1}
          size="sm"
          placeholder="Enter password"
          value={content.value}
          onChange={(e) => onChange(e.target.value)}
          roundedRight={0}
          onFocus={() => setShow(true)}
        />
        <Tooltip content="Generate Password">
          <IconButton
            variant="outline"
            colorPalette="gray"
            size="sm"
            rounded={0}
            zIndex={90}
            onClick={onGeneratePassword}
          >
            <TbRefresh />
          </IconButton>
        </Tooltip>
        <FieldMenu content={content} index={index} setItemContent={setItemContent} />
      </Group>
      <Collapsible.Content>
        <Card.Root mt={2} variant="subtle">
          <Card.Body p={2}>
            <Float placement="top-end" offset={4}>
              <CloseButton onClick={() => setShow(false)} size="xs" colorPalette="gray" />
            </Float>
            <Heading as="h3" size="sm" fontWeight="bold" mb={3}>
              Password Strength
            </Heading>
            <PasswordStrengthMeter max={4} value={strength} showLabel={false} mb={2} />
            {warning || suggestions.length > 0 ? (
              <List.Root pl={4} textStyle="sm">
                {warning && <List.Item color="red.fg">{warning}</List.Item>}
                {suggestions.map((item, index) => (
                  <List.Item key={index} color="fg.muted">
                    {item}
                  </List.Item>
                ))}
              </List.Root>
            ) : (
              <Text textStyle="xs" color="fg.muted">
                This is a strong password.
              </Text>
            )}
          </Card.Body>
        </Card.Root>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default LockerItemForm;
