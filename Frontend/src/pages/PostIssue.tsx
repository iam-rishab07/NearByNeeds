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

        setAddressText(`Your City Jurisdiction`);
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
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] text-[#111111] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="bg-glow top-0 left-0"></div>
      <div className="bg-glow bottom-0 right-0"></div>

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#666666] hover:text-[#111111] transition-colors text-sm font-bold w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </button>

        <div className="premium-card p-10 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold flex items-center gap-3 text-[#111111]">
              <Sparkles className="h-7 w-7 text-[#FFD21F]" /> Report a Local Civic Issue
            </h1>
            <p className="text-[#666666] text-sm leading-relaxed max-w-xl font-medium">
              Add details, upload photos, and geolocate the issue. Once verified by 5 other citizens, it escalates to municipal authorities.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest">Issue Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Large pothole near Central Library entrance"
                className="premium-input block w-full p-3.5 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue, its severity, and how it impacts traffic or local citizens..."
                className="premium-input block w-full p-3.5 text-sm resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="premium-input block w-full p-3.5 text-sm appearance-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Location Section */}
            <div className="bg-[#FAFAF8] p-6 border border-[#E8E8E8] rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h3 className="text-sm font-extrabold text-[#111111] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FFD21F]" /> Geolocation Coordinates
                </h3>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="bg-white hover:bg-[#F5F5F2] text-[#111111] border border-[#E8E8E8] text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition shadow-sm hover:border-[#FFD21F] disabled:opacity-50"
                >
                  <Navigation className={`h-4 w-4 text-[#FFD21F] ${locating ? 'animate-pulse' : ''}`} />
                  {locating ? 'Locating...' : 'Auto-detect Location'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[#666666] uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="18.5204"
                    className="premium-input block w-full p-3 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-[#666666] uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="73.8567"
                    className="premium-input block w-full p-3 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#666666] uppercase tracking-wider">Address Landmark</label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="e.g. Opposite CCD, Model Colony Road"
                  className="premium-input block w-full p-3 text-sm"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#666666] uppercase tracking-widest">Photo Evidence</label>
              
              <div className="flex items-center justify-center w-full">
                {filePreview ? (
                  <div className="w-full relative rounded-2xl border border-[#E8E8E8] overflow-hidden bg-[#F5F5F2] flex justify-center p-2">
                    <img 
                      src={filePreview} 
                      alt="Uploaded preview" 
                      className="max-h-72 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setFilePreview(''); }}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-md hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-[#E8E8E8] text-[#111111] transition-colors shadow-sm"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#E8E8E8] border-dashed rounded-2xl cursor-pointer bg-[#FAFAF8] hover:bg-[#F5F5F2] hover:border-[#FFD21F]/50 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-4 bg-white rounded-full mb-3 group-hover:bg-[#FFD21F]/10 border border-[#E8E8E8] transition-colors shadow-sm">
                        <ImageIcon className="w-8 h-8 text-[#666666] group-hover:text-[#FFD21F] transition-colors" />
                      </div>
                      <p className="mb-1 text-sm text-[#111111] font-bold">Click to upload photo evidence</p>
                      <p className="text-xs text-[#666666] font-medium tracking-wide">PNG, JPG or WEBP (Max 5MB)</p>
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
            <div className="pt-6 border-t border-[#E8E8E8]">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 text-sm btn-primary shadow-[0_4px_20px_rgba(255,210,31,0.25)] disabled:opacity-50 gap-2 items-center"
              >
                <Send className="h-5 w-5" />
                {loading ? 'Publishing report...' : 'Submit Issue & Start Voting'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
