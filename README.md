# 🧊 Glacier - AI Coding Terminal

**Glacier** is a Cursor-like AI coding assistant with a clean, terminal interface. Chat with AI, manage GitHub repositories, and build applications with the power of AI.

> **From prompt to production** - The fastest way to code with AI agents

## ✨ Features

### 🎨 **UI Generator** (SuperDesign-inspired)
- Generate beautiful UI mockups from natural language
- Multiple style options: Modern, Minimal, Corporate, Creative
- Framework support: React, Vue, Svelte, Vanilla JS
- Copy code and download components

### 🧩 **Component Builder** (v0.app-inspired)
- Create reusable, well-documented components
- TypeScript support with proper interfaces
- Tailwind CSS styling
- Usage examples and documentation

### 🚀 **Full-Stack Apps** (Bolt.new-inspired)
- Generate complete applications with frontend and backend
- Multiple files: components, APIs, configs, database schemas
- Setup instructions and dependency management
- Download entire project structure

### 💬 **AI Chat** (Enhanced)
- Dual API support: LLM7 and GPT-OSS
- Model selection and reasoning control
- Real-time conversation with context awareness
- Provider and model information display

### 🐙 **GitHub Terminal** (Warp-inspired)
- Terminal-style interface with tabs and file management
- Direct GitHub repository creation and management
- Browse, edit, and commit files directly from the terminal
- Create pull requests and manage issues
- Clone repositories and run commands
- Full GitHub API integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI APIs**: LLM7, GPT-OSS
- **GitHub Integration**: Octokit, GitHub API
- **Terminal**: Custom terminal components with Warp-inspired design
- **Deployment**: Vercel-ready
- **Code Highlighting**: Monaco Editor, Syntax Highlighter

## 🚀 Getting Started

### Local Development

1. **Clone and install**:
```bash
git clone <your-repo>
cd glacier
npm install
```

2. **Run development server**:
```bash
npm run dev
```

3. **Open**: [http://localhost:3000](http://localhost:3000)

### Vercel Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial Glacier AI Coding Terminal"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables** (Optional):
   - `GITHUB_APP_ID`: Your GitHub App ID
   - `GITHUB_CLIENT_ID`: Your GitHub App Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub App Client Secret
   - `GITHUB_PRIVATE_KEY`: Your GitHub App Private Key
   - `GITHUB_WEBHOOK_SECRET`: Your GitHub App Webhook Secret

4. **Deploy**: Vercel will automatically deploy on every push to main

## 📁 Project Structure

```
glacier/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── chat/                # Chat endpoints (LLM7, GPT-OSS)
│   │   ├── generate/            # Generation endpoints (UI, Component, Full-Stack)
│   │   └── models/              # Models listing
│   ├── globals.css              # Tailwind + custom styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main interface
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx           # Animated button component
│   │   ├── Card.tsx             # Glass morphism card
│   │   ├── Input.tsx            # Form input component
│   │   └── Select.tsx           # Dropdown component
│   └── modes/                   # Mode-specific components
│       ├── ChatMode.tsx         # AI chat interface
│       ├── UIMode.tsx           # UI generation interface
│       ├── ComponentMode.tsx    # Component builder interface
│       └── FullStackMode.tsx    # Full-stack app generator
├── lib/                         # Core library
│   ├── types.ts                 # TypeScript interfaces
│   ├── ai-generator.ts          # AI generation logic
│   ├── llm7-client.ts           # LLM7 API client
├── tailwind.config.js           # Tailwind configuration
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

## 🔌 API Endpoints

### Chat APIs
- `POST /api/chat/llm7` - Chat with LLM7 models
- `GET /api/models` - Get available models

### Generation APIs
- `POST /api/generate/ui` - Generate UI components
- `POST /api/generate/component` - Generate reusable components
- `POST /api/generate/fullstack` - Generate full-stack applications

### GitHub APIs
- `GET /api/github/repos` - List user repositories
- `POST /api/github/repos` - Create new repository
- `GET /api/github/repos/[owner]/[repo]/contents` - Get repository contents
- `POST /api/github/repos/[owner]/[repo]/contents` - Create/update files
- `DELETE /api/github/repos/[owner]/[repo]/contents` - Delete files

## 🎯 Usage Examples

### UI Generation
```
Prompt: "Create a modern login form with email and password fields"
Style: Modern
Framework: React
```

### Component Building
```
Prompt: "Build a reusable button component with loading states"
Context: "Used across multiple forms and actions"
Framework: React + TypeScript
```

### Full-Stack Apps
```
Prompt: "Create a todo app with user authentication"
Requirements: "React frontend, Node.js backend, MongoDB database"
Framework: React + Next.js
```

### GitHub Integration
```
1. Authenticate with GitHub Personal Access Token
2. Create new repositories directly from the terminal
3. Browse and edit files in real-time
4. Generate code and push to GitHub
5. Create pull requests and manage issues
```

## 🌟 Key Features

### 🎨 **Terminal-First Design**
- Warp-inspired terminal interface
- Dark theme with GitHub-style colors
- Terminal tabs for file management
- Command-line interface simulation
- Smooth animations with Framer Motion

### ⚡ **Performance**
- Optimized bundle size
- Lazy loading
- Efficient state management
- Fast API responses

### 🔧 **Developer Experience**
- TypeScript throughout
- Comprehensive error handling
- Code syntax highlighting
- Copy/download functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🐙 GitHub App Setup

To enable full GitHub integration, you'll need to set up a GitHub App:

1. **Create GitHub App**: Follow the guide in [GITHUB_SETUP.md](./GITHUB_SETUP.md)
2. **Configure Environment Variables**: Add your GitHub App credentials
3. **Install the App**: Install on your repositories
4. **Start Coding**: Use the GitHub Terminal mode to manage repositories

## 🙏 Acknowledgments

- [Warp](https://www.warp.dev/) - Terminal interface inspiration and "from prompt to production" concept
- [SuperDesign](https://github.com/superdesigndev/superdesign) - UI generation inspiration
- [Bolt.new](https://github.com/stackblitz/bolt.new) - Full-stack app generation patterns
- [Chef](https://github.com/get-convex/chef) - Backend architecture inspiration
- [v0.app](https://v0.app) - Component generation patterns
- [LLM7](https://api.llm7.io) - AI API provider

---

**Built with ❤️ using Next.js, TypeScript, and AI**
