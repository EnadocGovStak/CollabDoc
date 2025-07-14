# How to Apply Targeted Focus Fixes for Aggressive Components

## Quick Reference Guide

### When to Use This Approach
✅ Third-party component steals focus  
✅ Component has accessible focus methods (focusIn, focus, etc.)  
✅ You need full component functionality  
✅ Performance is important  
✅ Simple integration preferred  

### When to Use iframe Isolation Instead
✅ Component has no accessible focus methods  
✅ Component completely bypasses DOM events  
✅ No way to override focus behavior  
✅ Security isolation needed  

## Step-by-Step Implementation

### Step 1: Identify Focus Methods (5 minutes)
```javascript
// Check what focus methods the component exposes
console.log(componentRef.current); // Look for focus, focusIn, etc.
```

### Step 2: Override Focus Methods (15 minutes)
```javascript
// Pattern for overriding focus stealing
const originalFocusIn = componentRef.current.focusIn;
componentRef.current.focusIn = function(...args) {
  // Only allow focus if user clicked inside component
  const isUserInitiated = containerRef.current?.contains(document.activeElement);
  
  if (isUserInitiated) {
    return originalFocusIn.apply(this, args);
  }
  console.log('Prevented focus stealing');
};
```

### Step 3: Add Container-Based Focus Control (10 minutes)
```javascript
// Add container ref and click handler
const containerRef = useRef(null);

const handleContainerClick = (e) => {
  if (containerRef.current?.contains(e.target)) {
    // Allow focus only when clicking inside
    setTimeout(() => {
      componentRef.current?.focusIn?.();
    }, 0);
  }
};

// In JSX:
<div ref={containerRef} onClick={handleContainerClick}>
  <ThirdPartyComponent ref={componentRef} />
</div>
```

### Step 4: Add CSS Focus Containment (5 minutes)
```css
.component-container {
  contain: focus;
  isolation: isolate;
  position: relative;
}

.component-container * {
  outline: none; /* Prevent automatic focus indicators */
}
```

### Step 5: Test Focus Behavior (5 minutes)
```javascript
// Test checklist:
// 1. Click sidebar elements → should retain focus
// 2. Click component → should focus component
// 3. Tab navigation → should work normally
// 4. Component features → should work fully
```

## Code Templates

### React Component Template
```javascript
import React, { useRef, useEffect, forwardRef } from 'react';

const FixedThirdPartyComponent = forwardRef((props, ref) => {
  const componentRef = useRef(null);
  const containerRef = useRef(null);
  
  // Override focus methods
  useEffect(() => {
    if (componentRef.current?.focusIn) {
      const originalFocusIn = componentRef.current.focusIn;
      componentRef.current.focusIn = function(...args) {
        const isUserInitiated = containerRef.current?.contains(document.activeElement);
        if (isUserInitiated) {
          return originalFocusIn.apply(this, args);
        }
      };
    }
  }, []);
  
  // Click-based focus control
  const handleClick = (e) => {
    if (containerRef.current?.contains(e.target)) {
      setTimeout(() => {
        componentRef.current?.focusIn?.();
      }, 0);
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="fixed-component-container"
      onClick={handleClick}
    >
      <ThirdPartyComponent ref={componentRef} {...props} />
    </div>
  );
});
```

### CSS Template
```css
.fixed-component-container {
  contain: focus;
  isolation: isolate;
  position: relative;
}

.fixed-component-container * {
  outline: none;
}
```

## Common Focus Methods to Override

### Document Editors
- `focusIn()` - Syncfusion DocumentEditor
- `focus()` - Standard components  
- `setFocus()` - Some custom components

### Rich Text Editors
- `focus()` - TinyMCE, CKEditor
- `focusEditor()` - Custom editors
- `activate()` - Some editor frameworks

### Form Components
- `focus()` - Standard input focus
- `show()` - Modal/popup components
- `open()` - Dropdown/select components

## Debugging Focus Issues

### Console Debugging
```javascript
// Add to component to track focus events
useEffect(() => {
  const logFocus = (e) => console.log('Focus event:', e.target);
  const logBlur = (e) => console.log('Blur event:', e.target);
  
  document.addEventListener('focus', logFocus, true);
  document.addEventListener('blur', logBlur, true);
  
  return () => {
    document.removeEventListener('focus', logFocus, true);
    document.removeEventListener('blur', logBlur, true);
  };
}, []);
```

### Focus Monitoring
```javascript
// Monitor when focus changes happen
useEffect(() => {
  const observer = new MutationObserver(() => {
    console.log('Active element:', document.activeElement);
  });
  
  observer.observe(document, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class', 'id']
  });
  
  return () => observer.disconnect();
}, []);
```

## Success Criteria

### ✅ Focus Control Working
- Sidebar elements retain focus when clicked
- Component only focuses when clicked directly
- Tab navigation works normally
- No unexpected focus jumping

### ✅ Component Functionality Preserved  
- All features work normally
- No performance degradation
- Event handling functions properly
- Styling remains intact

### ✅ Integration Stability
- No console errors
- State management works correctly
- Component lifecycle handled properly
- Memory leaks prevented

## Performance Benefits vs iframe

| Aspect | Targeted Fixes | iframe Isolation |
|--------|---------------|------------------|
| Load Time | ✅ Faster | ❌ Slower |
| Memory Usage | ✅ Lower | ❌ Higher |
| Communication | ✅ Direct | ❌ postMessage |
| Debugging | ✅ Standard | ❌ Complex |
| Maintenance | ✅ Simpler | ❌ More Complex |

## When Targeted Fixes Fail

### Fallback to iframe if:
- Component has no focus override points
- Focus behavior is completely internal
- Component bypasses all DOM events
- Security isolation is required
- Multiple instances cause conflicts

### Signs you need iframe isolation:
- Focus still stolen after overrides
- Component breaks when focus prevented
- No accessible focus methods
- Focus stealing happens at render time

## Maintenance Guidelines

### Regular Testing
- Test focus behavior after component updates
- Verify override methods still exist
- Check for new focus-related methods
- Monitor for behavioral changes

### Documentation
- Document which methods were overridden
- Note any component-specific quirks
- Keep track of version compatibility
- Update tests when component updates

### Version Management
- Test fixes with component updates
- Have fallback to iframe if fixes break
- Monitor for API changes
- Keep component version pinned if needed

## Conclusion

**Targeted focus fixes are preferred when possible** because they:
- Maintain full component functionality
- Provide better performance
- Simplify architecture
- Reduce complexity

**Use iframe isolation only when targeted fixes fail** or when complete isolation is required for security or compatibility reasons.

**Start with targeted fixes, escalate to iframe isolation if needed.**
