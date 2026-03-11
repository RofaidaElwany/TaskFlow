import { PluginDocumentSettingPanel } from "@wordpress/editor";
import React from "react";

jest.mock('@wordpress/editor', () => ({
  PluginDocumentSettingPanel: ({ title, children }) => <div><h3>{title}</h3>{children}</div>,
}));

jest.mock('@wordpress/components', () => ({
    PanelBody: ({ children }) => <div>{children}</div>,
    Spinner: () => <div>Loading...</div>,
    Modal: ({ children }) => <div>{children}</div>,
    Button: ({ children, onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled}>
        {children}
        </button>
    ),
    ComboboxControl: ({ value, options, onChange }) => (
        <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        >
        {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
            {opt.label}
            </option>
        ))}
        </select>
    ),
    TextControl: ({ label, value, onChange }) => (
        <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        />
    ),
    }));



