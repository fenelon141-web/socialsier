import React, { ReactElement, cloneElement } from 'react';

interface IOSTouchWrapperProps {
  children: ReactElement;
  highlightColor?: string;
  scaleOnPress?: boolean;
  preventCallout?: boolean;
  className?: string;
}

/**
 * iOS Touch Wrapper Component
 * Ensures all wrapped interactive elements meet Apple App Store compliance
 * for touch interactions and accessibility
 */
export default function IOSTouchWrapper({
  children,
  highlightColor = 'rgba(236, 72, 153, 0.3)',
  scaleOnPress = true,
  preventCallout = true,
  className = ''
}: IOSTouchWrapperProps) {
  const iosStyles = {
    WebkitTapHighlightColor: highlightColor,
    WebkitTouchCallout: preventCallout ? 'none' : 'default',
    WebkitUserSelect: 'none',
    userSelect: 'none' as const,
    touchAction: 'manipulation' as const,
    minHeight: '44px',
    minWidth: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: scaleOnPress ? 'transform 0.1s ease-out' : undefined,
  };

  const enhancedClassName = `${className} ${scaleOnPress ? 'active:scale-98' : ''}`.trim();

  return cloneElement(children, {
    style: { ...iosStyles, ...children.props.style },
    className: `${children.props.className || ''} ${enhancedClassName}`.trim(),
    'data-ios-optimized': 'true'
  });
}

// Pre-configured variants for common use cases
export const IOSButton = ({ children, ...props }: Omit<IOSTouchWrapperProps, 'children'> & { children: ReactElement }) => (
  <IOSTouchWrapper {...props}>
    {children}
  </IOSTouchWrapper>
);

export const IOSNavItem = ({ children, ...props }: Omit<IOSTouchWrapperProps, 'children' | 'scaleOnPress'> & { children: ReactElement }) => (
  <IOSTouchWrapper {...props} scaleOnPress={false}>
    {cloneElement(children, {
      style: { 
        minHeight: '48px', 
        minWidth: '48px', 
        padding: '12px',
        ...children.props.style 
      }
    })}
  </IOSTouchWrapper>
);

export const IOSCard = ({ children, ...props }: Omit<IOSTouchWrapperProps, 'children'> & { children: ReactElement }) => (
  <IOSTouchWrapper 
    {...props} 
    highlightColor="rgba(236, 72, 153, 0.1)"
    scaleOnPress={true}
  >
    {cloneElement(children, {
      style: { 
        cursor: 'pointer',
        ...children.props.style 
      }
    })}
  </IOSTouchWrapper>
);