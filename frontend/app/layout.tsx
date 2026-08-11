import './globals.css';
import React from 'react';

export const metadata = {
  title: 'LinguaForge — Chinese & English Learning OS',
  description: 'Dual-language platform for Pronunciation, Grammar, Dictionary, Flashcards, Quiz, Dialogues, and AI Voice Speaking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
