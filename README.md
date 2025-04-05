# Flex AI - Fitness Application

Flex AI is a mobile fitness application that provides personalized AI-powered workout and nutrition recommendations based on your preferences. The app helps users achieve their fitness goals by delivering tailored workout plans and nutrition guidance.

## Features

- **Personalized Workout Plans**: Generate customized workout routines based on your fitness goals, experience level, and available equipment
- **Nutrition Planning**: Create personalized meal plans and track your nutrition intake
- **Progress Tracking**: Monitor your fitness journey with comprehensive tracking tools
- **Mobile-Optimized**: Designed for seamless mobile experience with responsive UI components
- **AI-Powered**: Utilizes OpenAI API for generating intelligent, personalized fitness and nutrition content

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI, React Query
- **Backend**: Node.js, Express, PostgreSQL
- **AI Integration**: OpenAI API
- **Authentication**: Passport.js
- **Database ORM**: Drizzle ORM
- **Type Safety**: TypeScript, Zod

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- OpenAI API key

## Getting Started

1. Clone the repository
   ```
   git clone https://github.com/yourusername/flex-ai.git
   cd flex-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Initialize the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/hooks/`: Custom React hooks
  - `src/lib/`: Utility functions and API integrations
  - `src/pages/`: Application pages

- `server/`: Backend Express API
  - `routes.ts`: API endpoints
  - `storage.ts`: Database interactions
  - `db.ts`: Database connection

- `shared/`: Shared code between frontend and backend
  - `schema.ts`: Database schema and types

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for providing the AI capabilities
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework