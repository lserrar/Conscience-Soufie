// Design System - Conscience Soufie
export const theme = {
  colors: {
    // Primary
    primary: '#1c679f',
    primaryLight: 'rgba(28,103,159,0.15)',
    primaryShadow: 'rgba(28,103,159,0.10)',
    
    // Background
    background: '#f5f7fa',
    cardBackground: '#ffffff',
    
    // Text
    textPrimary: '#1a2a3a',
    textSecondary: '#7a92a8',
    textWhite: '#ffffff',
    
    // Accent
    gold: '#c9a96e',
    
    // Status
    success: '#28a745',
    warning: '#f0ad4e',
    error: '#dc3545',
  },
  
  shadows: {
    card: {
      shadowColor: '#1c679f',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    button: 24,
    full: 9999,
  },
  
  fonts: {
    title: 'CormorantGaramond_600SemiBold',
    titleBold: 'CormorantGaramond_700Bold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemiBold: 'Inter_600SemiBold',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export default theme;
