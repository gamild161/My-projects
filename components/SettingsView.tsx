
import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, RefreshCw, ShieldAlert, CheckCircle, Info, User, Phone, DownloadCloud, MonitorSmartphone } from 'lucide-react';

interface SettingsViewProps {
  onResetAllData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onResetAllData }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleReset = () => {
    if (confirmText === 'مسح') {
      onResetAllData();
      setShowConfirmReset(false);
      setConfirmText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* قسم التثبيت والتحديثات */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-emerald-50/30">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MonitorSmartphone className="text-emerald-600" size={24} />
            تثبيت التطبيق والتحديثات
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              يمكنك تثبيت هذا التطبيق على سطح المكتب للوصول إليه بسرعة كالبرامج العادية (مثل الواتساب)، كما سيتم تحديثه تلقائياً عند توفر ميزات جديدة.
            </p>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
              >
                <DownloadCloud size={20} />
                تثبيت على الكمبيوتر الآن
              </button>
            )}
            {!deferredPrompt && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-500" />
                <span className="text-sm font-bold text-gray-500">التطبيق مثبت بالفعل أو المتصفح لا يدعم التثبيت المباشر</span>
              </div>
            )}
          </div>
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
             <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={18} className="text-blue-600 animate-spin-slow" />
                <h4 className="font-bold text-blue-800">التحديث التلقائي</h4>
             </div>
             <p className="text-xs text-blue-700 leading-relaxed">
               النظام مبرمج ليقوم بالفحص عن تحديثات في الخلفية. عند توفر ميزة جديدة، سيتم تطبيقها تلقائياً في المرة القادمة التي تشغل فيها التطبيق.
             </p>
          </div>
        </div>
      </div>

      {/* قسم إدارة البيانات */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={24} />
            إدارة البيانات والأمان
          </h3>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-xl bg-red-50 border border-red-100">
            <div className="space-y-1">
              <h4 className="font-bold text-red-800 text-lg">مسح كافة البيانات</h4>
              <p className="text-sm text-red-600 opacity-80">سيؤدي هذا الإجراء إلى حذف جميع المبيعات، المصروفات، الخصميات، والتقارير المؤرشفة بشكل نهائي.</p>
            </div>
            <button 
              onClick={() => setShowConfirmReset(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center gap-2 shrink-0"
            >
              <Trash2 size={20} />
              مسح شامل للجهاز
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <RefreshCw size={20} />
                </div>
                <h4 className="font-bold text-gray-800">النسخ الاحتياطي</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">يتم حفظ جميع بياناتك محلياً في متصفحك بشكل تلقائي وفوري.</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle size={14} />
                نظام الحفظ التلقائي نشط
              </div>
            </div>

            <div className="p-6 border border-gray-100 rounded-xl bg-blue-50/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Info size={20} />
                </div>
                <h4 className="font-bold text-gray-800">حول التطبيق</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <User size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-500">المطور:</span>
                  <span className="font-bold">جميل المزحاني</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone size={16} className="text-gray-400" />
                  <span className="font-medium text-gray-500">جوال:</span>
                  <a href="tel:0563637670" className="font-bold text-blue-600 hover:underline dir-ltr">0563637670</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border-4 border-red-100">
            <div className="bg-red-600 p-8 text-white text-center">
              <AlertTriangle size={64} className="mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-black">تحذير أمني شديد!</h3>
              <p className="text-red-100 mt-2">أنت على وشك تصفير النظام بالكامل. سيتم فقدان جميع السجلات المالية.</p>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-gray-600 text-center text-sm font-medium">
                لتأكيد الحذف، يرجى كتابة كلمة <span className="font-black text-red-600">"مسح"</span> في الحقل أدناه:
              </p>
              <input 
                type="text"
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full text-center px-4 py-4 rounded-2xl border-2 border-red-50 focus:border-red-500 outline-none text-2xl font-black text-red-600"
                placeholder="اكتب هنا..."
              />
              <div className="flex gap-4">
                <button 
                  onClick={handleReset}
                  disabled={confirmText !== 'مسح'}
                  className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-xl transition-all ${
                    confirmText === 'مسح' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  تأكيد المسح النهائي
                </button>
                <button 
                  onClick={() => {setShowConfirmReset(false); setConfirmText('');}}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
