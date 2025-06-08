# Ayooya Movie App

A modern Netflix-style movie app built with React, Redux Toolkit, React Router, and TMDb API.

## Features
- Browse popular movies fetched from TMDb API
- Search movies by title
- Filter movies by genre
- Bookmark favorite movies
- View movie details in a modal
- User authentication with login and registration pages
- Language switcher (English/Arabic) with RTL support
- Responsive and modern UI inspired by Netflix

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

git clone https://github.com/ayaemx/ayooya-movie-app.git
cd movies-app

text

2. Install dependencies:

npm install
or
yarn install

text

3. Create a `.env` file in the project root and add your TMDb API key:

VITE_TMDB_API_KEY=your_tmdb_api_key_here

text

4. Start the development server:

npm run dev
or
yarn dev

text

5. Open your browser and go to `http://localhost:5173`.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build

## Dependencies

- React
- Redux Toolkit
- React Router DOM
- Material UI Icons
- react-spinners
- react-i18next

## Folder Structure

- `src/components` - Reusable components like Navbar, MovieCard, Loader, MovieModal
- `src/pages` - Page components like Home, Favorites, Login, Register
- `src/features` - Redux slices for movies, favorites, auth
- `src/api` - API helper functions

## Contributing

Contributions are welcome! Please open issues or pull requests.

## License

MIT License