import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { Card, Spinner } from '@/shared/ui';
import { useConfirm } from '@/shared/lib';
import { useConfigsQuery, useDeleteConfigMutation, useDownloadConfigMutation } from '@/entities/config';

export function ConfigList() {
  const { data, isLoading } = useConfigsQuery();
  const deleteMutation = useDeleteConfigMutation();
  const downloadMutation = useDownloadConfigMutation();
  const { openConfirm } = useConfirm();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [selectedConfigName, setSelectedConfigName] = useState<string>('');

  const configs = data?.configs || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string, name: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedConfigId(id);
    setSelectedConfigName(name);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = () => {
    downloadMutation.mutate({ id: selectedConfigId, name: selectedConfigName });
    handleMenuClose();
  };

  const handleDelete = () => {
    openConfirm(
      'Удаление конфига',
      'Вы уверены, что хотите удалить этот конфиг?',
      () => deleteMutation.mutate(selectedConfigId)
    );
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">Нет конфигов</h3>
          <p className="text-gray-600">
            Создайте свой первый конфиг для использования VPN
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {configs.map((config) => (
          <Card key={config.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">{config.name}</h3>
                <div className="text-xs text-gray-600">
                  <span>
                    {new Date(config.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
              <IconButton
                onClick={(e) => handleMenuOpen(e, config.id, config.name)}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleDownload} disabled={downloadMutation.isPending}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Скачать</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Удалить</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
