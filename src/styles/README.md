# Styling and Design Tokens

This project uses **Tailwind CSS v4** alongside **ShadCN UI**. 

## Structure
- Global styles are located at `src/app/globals.css` using Tailwind v4 `@import` syntax.
- Theme configurations are handled via CSS custom properties (variables) defined in `:root` and `.dark` blocks in `src/app/globals.css`.
- Radii, shadows, and colors map directly to variables configured in `@theme inline` under `src/app/globals.css`.
