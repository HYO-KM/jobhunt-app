import { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TaskIcon from '@mui/icons-material/ListAlt';
import NoteIcon from '@mui/icons-material/NoteAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
// ▼▼▼ アイコンを追加 ▼▼▼
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { useTheme } from '@mui/material/styles';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut, type User } from 'firebase/auth';
import { useColorMode } from '../context/ThemeContext';

const drawerWidth = 240;

const AppLayout = ({ user }: { user: User }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useColorMode();

  // スマホ用ドロワーの切り替え
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setIsDesktopOpen(!isDesktopOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" selected={location.pathname === '/'}>
            <ListItemIcon><TaskIcon /></ListItemIcon>
            <ListItemText primary="タスク管理" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/notes" selected={location.pathname.startsWith('/notes')}>
            <ListItemIcon><NoteIcon /></ListItemIcon>
            <ListItemText primary="企業メモ" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="ログアウト" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={colorMode.toggleColorMode}>
            <ListItemIcon>
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText primary="モード切替" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: isDesktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: isDesktopOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {/* スマホ用ハンバーガーメニュー */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDesktopDrawerToggle}
            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
          >
            {isDesktopOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div">
            就活タスク管理
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2">{user.email}</Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* スマホ用のドロワー（変更なし） */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="persistent" // ここを変更
          anchor="left"
          open={isDesktopOpen} // 開閉状態を紐付け
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* メインコンテンツエリア */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // ▼▼▼ サイドバーが開いている時だけ幅と余白を調整 ▼▼▼
          width: { sm: isDesktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: isDesktopOpen ? 0 : `-${drawerWidth}px` }, // persistentの場合はマージン調整が必要
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet context={{ user }} />
      </Box>
    </Box>
  );
};

export default AppLayout;