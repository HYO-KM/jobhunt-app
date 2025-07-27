import { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';

// テーマのモードと切り替え関数を保持するContextを作成
const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // OSのテーマ設定を検知
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

  // テーマ切り替え用の関数
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // modeの値に応じてMUIのテーマを生成
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* これが背景色などをテーマに合わせて自動調整してくれる */}
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

// 他のコンポーネントから簡単に切り替え関数を呼び出すためのカスタムフック
export const useColorMode = () => useContext(ColorModeContext);