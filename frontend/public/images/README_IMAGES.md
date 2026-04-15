# Manual Image Management

You can manually add any image file (.png, .jpg, .svg, .webp) to this folder.

To use them in your React components, simply reference them using the path starting with `/images/`.

### Example:
If you add a file named `wash-dry.png` to this folder:

```jsx
<img src="/images/wash-dry.png" alt="Wash and Dry" />
```

This works because Vite treats everything in the `public` folder as static assets that are served from the root.
