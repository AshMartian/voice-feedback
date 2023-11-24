import {
  ButtonStylesParams,
  MantineThemeOverride
} from '@mantine/core'

import { SettingsInterface } from '../store'

export const theme = (settings: SettingsInterface): MantineThemeOverride => ({
  colorScheme: 'dark',
  primaryColor: 'blue',
  defaultRadius: '2rem',
  components: {
    Text: {
      styles: {
        root: {
          cursor: 'default',
          userSelect: 'none'
        }
      }
    },
    Button: {
      styles: (theme, params: ButtonStylesParams) => ({
        root: {
          height: 'fit-content',
          borderRadius: '2rem',
          border: '2px solid transparent',
          padding: '0.8em 1.5em',
          lineHeight: 1.3,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'border-color 0.25s',
          '&:hover': {
            borderColor:
              params.color !== undefined && theme.colors[params.color] !== undefined && typeof theme.colors[params.color] === 'object'
                ? theme.colors[params.color][3]
                : theme.colors[settings.color][3]
          },
          borderColor: params.variant === 'filled' ? undefined : params.color !== undefined ? params.color : undefined,
          color: params.variant === 'filled' ? undefined : params.color !== undefined ? params.color : 'white',
          backgroundColor: '#1a1a1a'
          /* backgroundColor:
            params.variant === 'filled' && theme.colors
              ? theme.colors[params.color || theme.primaryColor || 'yellow'][7]
              : '#1a1a1a' */
        }
      })
    },
    Slider: {
      styles: {
        label: {
          marginTop: '-0.5em'
        }
      }
    },
    Modal: {
      styles: {
        body: {
          padding: '1.5em',
          paddingTop: '0.5em'
        }
      }
    },
    Switch: {
      styles: {
        root: {
          cursor: 'pointer'
        },
        thumb: {
          cursor: 'pointer'
        },
        track: {
          cursor: 'pointer'
        }
      }
    }
  }
})
