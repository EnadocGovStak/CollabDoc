# React Best Practices for Document Editing Applications

## Critical Issue: Cursor Reset Due to Callback Recreation

### Problem Description

One of the most common and frustrating issues in React document editing applications is when the cursor/caret position resets to the beginning of the document or form fields while the user is typing. This happens because React components re-render and lose focus/cursor position.

### Root Cause

The primary cause is **callback function recreation** on every render due to:

1. **Unstable dependencies** in `useCallback` hooks
2. **Frequent state updates** that trigger re-renders
3. **Object/array dependencies** that change reference on every render
4. **Props drilling** of unstable callbacks

### Example of Problematic Code

```javascript
// ❌ BAD - This callback gets recreated on every render
const handleContentChange = useCallback((content) => {
  setDocument(prev => ({
    ...prev,
    content,
    lastModified: new Date().toISOString()
  }));
}, [document]); // 'document' changes frequently, recreating callback

// ❌ BAD - Throttling inside callback with changing dependencies
const handleContentChange = useCallback((content) => {
  const now = Date.now();
  if (now - lastContentUpdate.current > 1000) {
    lastContentUpdate.current = now;
    // Update logic here
  }
}, [document, someOtherState]); // Multiple dependencies
```

### Correct Solution

```javascript
// ✅ GOOD - Stable callback with no dependencies
const handleContentChange = useCallback((content) => {
  if (content) {
    setDocument(prev => {
      // Use functional state updates to avoid dependencies
      if (prev?.recordsManagement?.isFinal === true) {
        return prev; // Don't update if document is final
      }
      
      return {
        ...prev,
        content,
        lastModified: new Date().toISOString()
      };
    });
  }
}, []); // Empty dependency array - callback never recreates
```

### Additional Optimization Techniques

#### 1. Content Deduplication in Child Components

```javascript
// ✅ Prevent unnecessary content reloading
const DocumentEditorDemo = ({ document, onContentChange }) => {
  const lastLoadedContentRef = useRef(null);
  
  const contentString = useMemo(() => {
    const content = document?.content || '';
    return typeof content === 'string' ? content : JSON.stringify(content);
  }, [document?.content]);
  
  useEffect(() => {
    // Only reload if content actually changed
    if (contentString === lastLoadedContentRef.current) {
      return;
    }
    
    // Load content logic here
    lastLoadedContentRef.current = contentString;
  }, [contentString]);
};
```

#### 2. Stable Memoization

```javascript
// ✅ Use useMemo for expensive calculations
const processedContent = useMemo(() => {
  if (!document?.content) return null;
  // Expensive content processing here
  return processContent(document.content);
}, [document?.content]); // Only specific property, not whole object
```

#### 3. Ref-based State for Frequently Changing Values

```javascript
// ✅ Use refs for values that change frequently but don't need to trigger re-renders
const lastSaveTimeRef = useRef(Date.now());
const isDirtyRef = useRef(false);

const handleContentChange = useCallback((content) => {
  isDirtyRef.current = true;
  // Update state without triggering unnecessary re-renders
  setDocument(prev => ({ ...prev, content }));
}, []);
```

### Document Editor Specific Best Practices

#### 1. Avoid Re-mounting Editor Components

```javascript
// ✅ Use stable keys and prevent unmounting
<DocumentEditor
  key={document?.id || 'new'} // Only changes when document ID changes
  onContentChange={stableCallback}
  isReadOnly={isReadOnly}
/>
```

#### 2. Separate Content Loading from Event Handling

```javascript
// ✅ Separate concerns - loading vs editing
const DocumentEditor = ({ initialContent, onContentChange }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load content once on mount
  useEffect(() => {
    if (initialContent && !isLoaded) {
      // Load content logic
      setIsLoaded(true);
    }
  }, [initialContent, isLoaded]);
  
  // Handle changes without reloading
  const handleChange = useCallback((content) => {
    onContentChange(content);
  }, [onContentChange]);
};
```

#### 3. Debounce State Updates, Not Callbacks

```javascript
// ✅ Debounce at the state level, not callback level
const [debouncedDocument, setDebouncedDocument] = useState(document);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedDocument(document);
  }, 500);
  
  return () => clearTimeout(timer);
}, [document]);
```

### Form Field Best Practices

#### 1. Stable Input Handlers

```javascript
// ✅ Stable handlers for form fields
const handleFieldChange = useCallback((field, value) => {
  setDocument(prev => ({
    ...prev,
    [field]: value
  }));
}, []);

// Usage
<input 
  value={document.title}
  onChange={(e) => handleFieldChange('title', e.target.value)}
/>
```

#### 2. Avoid Inline Object Creation

```javascript
// ❌ BAD - Creates new object on every render
<input 
  style={{ width: '100%', padding: '8px' }}
  onChange={handleChange}
/>

// ✅ GOOD - Define styles outside render
const inputStyle = { width: '100%', padding: '8px' };

<input 
  style={inputStyle}
  onChange={handleChange}
/>
```

### Testing for Cursor Reset Issues

1. **Manual Testing**:
   - Type rapidly in text fields
   - Type in the middle of existing text
   - Use arrow keys to navigate while typing
   - Test with multiple concurrent state updates

2. **React DevTools Profiler**:
   - Look for frequent re-renders during typing
   - Check if callbacks are being recreated
   - Monitor component mount/unmount cycles

3. **Console Logging**:
   ```javascript
   // Add logging to detect recreations
   const handleChange = useCallback((content) => {
     console.log('Callback executed:', Date.now());
     // Handler logic
   }, [deps]); // Monitor if this logs too frequently
   ```

### Common Antipatterns to Avoid

1. **Complex Dependencies in useCallback**:
   ```javascript
   // ❌ Avoid
   useCallback(fn, [obj.prop, array[0], computed.value])
   ```

2. **Inline Function Creation**:
   ```javascript
   // ❌ Avoid
   <Component onChange={(e) => setState(prev => ({ ...prev, value: e.target.value }))} />
   ```

3. **State Updates in Render**:
   ```javascript
   // ❌ Avoid
   if (someCondition) {
     setState(newValue); // This triggers infinite re-renders
   }
   ```

4. **Frequent Object/Array Recreations**:
   ```javascript
   // ❌ Avoid
   const config = { options: [...] }; // New array every render
   const style = { color: theme.primary }; // New object every render
   ```

### Performance Monitoring

Monitor these metrics to ensure optimal performance:

- **Component re-render frequency** during typing
- **Callback recreation count** per typing session
- **Time between keypress and screen update**
- **Memory usage** during extended editing sessions

### Conclusion

Cursor reset issues in React document editors are preventable with proper callback management and component design. The key principles are:

1. **Minimize callback dependencies**
2. **Use functional state updates**
3. **Prevent unnecessary component re-mounts**
4. **Separate concerns** between content loading and editing
5. **Test thoroughly** with real-world typing scenarios

Following these practices ensures a smooth editing experience for users and maintainable code for developers.
