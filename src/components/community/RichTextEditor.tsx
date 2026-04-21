'use client';

import React from 'react';
import { Bold, Type, Palette, Minus, Plus } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FONT_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Gray', value: '#4B5563' },
  { label: 'Red', value: '#DC2626' },
  { label: 'Orange', value: '#EA580C' },
  { label: 'Green', value: '#16A34A' },
  { label: 'Blue', value: '#2563EB' },
  { label: 'Purple', value: '#9333EA' },
  { label: 'Pink', value: '#DB2777' },
];

const FONT_SIZES = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '4' },
  { label: 'X-Large', value: '5' },
  { label: 'XX-Large', value: '6' },
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showSizePicker, setShowSizePicker] = React.useState(false);
  const [isBold, setIsBold] = React.useState(false);
  const colorPickerRef = React.useRef<HTMLDivElement>(null);
  const sizePickerRef = React.useRef<HTMLDivElement>(null);
  const isInternalUpdate = React.useRef(false);

  // Sync external value into editor only on initial mount
  React.useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Close pickers on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (sizePickerRef.current && !sizePickerRef.current.contains(e.target as Node)) {
        setShowSizePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateToolbarState();
    handleInput();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
  };

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyUp = () => {
    updateToolbarState();
  };

  const handleMouseUp = () => {
    updateToolbarState();
  };

  const handleBold = () => execCommand('bold');

  const handleColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleFontSize = (size: string) => {
    execCommand('fontSize', size);
    setShowSizePicker(false);
  };

  const increaseFontSize = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentEl = range.commonAncestorContainer.parentElement;
      const currentFont = parentEl?.closest('font');
      const currentSize = currentFont?.getAttribute('size') || '3';
      const newSize = Math.min(parseInt(currentSize) + 1, 7).toString();
      execCommand('fontSize', newSize);
    } else {
      execCommand('fontSize', '4');
    }
  };

  const decreaseFontSize = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentEl = range.commonAncestorContainer.parentElement;
      const currentFont = parentEl?.closest('font');
      const currentSize = currentFont?.getAttribute('size') || '3';
      const newSize = Math.max(parseInt(currentSize) - 1, 1).toString();
      execCommand('fontSize', newSize);
    } else {
      execCommand('fontSize', '2');
    }
  };

  return (
    <div className="rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border-b border-gray-300 dark:border-slate-600 flex-wrap">
        {/* Bold */}
        <button
          type="button"
          onClick={handleBold}
          title="Bold (Ctrl+B)"
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${
            isBold
              ? 'bg-gray-200 dark:bg-slate-600 text-blue-600'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <Bold size={16} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-slate-500 mx-1" />

        {/* Font Size Controls */}
        <button
          type="button"
          onClick={decreaseFontSize}
          title="Decrease font size"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
        >
          <Minus size={14} />
        </button>

        <div className="relative" ref={sizePickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowSizePicker(!showSizePicker);
              setShowColorPicker(false);
            }}
            title="Font size"
            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300 text-sm"
          >
            <Type size={16} />
            <span className="text-xs">Size</span>
          </button>
          {showSizePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 py-1 z-50 min-w-30">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => handleFontSize(size.value)}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={increaseFontSize}
          title="Increase font size"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
        >
          <Plus size={14} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 dark:bg-slate-500 mx-1" />

        {/* Color Picker */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowSizePicker(false);
            }}
            title="Font color"
            className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Palette size={16} />
            <span className="text-xs">Color</span>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 p-2 z-50">
              <div className="grid grid-cols-4 gap-1.5">
                {FONT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColor(color.value)}
                    title={color.label}
                    className={`w-7 h-7 rounded-full border-2 border-gray-200 dark:border-slate-600 hover:scale-110 transition-transform ${
                      color.value === '#000000'
                        ? 'bg-black'
                        : color.value === '#4B5563'
                          ? 'bg-gray-600'
                          : color.value === '#DC2626'
                            ? 'bg-red-600'
                            : color.value === '#EA580C'
                              ? 'bg-orange-600'
                              : color.value === '#16A34A'
                                ? 'bg-green-600'
                                : color.value === '#2563EB'
                                  ? 'bg-blue-600'
                                  : color.value === '#9333EA'
                                    ? 'bg-purple-600'
                                    : color.value === '#DB2777'
                                      ? 'bg-pink-600'
                                      : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        data-placeholder={placeholder || 'Write your article...'}
        className="w-full px-4 py-3 dark:bg-slate-700 dark:text-white focus:outline-none min-h-96 prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:dark:text-gray-500"
        role="textbox"
        aria-label="Article content editor"
        aria-multiline="true"
      />
    </div>
  );
}
