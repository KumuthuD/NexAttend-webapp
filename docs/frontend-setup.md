# Frontend Setup & Component Library Strategy (Yasitha - Day 1)

## 1. Tailwind CSS Setup Strategy
We will use Tailwind CSS with Vite.

### Installation Steps
1. **Install Dependencies**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure `tailwind.config.js`**
   ```javascript
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: '#3B82F6', // Blue-500
           secondary: '#64748B', // Slate-500
           success: '#22C55E', // Green-500
           danger: '#EF4444', // Red-500
           warning: '#F59E0B', // Amber-500
         }
       },
     },
     plugins: [],
   }
   ```

3. **Update `src/index.css`**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## 2. Component Library List
We will build a custom component library to ensure consistency across the application.

### Atoms (Basic Building Blocks)
- **Button**: Variants (primary, secondary, outline, danger), Sizes (sm, md, lg).
- **Input**: Text, password, email, number inputs with support for error states.
- **Label**: Standard form labels.
- **Badge**: Status indicators (e.g., "Present", "Absent", "Late").
- **Spinner**: Loading indicator.
- **Avatar**: User profile image with fallback initials.
- **Icon**: Wrapper for icon set (e.g., Lucide or Heroicons).

### Molecules (Composite Components)
- **FormField**: Label + Input + Error Message.
- **Alert**: Success/Error/Warning/Info notification banners.
- **Modal**: reusable dialog box with title, body, and action buttons.
- **Card**: Container with shadow and rounded corners.
- **StatsCard**: specialized card for dashboard metrics (Icon + Label + Value).
- **Breadcrumb**: Navigation path.

### Organisms (Complex Sections)
- **Navbar**: Top navigation bar with user profile dropdown.
- **Sidebar**: Side navigation with active state highlighting.
- **DataTable**: Table with sorting, filtering, and pagination.
- **WebcamCapture**: Wrapper around `react-webcam` or native `getUserMedia` with canvas overlay.
- **LoginForm**: Complete login form with validation.

### Templates (Layouts)
- **DashboardLayout**: Sidebar + Navbar + Main Content Area.
- **AuthLayout**: Centered box layout for Login/Register pages.

### Pages
- **HomePage**: Landing page.
- **LoginPage**: User authentication.
- **RegisterPage**: User sign-up (with face photo upload).
- **DashboardPage**: Main view for Teachers/Students.
- **ClassroomPage**: List of classes and students.
- **AttendancePage**: Live attendance taking view.
- **ReportsPage**: Historical data and stats.
