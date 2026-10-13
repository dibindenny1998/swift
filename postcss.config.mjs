// Tailwind runs through the Turbopack loader in next.config.mjs. Hosts whose Linux is too old for
// Turbopack's native binary build with webpack instead (`npm run build:hosted`), which needs PostCSS.
const config = {
  plugins: process.env.TAILWIND_POSTCSS === "1" ? { "@tailwindcss/postcss": {} } : {},
};

export default config;
