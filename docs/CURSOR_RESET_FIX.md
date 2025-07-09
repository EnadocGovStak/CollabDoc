# Troubleshooting Guide: CollabDoc Cursor Reset Issue

## Issue Description
Users experience cursor/caret position reset to the beginning of text fields or document body while typing, making the application unusable for editing.

## Root Cause Analysis
The issue was caused by unstable callback functions in React components that were being recreated on every render, causing child components to re-render and lose focus/cursor position.

## Specific Problem Areas in CollabDoc

### 1. DocumentEditorPage.js - handleContentChange
**Problem**: The `handleContentChange` callback had dependencies that changed frequently:

```javascript
// ❌ BEFORE - Problematic code
const handleContentChange = useCallback((content) => {
  const now = Date.now();
  if (now - lastContentUpdate.current > 1000) {
    lastContentUpdate.current = now;
    // Update logic...
  }
}, [document]); // 'document' object changes frequently
```

**Solution**: Removed dependencies and throttling:

```javascript
// ✅ AFTER - Fixed code
const handleContentChange = useCallback((content) => {
  if (content) {
    setDocument(prev => {
      if (prev?.recordsManagement?.isFinal === true) {
        return prev;
      }
      return {
        ...prev,
        content,
        lastModified: new Date().toISOString()
      };
    });
  }
}, []); // No dependencies
```

### 2. DocumentEditorDemo.js - Content Loading
**Problem**: Content was being reloaded on every render even when unchanged:

```javascript
// ❌ BEFORE - Reloaded content unnecessarily
useEffect(() => {
  // Load content logic
}, [document, initialContent, isReadOnly]);
```

**Solution**: Added content deduplication and memoization:

```javascript
// ✅ AFTER - Only load when content actually changes
const contentString = useMemo(() => {
  let contentToLoad = null;
  if (document && document.content) {
    contentToLoad = document.content;
  } else if (initialContent) {
    contentToLoad = initialContent;
  }
  return typeof contentToLoad === 'string' ? contentToLoad : JSON.stringify(contentToLoad);
}, [document?.content, initialContent]);

const lastLoadedContentRef = useRef(null);

useEffect(() => {
  if (contentString === lastLoadedContentRef.current) {
    return; // Don't reload the same content
  }
  // Load content logic...
  lastLoadedContentRef.current = contentString;
}, [contentString, isReadOnly]);
```

## Files Modified

1. **frontend/src/pages/DocumentEditorPage.js**:
   - Stabilized `handleContentChange` callback
   - Removed `lastContentUpdate` ref and throttling logic
   - Used functional state updates to avoid dependencies

2. **frontend/src/components/DocumentEditorDemo.js**:
   - Added content deduplication with refs
   - Implemented memoized content string calculation
   - Prevented unnecessary content reloading
   - Added useMemo import

## Testing the Fix

### Manual Testing Checklist
- [ ] Type continuously in document body without cursor jumping
- [ ] Type in the middle of existing text in document body
- [ ] Edit title field without losing cursor position
- [ ] Edit records management fields without cursor reset
- [ ] Use arrow keys while typing
- [ ] Copy/paste text while editing
- [ ] Switch between fields rapidly
- [ ] Test with long documents (1000+ words)

### Performance Verification
- [ ] No excessive console warnings about re-renders
- [ ] Smooth typing experience with no lag
- [ ] React DevTools Profiler shows stable render patterns
- [ ] Memory usage remains stable during extended editing

## Prevention Guidelines

### For Future Development
1. **Always use empty dependency arrays** for content change handlers unless absolutely necessary
2. **Use functional state updates** instead of depending on current state
3. **Memoize expensive calculations** with useMemo
4. **Test typing experience** thoroughly before committing changes
5. **Monitor React DevTools** during development to catch re-render issues early

### Code Review Checklist
- [ ] Are useCallback dependencies minimal and stable?
- [ ] Are there any inline object/array creations in render?
- [ ] Do form handlers use functional state updates?
- [ ] Are expensive calculations memoized?
- [ ] Does the component prevent unnecessary re-mounts?

## Related Issues to Watch For

1. **Scroll position reset**: Similar to cursor reset but affects page scroll
2. **Focus loss**: Elements losing focus during typing
3. **Selection loss**: Text selection disappearing during updates
4. **Input lag**: Delayed response to typing due to excessive re-renders

## Emergency Rollback

If the cursor reset issue returns:

1. Check for new useCallback hooks with unstable dependencies
2. Look for direct state mutations in render functions
3. Verify that form handlers aren't being recreated
4. Check if any new props are causing component re-mounts

## Additional Resources

- [React Best Practices Documentation](./REACT_BEST_PRACTICES.md)
- [React useCallback Hook Documentation](https://react.dev/reference/react/useCallback)
- [React Profiler Guide](https://react.dev/learn/react-developer-tools#profiler)
