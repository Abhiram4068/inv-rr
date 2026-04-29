import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import * as pdfjsLib from 'pdfjs-dist';
import { getFileMeta } from "../utils/fileIcons";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const PdfThumb = ({ fileUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!fileUrl || !canvasRef.current) return;
    let cancelled = false;

    const render = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        if (cancelled) return;
        const page = await pdf.getPage(2);
        if (cancelled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const viewport = page.getViewport({ scale: 0.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      } catch (e) {
        console.warn('PDF preview failed:', e);
      }
    };

    render();
    return () => { cancelled = true; };
  }, [fileUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-contain"
      style={{ background: '#fff' }}
    />
  );
};

const FileCard = ({ id, title, display_name, originalName, size, time, iconClass, isLink = false, fileUrl, contentType }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleStorageChange = () => setTheme(localStorage.getItem('theme') || 'dark');
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = localStorage.getItem('theme');
      if (current !== theme) setTheme(current);
    }, 100);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  const isDark = theme === 'dark';
const fileMeta = getFileMeta(contentType);

const PreviewArea = () => {
  if (fileMeta.category === "image" && fileUrl) {
    return (
      <img
        src={fileUrl}
        alt={title}
        className="w-full h-full object-cover absolute inset-0"
      />
    );
  }

  if (fileMeta.category === "pdf" && fileUrl) {
    return <PdfThumb fileUrl={fileUrl} />;
  }

  return null;
};

  const Content = (
    <>
      <div className={`h-[140px] flex items-center justify-center relative border-b transition-colors duration-300 overflow-hidden
        ${isDark ? 'bg-[#111] border-[#555]' : 'bg-slate-50 border-slate-100'}`}>

        <PreviewArea />

      {!fileMeta.canPreview && (
        <i
          className={`fa-solid ${fileMeta.icon} text-[40px] absolute z-10 group-hover:scale-110 transition-all`}
          style={{
    color: fileMeta.color,
    fontSize: "64px",
    transform: "rotate(-5deg)",
    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.4))"
  }}
        />
      )}
      </div>

      <div className="p-4">
        <span className={`block text-base font-bold truncate transition-colors
          ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {title || 'Untitled File'}
        </span>

        <span className={`block text-[12px] font-medium truncate mb-2
          ${isDark ? 'text-[#aaa]' : 'text-slate-500'}`}>
          {display_name}
        </span>

        <div className={`flex justify-between text-[12px] font-medium
          ${isDark ? 'text-[#808080]' : 'text-slate-400'}`}>
          <span>{size}</span>
          <span>{time}</span>
        </div>
      </div>
    </>
  );

  const containerClass = `rounded-lg overflow-hidden transition-all no-underline group cursor-pointer border
    ${isDark
      ? 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333] hover:-translate-y-1'
      : 'bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md hover:-translate-y-1'}`;

  return isLink ? (
    <Link to={`/file/${id}`} className={containerClass}>{Content}</Link>
  ) : (
    <div className={containerClass}>{Content}</div>
  );
};

export default FileCard;