# 📘 News JSON Structure Documentation

## 📌 Introduction

This document defines the standardized JSON structure used to represent program entries in the system.  
Each program must follow this schema to ensure consistency, maintainability, and compatibility with the frontend and backend systems.

---

## 📚 Table of Contents

- Overview
- Required Fields
- Field Specifications
- News Tempalte HTML Design

---

## 🧱 Overview

Each news is represented as a single JSON object.

### Base Structure

```json
{
  "id": "NW-ID",
  "title": "News Title",
  "date": "YYYY-MM-DD",
  "desc": "<p>Short description of the program.<p>",
  "author": "Author Name",
  "tags": "tag",
  "sources": "https://example.com",
}
```

### Field Specifications

- id        => String
- title     => String
- date      => String
- author    => String
- tags      => String
- desc      => HTML(Tailwind Support)
- sources   => String

## News Tempalte HTML Design

- div/article (article)       => max-w-2xl mx-auto px-6 lg:px-0
- Header (h2)                 => text-sm uppercase tracking-[0.3em] mt-12 mb-4 font-sans font-medium
- line under the header       => w-12 h-[1px] bg-gray-300 mb-6
- p                           => mb-8 text-lg leading-loose
- UL/OL                       => space-y-4 mb-10 list-outside ml-6
- LI                          => text-lg leading-relaxed text-gray-800 pl-2
- Table                       => w-full border-collapse mb-12 text-left
- th                          => py-4 border-b-2 border-gray-900 text-xs uppercase tracking-widest font-semibold
- td                          => py-5 border-b border-gray-100 text-base leading-snug text-gray-700
- Blockqoute                  => border-l-4 border-gray-900 pl-8 my-12 italic text-2xl font-serif text-gray-900 leading-tight

### Sample Content

```html
<span class='font-sans font-medium text-gray-900 uppercase tracking-widest text-sm mr-3'>Panabo City —</span>
<p class='mb-8 text-lg leading-loose'>Introduction paragraph here</p>
<h2 class='text-sm uppercase tracking-[0.3em] mt-12 mb-4 font-sans font-medium'>Header</h2>
<div class='w-12 h-[1px] bg-gray-300 mb-6'></div> <!-- Underline below the header design -->
<p class='mb-8 text-lg leading-loose'>Content of the header</p>
<h2 class='text-sm uppercase tracking-[0.3em] mt-12 mb-4 font-sans font-medium'>Header</h2>
<div class='w-12 h-[1px] bg-gray-300 mb-6'></div> <!-- Underline below the header design -->
<p class='mb-8 text-lg leading-loose'>Content of the header</p>
<h2 class='text-sm uppercase tracking-[0.3em] mt-12 mb-4 font-sans font-medium'>Header</h2>
<div class='w-12 h-[1px] bg-gray-300 mb-6'></div> <!-- Underline below the header design -->
<p class='mb-8 text-lg leading-loose'>Content of the header</p>
```
