
# 🌍 GlobalTrotters — Travel Planning Web App

GlobalTrotters is a **full-stack travel planning application** built with **Next.js** and **Supabase**.  
It allows users to **create customized itineraries**, manage travel budgets, discover destinations, and share trips with friends or the public.

---

## 🚀 Tech Stack
- **Frontend & Backend:** [Next.js 14+](https://nextjs.org/) (App Router)
- **BaaS:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **Styling:** [TailwindCSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Charts:** [Chart.js](https://www.chartjs.org/) / [Recharts](https://recharts.org/)
- **Deployment:** [Vercel](https://vercel.com/)
- **Other:** Cloudinary (optional for image optimization), Day.js for date handling

---

## 📂 Project Structure
```
src/
  app/
    page.tsx                # Home Page
    dashboard/              # User dashboard
    trips/                   # Trip pages
      [id]/view/             # View trip details
      [id]/edit/             # Edit trip
    itinerary/[slug]/        # Public itinerary pages
  components/                # Reusable components
  lib/
    supabaseClient.ts        # Supabase client config
  styles/
    globals.css              # Global styles
.env.local                   # Environment variables
```

---

## 🔑 Features
- **User Authentication** — Email/password login & signup (Supabase Auth)
- **Trip Management** — Create, edit, delete trips
- **Itinerary Builder** — Add cities, activities, and dates
- **Budget Tracking** — Cost breakdowns with charts
- **Destination & Activity Search** — Search by filters
- **Public Itineraries** — Share trips via public links
- **Responsive Design** — Works on desktop and mobile

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/globaltrotters.git
cd globaltrotters
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the development server
```bash
npm run dev
```
Visit **http://localhost:3000** in your browser.

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

**users**
```
id (UUID, PK)
name
email
profile_photo_url
language_preference
role
created_at, updated_at
```

**trips**
```
id (UUID, PK)
user_id (FK → users.id)
trip_name
description
cover_photo_url
start_date
end_date
created_at, updated_at
```

**trip_cities**
```
id (UUID, PK)
trip_id (FK → trips.id)
city_name
country
cost_index
order_number
```

**activities**
```
id (UUID, PK)
trip_city_id (FK → trip_cities.id)
activity_name
type
cost
duration_hours
description
image_url
```

**budgets**
```
id (UUID, PK)
trip_id (FK → trips.id)
transport_cost
stay_cost
meal_cost
activity_cost
total_cost
```

**public_itineraries**
```
id (UUID, PK)
trip_id (FK → trips.id)
public_url
share_enabled
```

---

## 📦 Deployment
1. Push your repo to GitHub
2. Connect to [Vercel](https://vercel.com/)
3. Add environment variables in Vercel project settings
4. Deploy 🎉

---

## 📌 Roadmap
- [ ] Offline mode (PWA support)
- [ ] Real-time collaboration on trips
- [ ] AI-powered itinerary suggestions
- [ ] Multi-language support

---

## 🤝 Contributing
Pull requests are welcome! Please fork the repo and submit your changes via a PR.

---

## 📜 License
This project is licensed under the **MIT License**.
