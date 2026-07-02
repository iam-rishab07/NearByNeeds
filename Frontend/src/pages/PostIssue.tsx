import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Image as ImageIcon, Sparkles, Send, ArrowLeft, Navigation } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}



export const PostIssue: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);


  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [addressText, setAddressText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMasterData = async () => {
      try {


        // Mock load categories list
        const categoriesList = [
          { id: 1, name: 'Garbage' },
          { id: 2, name: 'Pothole' },
          { id: 3, name: 'Streetlight' },
          { id: 4, name: 'Water Leakage' },
          { id: 5, name: 'Illegal Construction' },
          { id: 6, name: 'Other' }
        ];
        setCategories(categoriesList);
        if (categoriesList.length > 0) {
          setCategoryId(categoriesList[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load wards/categories", err);
      }
    };
    fetchMasterData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Limit to 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Maximum file size is 5MB.");
        return;
      }
      
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setLocating(false);

        setAddressText(`Pune City Jurisdiction, Maharashtra`);
      },
      (err) => {
        console.error("Location error", err);
        setError("Failed to obtain location. Please enter coordinates manually.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError("Please upload at least one photo showing the issue.");
      return;
    }
    if (!latitude || !longitude) {
      setError("Coordinates are required. Use Auto-detect or input manually.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('addressText', addressText);
      formData.append('categoryId', categoryId);

      formData.append('file', file);

      await api.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to submit civic issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </button>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-emerald-400" /> Report a Local Civic Issue
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add details, upload photos, and geolocate the issue. Once verified by 5 other citizens, it escalates to ward authorities.
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Large pothole near Central Library entrance"
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 outline-none text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, its severity, and how it impacts traffic or local citizens..."
                className="bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 outline-none text-sm resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg block w-full p-3 outline-none text-sm"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Location Section */}
            <div className="bg-slate-950 p-5 border border-slate-850 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-400" /> Geolocation Coordinates
                </h3>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {locating ? 'Locating...' : 'Auto-detect Location'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="18.5204"
                    className="bg-slate-900 border border-slate-850 text-white rounded-lg block w-full p-2.5 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="73.8567"
                    className="bg-slate-900 border border-slate-850 text-white rounded-lg block w-full p-2.5 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Address Landmark</label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Opposite CCD, Model Colony Road"
                  className="bg-slate-900 border border-slate-850 text-white rounded-lg block w-full p-2.5 outline-none text-xs"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Photo Evidence</label>
              
              <div className="flex items-center justify-center w-full">
                {filePreview ? (
                  <div className="w-full relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex justify-center">
                    <img 
                      src={filePreview} 
                      alt="Uploaded preview" 
                      className="max-h-64 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setFilePreview(''); }}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 transition"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950 hover:bg-slate-900/40 hover:border-slate-700 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                      <p className="mb-1 text-xs text-slate-400 font-bold">Click to upload photo evidence</p>
                      <p className="text-[10px] text-slate-500">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-slate-900 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 disabled:opacity-50 gap-2 items-center"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Publishing report...' : 'Submit Issue & Start Voting'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
