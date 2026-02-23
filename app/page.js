"use client";
import { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default function Home() {
  const [formData, setFormData] = useState({
    project_name: '', meeting_subject: '', date: '', participants: '',
    copies: '', meeting_type: '', recorder: '',
    summary_table: [{ id: 1, topic: '', essence: '', remarks: '' }],
    images: []
  });

  const [loading, setLoading] = useState(false);

  // הכתובת המעודכנת ששלחת
  const SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzLCE1rwcw-l3V0baj1pm1SRHd050EggJyfX_4wlZVryORkM7KGo-ME5mnoz8PViN7c/exec";

  const sendToSheets = async () => {
    try {
      await fetch(SHEETS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error("Sheets Error:", err);
    }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/generate', formData, { responseType: 'blob' });
      // שם קובץ: <שם הפרויקט> - <נושא הפגישה> <תאריך>
      const fileName = `${formData.project_name || 'פרויקט'} - ${formData.meeting_subject || 'פגישה'} ${formData.date || ''}.docx`;
      saveAs(res.data, fileName);

      await sendToSheets();
    } catch (err) { 
      alert("שגיאה בהפקה"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const updateRow = (index, field, value) => {
    const newTable = [...formData.summary_table];
    newTable[index][field] = value;
    setFormData({ ...formData, summary_table: newTable });
  };

  const addRow = () => {
    setFormData({ 
      ...formData, 
      summary_table: [...formData.summary_table, { id: formData.summary_table.length + 1, topic: '', essence: '', remarks: '' }] 
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-200">
        
        <div className="flex flex-col items-center mb-10 space-y-4">
          <img src="/hs.jpg" alt="Logo" className="h-20 w-auto object-contain shadow-sm rounded-lg" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 border-b-4 border-blue-600 pb-2 text-center">
            ח.ש קהילה - יצירת סיכום פגישה
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 text-right">
          {[
            { label: 'שם פרויקט', field: 'project_name' },
            { label: 'נושא פגישה', field: 'meeting_subject' },
            { label: 'תאריך', field: 'date', type: 'date' },
            { label: 'העתקים', field: 'copies' },
            { label: 'אופן פגישה', field: 'meeting_type' },
            { label: 'רשם', field: 'recorder' }
          ].map((item) => (
            <div key={item.field} className="flex flex-col">
              <label className="font-bold mb-1 text-gray-600 mr-1">{item.label}</label>
              <input 
                type={item.type || 'text'}
                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-gray-50 focus:bg-white text-right"
                onChange={e => setFormData({...formData, [item.field]: e.target.value})} 
              />
            </div>
          ))}
          <div className="col-span-1 md:col-span-2 flex flex-col font-bold">
            <label className="mb-1 text-gray-600 mr-1">משתתפים</label>
            <textarea 
              className="w-full border border-gray-300 p-3 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-gray-50 focus:bg-white text-right"
              onChange={e => setFormData({...formData, participants: e.target.value})} 
            />
          </div>
        </div>
        
        <h3 className="font-bold text-xl mb-6 text-blue-800 border-r-4 border-blue-600 pr-3">תוכן הפגישה</h3>
        
        <div className="space-y-4 mb-8">
          {formData.summary_table.map((row, i) => (
            <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-3 bg-blue-50/30 p-5 rounded-2xl border border-blue-100 shadow-sm relative">
              <div className="md:col-span-1 flex items-center justify-center bg-blue-600 text-white font-bold h-8 w-8 rounded-full shadow-md">
                {row.id}
              </div>
              <div className="md:col-span-3">
                <textarea rows="1" placeholder="נושא" className="w-full border border-gray-200 p-2 rounded-lg focus:bg-white outline-none shadow-inner text-right" onChange={e => updateRow(i, 'topic', e.target.value)} />
              </div>
              <div className="md:col-span-5">
                <textarea placeholder="מהות הסיכום" className="w-full border border-gray-200 p-2 rounded-lg focus:bg-white outline-none shadow-inner min-h-[80px] text-right" onChange={e => updateRow(i, 'essence', e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <textarea rows="1" placeholder="הערות" className="w-full border border-gray-200 p-2 rounded-lg focus:bg-white outline-none shadow-inner text-right" onChange={e => updateRow(i, 'remarks', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={addRow} className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-xl mb-10 hover:bg-blue-50 transition-all">
          + הוסף שורה חדשה לסיכום
        </button>
        
        <div className="bg-blue-600/5 p-6 rounded-2xl border-2 border-blue-600/10 mb-10">
          <label className="block font-bold text-blue-900 mb-3 text-lg">📸 צרוף תמונות לנספח</label>
          <input type="file" multiple accept="image/*" className="w-full cursor-pointer text-sm text-right" onChange={handleImageUpload} />
          {formData.images.length > 0 && <p className="mt-2 text-blue-600 font-bold">הועלו {formData.images.length} תמונות</p>}
        </div>

        <button 
          onClick={generate} 
          disabled={loading} 
          className={`w-full py-5 rounded-2xl font-black text-2xl shadow-xl transition-all transform active:scale-95 ${loading ? 'bg-gray-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-blue-300'}`}
        >
          {loading ? 'מעבד נתונים...' : 'ייצא דוח WORD'}
        </button>
      </div>
    </main>
  );
}
