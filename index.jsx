import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Download, Scissors, Archive, X, Terminal, Cpu } from 'lucide-react';

// --- Custom Cyberpunk Styles & Keyframes ---
const injectStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

    :root {
      --bg: #000000;
      --fg: #ffffff;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: 'Space Mono', monospace;
      margin: 0;
      overflow-x: hidden;
    }

    /* CRT Overlay */
    .crt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      background-size: 100% 4px, 6px 100%;
      z-index: 50;
      pointer-events: none;
      opacity: 0.6;
    }

    /* Glitch Animations */
    @keyframes glitch-anim {
      0% { transform: translate(0) }
      20% { transform: translate(-2px, 2px) }
      40% { transform: translate(-2px, -2px) }
      60% { transform: translate(2px, 2px) }
      80% { transform: translate(2px, -2px) }
      100% { transform: translate(0) }
    }
    
    .glitch-hover:hover {
      animation: glitch-anim 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
      background-color: var(--fg);
      color: var(--bg);
    }

    /* Scanline Animation */
    @keyframes scan {
      0% { top: -10%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 110%; opacity: 0; }
    }
    .scanline {
      position: absolute;
      width: 100%;
      height: 4px;
      background: var(--fg);
      box-shadow: 0 0 15px var(--fg), 0 0 30px var(--fg);
      animation: scan 2s linear infinite;
      z-index: 10;
    }

    /* Blocky Button Transitions */
    .cyber-btn {
      position: relative;
      border: 1px solid var(--fg);
      text-transform: uppercase;
      letter-spacing: 2px;
      transition: all 0.1s;
      background: transparent;
      color: var(--fg);
      overflow: hidden;
    }
    
    .cyber-btn::before {
      content: '';
      position: absolute;
      top: 0; left: -100%; width: 100%; height: 100%;
      background: var(--fg);
      transition: all 0.2s ease;
      z-index: -1;
    }
    
    .cyber-btn:hover::before {
      left: 0;
    }
    .cyber-btn:hover {
      color: var(--bg);
      font-weight: bold;
    }

    /* Image Slice Transitions */
    .slice-container {
      transition: gap 0.8s cubic-bezier(0.8, 0, 0.2, 1);
    }
    .slice-container.sliced {
      gap: 1.5rem;
    }
    
    .slice-item {
      transition: transform 0.8s cubic-bezier(0.8, 0, 0.2, 1), opacity 0.5s;
    }
    
    .slice-item:hover {
      transform: scale(1.02);
      border-color: var(--fg);
      z-index: 10;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: var(--bg); border-left: 1px solid #333; }
    ::-webkit-scrollbar-thumb { background: var(--fg); }
  `;
  document.head.appendChild(style);
};

// --- Scrambler Effect Hook ---
const useScrambleText = (text) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = '!<>-_\\\\/[]{}—=+*^?#________';
  
  const scramble = useCallback(() => {
    let iteration = 0;
    const maxIterations = text.length;
    
    const interval = setInterval(() => {
      setDisplayText((prev) => 
        text.split('').map((letter, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      
      if (iteration >= maxIterations) clearInterval(interval);
      iteration += 1 / 3; 
    }, 30);
  }, [text]);

  useEffect(() => {
    scramble();
  }, [scramble]);

  return displayText;
};

// --- Main Application Component ---
export default function App() {
  const [image, setImage] = useState(null);
  const [slicedImages, setSlicedImages] = useState([]);
  const [status, setStatus] = useState('IDLE'); // IDLE, LOADED, PROCESSING, SLICED
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    injectStyles();
    // Dynamically load JSZip for ZIP creation
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg);
    if (duration) {
      setTimeout(() => setMessage(''), duration);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('ERROR: INVALID_FILE_TYPE');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setStatus('LOADED');
      setSlicedImages([]);
      showMessage('SYSTEM: IMAGE_LOADED_INTO_MEMORY');
    };
    reader.readAsDataURL(file);
  };

  const executeSplitProtocol = async () => {
    if (!image) return;
    setStatus('PROCESSING');
    showMessage('SYSTEM: EXECUTING_SPLIT_PROTOCOL', 0);

    // Artificial delay for aesthetic processing effect
    await new Promise(r => setTimeout(r, 2000));

    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      
      // Calculate exact heights to prevent sub-pixel rounding errors/gaps
      const h1 = Math.floor(naturalHeight / 3);
      const h2 = Math.floor(naturalHeight / 3);
      const h3 = naturalHeight - h1 - h2; // Remainder to ensure perfect height
      
      const heights = [h1, h2, h3];
      let currentY = 0;
      const parts = [];

      for (let i = 0; i < 3; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = heights[i];
        const ctx = canvas.getContext('2d');
        
        // Draw slice (image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(img, 0, currentY, naturalWidth, heights[i], 0, 0, naturalWidth, heights[i]);
        
        // Lossless PNG conversion
        parts.push(canvas.toDataURL('image/png', 1.0));
        currentY += heights[i];
      }

      setSlicedImages(parts);
      setStatus('SLICED');
      showMessage('SYSTEM: PROTOCOL_COMPLETE');
    };
    img.src = image;
  };

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage(`SYSTEM: DOWNLOADED_${filename.toUpperCase()}`);
  };

  const downloadZip = async () => {
    if (!window.JSZip) {
      showMessage('ERROR: JSZIP_MODULE_NOT_LOADED');
      return;
    }
    
    showMessage('SYSTEM: COMPILING_ARCHIVE', 0);
    const zip = new window.JSZip();
    
    slicedImages.forEach((dataUrl, i) => {
      const base64Data = dataUrl.split(',')[1];
      zip.file(`slice_${i + 1}.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'split_protocol_archive.zip';
    link.click();
    showMessage('SYSTEM: ARCHIVE_DOWNLOADED');
  };

  const resetSystem = () => {
    setImage(null);
    setSlicedImages([]);
    setStatus('IDLE');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showMessage('SYSTEM: RESET_SUCCESSFUL');
  };

  const HeaderText = useScrambleText('DIVIDE // CONQUER');

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative pb-24">
      <div className="crt-overlay pointer-events-none"></div>

      {/* System Toast Notification */}
      {message && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 border border-white bg-black px-4 py-2 text-sm z-50 animate-pulse uppercase tracking-widest flex items-center gap-2">
          <Terminal size={16} />
          {message}
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-end mb-8 border-b border-white/30 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase">{HeaderText}</h1>
          <p className="text-xs text-white/60 tracking-widest mt-2 uppercase">Image_Fragmentation_Utility_v1.0</p>
        </div>
        <div className="flex items-center gap-2 text-white/50 animate-pulse">
          <Cpu size={20} />
          <span className="text-xs tracking-widest">ONLINE</span>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
        
        {/* Left Column: Controls & Upload */}
        <div className="flex flex-col gap-6">
          
          {/* Status Box */}
          <div className="border border-white/20 p-4 bg-black/50 backdrop-blur-sm">
            <h3 className="text-xs text-white/50 tracking-widest mb-2">CURRENT_STATUS</h3>
            <div className="font-bold text-xl tracking-wider uppercase glitch-hover inline-block cursor-default">
              {status}
            </div>
          </div>

          {/* Upload Zone */}
          {status === 'IDLE' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/40 hover:border-white h-64 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Upload size={48} className="mb-4 text-white/60 group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
              <p className="tracking-widest text-sm text-center px-4 uppercase">
                Initialize Data Feed <br/>
                <span className="text-xs text-white/50">(Select 9:16 Image)</span>
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {/* Action Buttons */}
          {status === 'LOADED' && (
            <button 
              onClick={executeSplitProtocol}
              className="cyber-btn py-4 flex items-center justify-center gap-3 w-full text-lg group"
            >
              <Scissors size={24} className="group-hover:rotate-90 transition-transform duration-500" />
              Execute Split
            </button>
          )}

          {status === 'SLICED' && (
            <div className="flex flex-col gap-4 border border-white/30 p-6 bg-black">
              <h3 className="text-xs text-white/50 tracking-widest mb-2 border-b border-white/20 pb-2">DATA_EXTRACTION</h3>
              
              <button 
                onClick={downloadZip}
                className="cyber-btn py-3 px-4 flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Archive size={18} />
                  Download Complete Archive (ZIP)
                </span>
                <span className="text-xs opacity-50 group-hover:opacity-100">LOSSLESS</span>
              </button>
              
              <div className="h-px bg-white/20 my-2 w-full"></div>

              {slicedImages.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => downloadImage(slicedImages[i], `fragment_0${i+1}.png`)}
                  className="cyber-btn py-2 px-4 flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Download size={14} />
                    Extract Fragment {i + 1}
                  </span>
                  <span className="text-xs text-white/40">PNG</span>
                </button>
              ))}

              <button 
                onClick={resetSystem}
                className="mt-6 border border-white/20 text-white/50 hover:text-white hover:border-white py-2 text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              >
                <X size={14} /> Reset Protocol
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Visualizer */}
        <div className="border border-white/20 p-4 min-h-[600px] flex items-center justify-center bg-[#050505] relative overflow-hidden">
          
          <div className="absolute top-2 left-2 text-[10px] text-white/30 tracking-widest">VISUAL_OUTPUT_NODE</div>
          
          {/* Idle Grid Pattern */}
          {!image && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          )}

          {/* Image Display */}
          {image && (
            <div className={`relative w-full mx-auto flex flex-col md:flex-row justify-center items-start transition-all duration-700 ${status === 'SLICED' ? 'max-w-4xl gap-6 md:gap-12' : 'max-w-sm'}`}>
              
              {/* Original Image (Before) */}
              <div className={`relative overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-700 ${status === 'SLICED' ? 'w-full md:w-1/2 opacity-50 hover:opacity-100' : 'w-full'}`}>
                {status === 'PROCESSING' && <div className="scanline"></div>}
                
                <img src={image} alt="Target" className="w-full h-auto block object-contain filter grayscale hover:grayscale-0 transition-all duration-700" />
                
                {status === 'PROCESSING' && (
                   <div className="absolute inset-0 bg-white/10 animate-pulse mix-blend-overlay"></div>
                )}
                
                {status === 'SLICED' && (
                   <div className="absolute top-2 left-2 text-[10px] bg-black/80 px-2 py-1 border border-white/20 text-white tracking-widest uppercase shadow-lg backdrop-blur-sm">
                     SOURCE_FILE
                   </div>
                )}
              </div>

              {/* Sliced Fragments (After) */}
              {status === 'SLICED' && (
                <div className="flex flex-col w-full md:w-1/2 slice-container sliced">
                  {slicedImages.map((src, idx) => (
                    <div 
                      key={idx} 
                      className="w-full relative slice-item border border-white/30 bg-black cursor-crosshair overflow-hidden group"
                      style={{ transitionDelay: `${idx * 0.15}s` }}
                    >
                      <img src={src} alt={`Slice ${idx + 1}`} className="w-full h-auto block filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100" />
                      <div className="absolute top-2 right-2 text-[9px] bg-black/80 px-2 py-1 border border-white/20 text-white group-hover:bg-white group-hover:text-black transition-colors tracking-widest uppercase">
                        FRG_0{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
