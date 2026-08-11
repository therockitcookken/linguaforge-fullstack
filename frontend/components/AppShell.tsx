'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, BookOpen, Brain, Languages, MessageCircle, Mic2, NotebookTabs, Sparkles, Zap, Flame, Globe
} from 'lucide-react';

import { useAppStore, LanguageMode } from '@/lib/store';
import { uiSound, soundEngine } from '@/lib/sound';
import Background3D from '@/components/Background3D';

import PronunciationModule from '@/components/modules/PronunciationModule';
import GrammarModule from '@/components/modules/GrammarModule';
import DictionaryModule from '@/components/modules/DictionaryModule';
import FlashcardsModule from '@/components/modules/FlashcardsModule';
import QuizModule from '@/components/modules/QuizModule';
import DialoguesModule from '@/components/modules/DialoguesModule';
import AISpeakingModule from '@/components/modules/AISpeakingModule';

const modules = [
  ['pronunciation', 'Phát âm', Volume2],
  ['grammar', 'Ngữ pháp', NotebookTabs],
  ['dictionary', 'Từ điển', BookOpen],
  ['flashcards', 'Flashcard', Brain],
  ['quiz', 'Quiz', Languages],
  ['dialogues', 'Hội thoại', MessageCircle],
  ['ai', 'Nói với AI', Mic2],
] as const;

export default function AppShell() {
  const {
    language,
    setLanguage,
    activeModule,
    setActiveModule,
    muted,
    setMuted,
    streakDays
  } = useAppStore();

  const handleSelectModule = (modId: string) => {
    uiSound('click');
    setActiveModule(modId);
  };

  const handleLanguageSwitch = (lang: LanguageMode) => {
    uiSound(lang === 'zh' ? 600 : 660);
    setLanguage(lang);
  };

  const toggleSoundMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (!nextMuted) uiSound('click');
  };

  return (
    <>
      <Background3D />

      <div className="shell">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div>
            <div className="brand">
              Lingua<span>Forge</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', letterSpacing: '0.5px' }}>
              LANGUAGE LEARNING OS
            </div>

            <nav className="nav">
              {modules.map(([id, label, Icon]) => (
                <button
                  key={id}
                  className={activeModule === id ? 'active' : ''}
                  onClick={() => handleSelectModule(id)}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="sidebar-footer">
            <button className="icon-btn" onClick={toggleSoundMute} title="Tắt/Mở Âm Thanh UI">
              {muted ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="#10b981" />}
            </button>

            <span style={{ fontSize: '12px', color: '#64748b' }}>v1.0.0 Production</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main">
          {/* Top Bar */}
          <div className="topbar">
            <div className="lang-switch">
              <button
                className={language === 'zh' ? 'active' : ''}
                onClick={() => handleLanguageSwitch('zh')}
              >
                <Globe size={16} /> 中文 (Pinyin + Việt)
              </button>
              <button
                className={language === 'en' ? 'active' : ''}
                onClick={() => handleLanguageSwitch('en')}
              >
                <Globe size={16} /> English (IPA + Việt)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="streak-badge">
                <Flame size={18} /> {streakDays} Ngày liên tục
              </div>
            </div>
          </div>

          {/* Module Content with Animated Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule + language}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {activeModule === 'pronunciation' && <PronunciationModule lang={language} />}
              {activeModule === 'grammar' && <GrammarModule lang={language} />}
              {activeModule === 'dictionary' && <DictionaryModule lang={language} />}
              {activeModule === 'flashcards' && <FlashcardsModule lang={language} />}
              {activeModule === 'quiz' && <QuizModule lang={language} />}
              {activeModule === 'dialogues' && <DialoguesModule lang={language} />}
              {activeModule === 'ai' && <AISpeakingModule lang={language} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
