import { Button, Dialog, IconButton, SimpleGrid } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import {
  TbBadge,
  TbBriefcase,
  TbBuildingBank,
  TbBuildingSkyscraper,
  TbCheck,
  TbCompass,
  TbHome,
  TbId,
  TbLockSquareRounded,
  TbPasswordFingerprint,
  TbPlane,
  TbSchool,
  TbWallet,
  TbX,
} from 'react-icons/tb';

export const VaultIconMap: Record<string, IconType> = {
  default: TbLockSquareRounded,
  home: TbHome,
  building: TbBuildingSkyscraper,
  bank: TbBuildingBank,
  briefcase: TbBriefcase,
  badge: TbBadge,
  password: TbPasswordFingerprint,
  school: TbSchool,
  plane: TbPlane,
  wallet: TbWallet,
  compass: TbCompass,
  id: TbId,
};

export default function IconPicker({
  selectedIcon,
  onIconChange,
}: {
  selectedIcon: string;
  onIconChange: (iconName: string) => void;
}) {
  return (
    <SimpleGrid columns={5} gap={2}>
      {Object.entries(VaultIconMap).map(([iconName, IconComponent]) => {
        const isSelected = selectedIcon === iconName;

        return (
          <IconButton
            key={iconName}
            aria-label={iconName}
            onClick={() => onIconChange(iconName)}
            variant={isSelected ? 'subtle' : 'ghost'}
            colorPalette={isSelected ? 'yellow' : 'gray'}
          >
            <IconComponent />
          </IconButton>
        );
      })}
    </SimpleGrid>
  );
}

export const IconPickerDialog = ({
  open,
  setOpen,
  selectedIcon,
  onIconChange,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedIcon: string;
  onIconChange: (iconName: string) => void;
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Positioner>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Pick an Icon</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <IconPicker selectedIcon={selectedIcon} onIconChange={onIconChange} />
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="subtle" colorPalette="gray">
                <TbX />
                Cancel
              </Button>
            </Dialog.ActionTrigger>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="yellow">
                <TbCheck />
                Select
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
