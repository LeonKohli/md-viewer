# Nuxt Shadcn Boilerplate

[![Nuxt Logo](https://nuxt.com/assets/design-kit/logo-green-white.svg)](https://nuxt.com)

**A modern, production-ready Nuxt 3 boilerplate with shadcn-vue, Tailwind CSS, VueUse, color mode, and SEO optimization.**

This boilerplate provides a solid foundation for building modern web applications with the latest technologies and best practices.

---

## ✨ Features

- **🚀 Nuxt 3** - The intuitive Vue framework with server-side rendering, auto-imports, and file-based routing
- **🎨 shadcn-vue** - Beautiful, accessible components built with Reka UI and styled with Tailwind CSS
- **💨 Tailwind CSS v4** - Utility-first CSS framework for rapid UI development
- **🔧 VueUse** - Collection of essential Vue composition utilities
- **🌙 Color Mode** - Built-in dark/light mode support with smooth transitions
- **📱 Responsive Design** - Mobile-first approach with modern design patterns
- **🔍 SEO Optimized** - Pre-configured SEO settings with meta tags and Open Graph
- **⚡ Icons** - Nuxt Icon with Lucide Icons for beautiful iconography
- **📦 TypeScript** - Full TypeScript support with auto-generated types
- **🎯 Developer Experience** - ESLint, auto-imports, and excellent DX

## 🛠️ Tech Stack

- **Framework:** [Nuxt.js 3](https://nuxt.com)
- **UI Components:** [shadcn-vue](https://www.shadcn-vue.com/) (via [Reka UI](https://www.reka-ui.com/))
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Nuxt Icon](https://nuxt.com/modules/icon) with [Lucide Icons](https://lucide.dev/)
- **Utilities:** [VueUse](https://vueuse.org/)
- **Package Manager:** [Bun](https://bun.sh/) (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

1. **Clone or use this template:**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd nuxt-shadcn-boilerplate
   
   # Or use as template on GitHub
   ```

2. **Install dependencies:**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Using npm
   npm install
   
   # Using pnpm
   pnpm install
   
   # Using yarn
   yarn install
   ```

3. **Start development server:**
   ```bash
   # Using Bun
   bun run dev
   
   # Using npm
   npm run dev
   
   # Using pnpm
   pnpm dev
   
   # Using yarn
   yarn dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to see your application running.

## 📁 Project Structure

```
nuxt-shadcn-boilerplate/
├── app/
│   ├── assets/css/          # Global styles and Tailwind CSS
│   ├── components/          # Vue components
│   │   └── ui/             # shadcn-vue components
│   ├── composables/        # Vue composables
│   ├── layouts/            # Nuxt layouts
│   ├── pages/              # File-based routing
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── server/                 # Server-side code
├── types/                  # TypeScript type definitions
├── components.json         # shadcn-vue configuration
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
```

## 🎨 Customization

### Adding Components

This boilerplate uses shadcn-vue components. To add new components:

```bash
# Add a new component (example: alert)
bunx shadcn-vue@latest add alert
```

### Styling

- Global styles are in `app/assets/css/main.css`
- Component styles use Tailwind CSS classes
- Dark/light mode is handled automatically

### Configuration

- **Nuxt config:** `nuxt.config.ts`
- **Tailwind config:** Inline in `app/assets/css/main.css`
- **TypeScript config:** `tsconfig.json`
- **shadcn-vue config:** `components.json`


## 🏗️ Building for Production

```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Generate static site
bun run generate
```

## 📦 Deployment

This boilerplate can be deployed to various platforms:

- **Vercel:** Connect your GitHub repository
- **Netlify:** Deploy with git integration
- **Cloudflare Pages:** Connect your repository
- **Static hosting:** Use `bun run generate` for static sites

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more deployment options.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🚀**
