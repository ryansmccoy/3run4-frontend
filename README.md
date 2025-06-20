# 3run4-frontend

A digital stamp card and admin dashboard for the 3run4 running club.  
This app allows users to track their stamps, claim prizes, and lets admins manage users, prizes, and run raffles.

---

## Features

### For Users
- **Digital Stamp Card:** Track your stamps online.
- **Prize Tiers:** See what prizes you can earn for different stamp milestones.
- **Add Stamps:** Add a stamp each time you participate.
- **First-Time Setup:** Import your existing paper card stamp count.
- **Mobile Friendly:** Works on phones and desktops.

### For Admins
- **Admin Login:** Secure access for club admins.
- **User Management:** View all users, their stamps, and last participation.
- **Prize Management:** Add, edit, or remove prize tiers for different stamp counts.
- **Raffle Picker:** Randomly select a winner from eligible users each week.
- **Export CSV:** Download user data for reporting.
- **Leaderboard:** See top streaks (if enabled in backend).

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-org/3run4-frontend.git
   cd 3run4-frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm start
   # or
   yarn start
   ```

4. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

---

## Usage

### User View

- Enter your name to log in.
- If new, enter your initial stamp count.
- See your digital stamp card and available prizes.
- Add stamps as you participate.

### Admin View

- Go to `/admin` (e.g., [http://localhost:3000/admin](http://localhost:3000/admin))
- Login with the admin credentials (default: `admin` / `3run4`).
- Manage users, prizes, and run raffles.

---

## Configuration

- **API Endpoint:**  
  The backend API URL is set in `src/App.js` as `API_URL`.  
  Update this if your backend endpoint changes.

- **Admin Credentials:**  
  Default credentials are hardcoded for demo purposes.  
  Change them in `src/App.js` for production.

---

## Project Structure

```
src/
  App.js         # Main React app and routing
  3run4-logo.png # Logo image
  ...
public/
  index.html
README.md
```

---

## Deployment

You can deploy this app to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)  
Build the app with:

```sh
npm run build
# or
yarn build
```

Then upload the `build/` directory to your hosting provider.

---

## Contributing

Pull requests are welcome!  
Please open an issue first to discuss major changes.

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- Built with [React](https://react.dev/)
- Inspired by the 3run4 running club community