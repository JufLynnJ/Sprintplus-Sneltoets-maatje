import React, { useState, useMemo } from 'react';
import { ShortcutItem, ShortcutCategory } from '../types';
import { SHORTCUT_CATEGORIES } from '../data/shortcuts';
import { speakDutchText } from '../utils/audio';
import { Search, Volume2, Printer, Play, ArrowRight, ExternalLink } from 'lucide-react';

interface CheatsheetModeProps {
  shortcuts: ShortcutItem[];
  onPracticeShortcut: (shortcut: ShortcutItem) => void;
}

export const CheatsheetMode: React.FC<CheatsheetModeProps> = ({
  shortcuts,
  onPracticeShortcut,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ShortcutCategory | 'Alles'>('Alles');

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter((item) => {
      const matchCat = activeCategory === 'Alles' || item.category === activeCategory;
      const matchSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.displayKeys.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tips.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [shortcuts, activeCategory, searchTerm]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<ShortcutCategory, ShortcutItem[]>();
    SHORTCUT_CATEGORIES.forEach((cat) => {
      const items = filteredShortcuts.filter((s) => s.category === cat);
      if (items.length > 0) {
        map.set(cat, items);
      }
    });
    return map;
  }, [filteredShortcuts]);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-extrabold text-blue-600 tracking-wider mb-1">
            Officiële Referentiegids
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            SprintPlus Sneltoetsen Spiekbrief
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gebaseerd op de officiële SprintPlus Snelstarters handleiding (SprintPlus 4 & online).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek sneltoets of actie..."
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Afdrukken</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveCategory('Alles')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'Alles'
              ? 'bg-[#202A76] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Alle ({shortcuts.length})
        </button>
        {SHORTCUT_CATEGORIES.map((cat) => {
          const isAct = activeCategory === cat;
          const count = shortcuts.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAct
                  ? 'bg-[#202A76] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Tables by Category */}
      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div
            key={category}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#202A76]">
                {category}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {items.length} sneltoetsen
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Sneltoets</th>
                    <th className="py-2.5 px-3">Actie</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Beschrijving</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">Tip / Versie</th>
                    <th className="py-2.5 px-3 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {items.map((shortcut) => (
                    <tr
                      key={shortcut.id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 inline-block shadow-xs">
                          {shortcut.displayKeys}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                        {shortcut.title}
                      </td>
                      <td className="py-3 px-3 text-slate-600 hidden sm:table-cell leading-relaxed">
                        {shortcut.description}
                      </td>
                      <td className="py-3 px-3 text-slate-500 hidden md:table-cell text-[11px]">
                        {shortcut.tips}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              speakDutchText(
                                `${shortcut.title}. De sneltoets is ${shortcut.displayKeys}. ${shortcut.description}`
                              )
                            }
                            title="Beluister"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPracticeShortcut(shortcut)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold transition-all text-xs cursor-pointer"
                          >
                            <span>Oefen</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
