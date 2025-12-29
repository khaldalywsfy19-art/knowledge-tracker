
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Library as LibraryIcon, 
  Lightbulb, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  BookOpen, 
  Hash, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  GripVertical, 
  Bell, 
  BellOff, 
  Search,
  Calendar
} from 'lucide-react';

// --- Types ---
enum PlanType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  type: PlanType;
  createdAt: number;
}

interface Benefit {
  id: string;
  content: string;
  pageNumber?: string;
  createdAt: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  pagesRead: number;
  totalPages: number;
  benefits: Benefit[];
  status: 'reading' | 'completed' | 'on_hold';
  completedAt?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
}

// --- Main App Component ---
export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'planning' | 'library' | 'book-details' | 'insights'>('dashboard');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Local Storage Persistence
  useEffect(() => {
    const savedBooks = localStorage.getItem('ka_books');
    const savedTasks = localStorage.getItem('ka_tasks');
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('ka_books', JSON.stringify(books));
    localStorage.setItem('ka_tasks', JSON.stringify(tasks));
  }, [books, tasks]);

  // --- Handlers ---
  const addBook = (title: string, author: string, totalPages: number) => {
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      author,
      totalPages,
      pagesRead: 0,
      benefits: [],
      status: 'reading'
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    if (selectedBookId === id) setCurrentView('library');
  };

  const addTask = (title: string, type: PlanType) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      type,
      isCompleted: false,
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addBenefit = (bookId: string, content: string, pageNumber: string) => {
    const newBenefit: Benefit = {
      id: crypto.randomUUID(),
      content,
      pageNumber,
      createdAt: Date.now()
    };
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, benefits: [newBenefit, ...b.benefits] } : b));
  };

  const reorderBenefits = (bookId: string, newBenefits: Benefit[]) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, benefits: newBenefits } : b));
  };

  const navigateToBook = (id: string) => {
    setSelectedBookId(id);
    setCurrentView('book-details');
  };

  // --- Views ---

  const DashboardView = () => {
    const stats = useMemo(() => ({
      totalBooks: books.length,
      completed: books.filter(b => b.status === 'completed').length,
      benefits: books.reduce((acc, b) => acc + b.benefits.length, 0),
      todayTasks: tasks.filter(t => t.type === PlanType.DAILY).length,
      completedTasks: tasks.filter(t => t.type === PlanType.DAILY && t.isCompleted).length
    }), [books, tasks]);

    return (
      <div className="space-y-8 p-4">
        <header>
          <h2 className="text-2xl font-bold text-slate-800">مرحباً بك في رحلتك المعرفية</h2>
          <p className="text-slate-500">لديك {stats.todayTasks - stats.completedTasks} مهام متبقية لليوم.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <BookOpen className="text-indigo-500 mb-2" size={24} />
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <div className="text-xs text-slate-400">إجمالي الكتب</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <CheckCircle2 className="text-green-500 mb-2" size={24} />
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs text-slate-400">كتب منجزة</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <Lightbulb className="text-amber-500 mb-2" size={24} />
            <div className="text-2xl font-bold">{stats.benefits}</div>
            <div className="text-xs text-slate-400">فائدة مستخلصة</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <CalendarRange className="text-blue-500 mb-2" size={24} />
            <div className="text-2xl font-bold">{stats.completedTasks}/{stats.todayTasks}</div>
            <div className="text-xs text-slate-400">مهام اليوم</div>
          </div>
        </div>

        {books.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold mb-4">أحدث الكتب قراءة</h3>
            <div className="space-y-4">
              {books.slice(0, 3).map(book => (
                <div key={book.id} onClick={() => navigateToBook(book.id)} className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="w-12 h-16 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{book.title}</div>
                    <div className="text-xs text-slate-400">{book.author}</div>
                    <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(book.pagesRead / book.totalPages) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PlanningView = () => {
    const [activeTab, setActiveTab] = useState<PlanType>(PlanType.DAILY);
    const [title, setTitle] = useState('');

    const filteredTasks = tasks.filter(t => t.type === activeTab);

    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">التخطيط</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[PlanType.DAILY, PlanType.WEEKLY, PlanType.MONTHLY].map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                {type === PlanType.DAILY ? 'يومي' : type === PlanType.WEEKLY ? 'أسبوعي' : 'شهري'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if(title.trim()) { addTask(title, activeTab); setTitle(''); } }} className="flex gap-2">
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="أضف مهمة جديدة..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700">
            <Plus size={24} />
          </button>
        </form>

        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 group">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                {task.isCompleted ? <CheckCircle className="text-green-500" /> : <Circle className="text-slate-300" />}
                <span className={`${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'} font-medium`}>{task.title}</span>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-slate-400">لا توجد مهام حالياً</div>
          )}
        </div>
      </div>
    );
  };

  const LibraryView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({ title: '', author: '', pages: '' });

    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">مكتبتي</h2>
          <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700">
            <Plus size={20} /> إضافة كتاب
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map(book => (
            <div key={book.id} onClick={() => navigateToBook(book.id)} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-16 h-24 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 shrink-0">
                <BookOpen size={32} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 line-clamp-1">{book.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{book.author}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${book.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {book.status === 'completed' ? 'منجز' : 'قيد القراءة'}
                  </span>
                  <span className="text-[10px] text-slate-400">{book.benefits.length} فوائد</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${(book.pagesRead / book.totalPages) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-xl font-bold mb-4">إضافة كتاب</h3>
              <div className="space-y-4">
                <input placeholder="اسم الكتاب" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input placeholder="المؤلف" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
                <input placeholder="عدد الصفحات" type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" value={form.pages} onChange={e => setForm({...form, pages: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={() => { addBook(form.title, form.author, Number(form.pages)); setIsAdding(false); setForm({title:'',author:'',pages:''}); }} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">حفظ</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const BookDetailsView = () => {
    const book = books.find(b => b.id === selectedBookId);
    if (!book) return <div>الكتاب غير موجود</div>;

    const [isAddingBenefit, setIsAddingBenefit] = useState(false);
    const [benefitContent, setBenefitContent] = useState('');
    const [page, setPage] = useState('');

    const handleUpdateProgress = (pages: number) => {
      const p = Math.min(Math.max(0, pages), book.totalPages);
      const isCompleted = p === book.totalPages;
      updateBook({
        ...book,
        pagesRead: p,
        status: isCompleted ? 'completed' : 'reading',
        completedAt: isCompleted ? (book.completedAt || Date.now()) : undefined
      });
    };

    const handleToggleReminder = () => {
      updateBook({ ...book, reminderEnabled: !book.reminderEnabled, reminderTime: book.reminderTime || '18:00' });
    };

    return (
      <div className="space-y-6 p-4">
        <button onClick={() => setCurrentView('library')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
          <ChevronRight size={18} /> العودة للمكتبة
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-32 h-44 bg-slate-50 rounded-xl mx-auto mb-4 flex items-center justify-center text-slate-300">
                <BookOpen size={48} />
              </div>
              <h2 className="text-xl font-bold text-center">{book.title}</h2>
              <p className="text-sm text-slate-500 text-center mb-6">{book.author}</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">التقدم</span>
                    <span className="font-bold">{book.pagesRead} / {book.totalPages} ص</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={book.totalPages} 
                    value={book.pagesRead} 
                    onChange={e => handleUpdateProgress(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">تذكير القراءة</span>
                    <button onClick={handleToggleReminder} className={`p-1 rounded-md ${book.reminderEnabled ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 bg-slate-50'}`}>
                      {book.reminderEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                    </button>
                  </div>
                  {book.reminderEnabled && (
                    <input 
                      type="time" 
                      value={book.reminderTime} 
                      onChange={e => updateBook({...book, reminderTime: e.target.value})}
                      className="w-full text-sm bg-slate-50 border border-slate-100 rounded-lg p-2 outline-none"
                    />
                  )}
                </div>

                {book.status === 'completed' && (
                  <div className="pt-4 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-400">تاريخ الإتمام</span>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mt-1">
                      <Calendar size={14} />
                      {new Date(book.completedAt!).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { if(confirm('حذف الكتاب؟')) deleteBook(book.id); }} className="w-full mt-6 text-red-400 hover:text-red-500 text-xs font-bold py-2 transition-colors">حذف الكتاب</button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">الفوائد المستخلصة</h3>
              <button onClick={() => setIsAddingBenefit(true)} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                + إضافة فائدة
              </button>
            </div>

            {isAddingBenefit && (
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2">
                <textarea 
                  placeholder="اكتب الفائدة هنا..." 
                  className="w-full h-24 bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-1 focus:ring-indigo-500 mb-2 text-sm"
                  value={benefitContent}
                  onChange={e => setBenefitContent(e.target.value)}
                />
                <div className="flex gap-2">
                  <input placeholder="الصفحة" className="w-20 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm outline-none" value={page} onChange={e => setPage(e.target.value)} />
                  <button onClick={() => { addBenefit(book.id, benefitContent, page); setBenefitContent(''); setPage(''); setIsAddingBenefit(false); }} className="flex-1 bg-indigo-600 text-white rounded-xl text-sm font-bold">حفظ</button>
                  <button onClick={() => setIsAddingBenefit(false)} className="px-4 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">إلغاء</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {book.benefits.map((b, idx) => (
                <div key={b.id} className="bg-white p-4 rounded-2xl border border-slate-100 group relative">
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">{b.content}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex gap-3">
                      {b.pageNumber && <span className="bg-slate-50 px-2 py-0.5 rounded font-bold">ص {b.pageNumber}</span>}
                      <span>{new Date(b.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <button 
                      onClick={() => { const nb = [...book.benefits]; nb.splice(idx, 1); reorderBenefits(book.id, nb); }}
                      className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {book.benefits.length === 0 && !isAddingBenefit && (
                <div className="text-center py-12 text-slate-300">ابدأ بتدوين فوائدك</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InsightsView = () => {
    const allBenefits = useMemo(() => {
      const list: { content: string; book: string; date: number; id: string }[] = [];
      books.forEach(b => {
        b.benefits.forEach(ben => list.push({ content: ben.content, book: b.title, date: ben.createdAt, id: ben.id }));
      });
      return list.sort((a, b) => b.date - a.date);
    }, [books]);

    return (
      <div className="space-y-6 p-4">
        <h2 className="text-2xl font-bold">بنك المعرفة</h2>
        <div className="space-y-4">
          {allBenefits.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-700 leading-relaxed mb-4">{item.content}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-600 font-bold">{item.book}</span>
                <span className="text-slate-400">{new Date(item.date).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          ))}
          {allBenefits.length === 0 && (
            <div className="text-center py-20 text-slate-300">لا توجد فوائد مسجلة حالياً</div>
          )}
        </div>
      </div>
    );
  };

  const ActiveView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'planning': return <PlanningView />;
      case 'library': return <LibraryView />;
      case 'book-details': return <BookDetailsView />;
      case 'insights': return <InsightsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto border-x border-slate-200 shadow-xl">
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <ActiveView />
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-3 px-2 z-50">
        <NavItem icon={<LayoutDashboard size={20} />} label="الرئيسية" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
        <NavItem icon={<CalendarRange size={20} />} label="التخطيط" active={currentView === 'planning'} onClick={() => setCurrentView('planning')} />
        <NavItem icon={<LibraryIcon size={20} />} label="المكتبة" active={currentView === 'library' || currentView === 'book-details'} onClick={() => setCurrentView('library')} />
        <NavItem icon={<Lightbulb size={20} />} label="الفوائد" active={currentView === 'insights'} onClick={() => setCurrentView('insights')} />
      </nav>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
